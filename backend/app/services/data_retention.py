import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.traffic_log import TrafficLog
from app.models.session import Session
from app.models.daily_aggregate import DailyAggregate

logger = logging.getLogger(__name__)

TRAFFIC_LOG_RETENTION_DAYS = 30
SESSION_RETENTION_DAYS = 365
BATCH_SIZE = 10000


async def aggregate_and_cleanup(db: AsyncSession) -> None:
    now = datetime.now(timezone.utc)
    cutoff_traffic = now - timedelta(days=TRAFFIC_LOG_RETENTION_DAYS)
    cutoff_sessions = now - timedelta(days=SESSION_RETENTION_DAYS)

    # Aggregate old traffic logs into daily_aggregates
    old_logs = await db.execute(
        select(
            TrafficLog.device_id,
            TrafficLog.application_id,
            func.date(TrafficLog.timestamp).label("date"),
            func.sum(TrafficLog.bytes_sent).label("total_sent"),
            func.sum(TrafficLog.bytes_received).label("total_received"),
            func.count().label("log_count"),
        )
        .where(TrafficLog.timestamp < cutoff_traffic)
        .group_by(TrafficLog.device_id, TrafficLog.application_id, func.date(TrafficLog.timestamp))
    )

    for row in old_logs:
        existing = await db.execute(
            select(DailyAggregate).where(
                and_(
                    DailyAggregate.device_id == row.device_id,
                    DailyAggregate.application_id == row.application_id,
                    DailyAggregate.date == row.date,
                )
            )
        )
        agg = existing.scalar_one_or_none()
        if agg:
            agg.total_bytes_sent += row.total_sent or 0
            agg.total_bytes_received += row.total_received or 0
        else:
            agg = DailyAggregate(
                device_id=row.device_id,
                application_id=row.application_id,
                date=row.date,
                total_bytes_sent=row.total_sent or 0,
                total_bytes_received=row.total_received or 0,
            )
            db.add(agg)

    await db.flush()

    # Delete old traffic logs in batches
    deleted = 0
    while True:
        result = await db.execute(
            delete(TrafficLog)
            .where(TrafficLog.timestamp < cutoff_traffic)
            .execution_options(synchronize_session=False)
        )
        batch_deleted = result.rowcount
        deleted += batch_deleted
        if batch_deleted < BATCH_SIZE:
            break

    logger.info("Deleted %d old traffic logs", deleted)

    # Delete old sessions
    result = await db.execute(
        delete(Session)
        .where(and_(Session.ended_at != None, Session.ended_at < cutoff_sessions))
        .execution_options(synchronize_session=False)
    )
    logger.info("Deleted %d old sessions", result.rowcount)

    await db.flush()
