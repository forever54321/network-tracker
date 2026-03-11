from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.application import Application
from app.models.traffic_log import TrafficLog
from app.models.daily_aggregate import DailyAggregate
from app.models.device import Device
from app.schemas.application import ApplicationResponse, ApplicationUsage
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/applications", tags=["applications"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_applications(
    days: int = Query(7, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            Application,
            func.coalesce(func.sum(TrafficLog.bytes_sent + TrafficLog.bytes_received), 0).label("total_bytes"),
            func.count(TrafficLog.id).label("query_count"),
            func.count(func.distinct(TrafficLog.device_id)).label("device_count"),
        )
        .outerjoin(TrafficLog, and_(
            TrafficLog.application_id == Application.id,
            TrafficLog.timestamp >= cutoff,
        ))
        .group_by(Application.id)
        .having(func.count(TrafficLog.id) > 0)
        .order_by(func.count(TrafficLog.id).desc())
    )

    apps = []
    for row in result:
        app = row[0]
        apps.append({
            "application": ApplicationResponse.model_validate(app).model_dump(mode="json"),
            "total_bytes": int(row[1] or 0),
            "query_count": int(row[2] or 0),
            "device_count": int(row[3] or 0),
            "total_time_seconds": 0,
        })

    return {"applications": apps}


@router.get("/{app_id}")
async def get_application(app_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.id == app_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse.model_validate(app)


@router.get("/{app_id}/history")
async def get_application_history(
    app_id: UUID,
    hours: int = Query(24, ge=1, le=720),
    db: AsyncSession = Depends(get_db),
):
    """Get usage history for an application: which devices used it and when."""
    app = (await db.execute(select(Application).where(Application.id == app_id))).scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    # Devices that used this app
    device_result = await db.execute(
        select(
            Device.id,
            Device.hostname,
            Device.friendly_name,
            Device.mac_address,
            Device.ip_address,
            Device.is_online,
            Device.device_type,
            func.count(TrafficLog.id).label("query_count"),
            func.sum(TrafficLog.bytes_sent + TrafficLog.bytes_received).label("total_bytes"),
            func.min(TrafficLog.timestamp).label("first_seen"),
            func.max(TrafficLog.timestamp).label("last_seen"),
        )
        .join(TrafficLog, TrafficLog.device_id == Device.id)
        .where(TrafficLog.application_id == app_id)
        .where(TrafficLog.timestamp >= cutoff)
        .group_by(Device.id, Device.hostname, Device.friendly_name, Device.mac_address,
                  Device.ip_address, Device.is_online, Device.device_type)
        .order_by(func.count(TrafficLog.id).desc())
    )

    devices = []
    for row in device_result:
        devices.append({
            "id": str(row[0]),
            "name": row[2] or row[1] or row[3],
            "hostname": row[1],
            "mac_address": row[3],
            "ip_address": row[4],
            "is_online": row[5],
            "device_type": row[6],
            "query_count": row[7],
            "total_bytes": int(row[8] or 0),
            "first_seen": row[9].isoformat() if row[9] else None,
            "last_seen": row[10].isoformat() if row[10] else None,
        })

    # Domains accessed for this app
    domain_result = await db.execute(
        select(
            TrafficLog.domain,
            func.count(TrafficLog.id).label("count"),
        )
        .where(TrafficLog.application_id == app_id)
        .where(TrafficLog.timestamp >= cutoff)
        .where(TrafficLog.domain != None)
        .group_by(TrafficLog.domain)
        .order_by(func.count(TrafficLog.id).desc())
        .limit(20)
    )
    domains = [{"domain": row[0], "count": row[1]} for row in domain_result]

    # Hourly activity timeline
    bucket_size = "hour" if hours <= 48 else "day"
    timeline_result = await db.execute(
        select(
            func.date_trunc(bucket_size, TrafficLog.timestamp).label("bucket"),
            func.count(TrafficLog.id).label("count"),
            func.count(func.distinct(TrafficLog.device_id)).label("devices"),
        )
        .where(TrafficLog.application_id == app_id)
        .where(TrafficLog.timestamp >= cutoff)
        .group_by("bucket")
        .order_by("bucket")
    )
    timeline = [
        {
            "timestamp": row[0].isoformat() if row[0] else "",
            "query_count": row[1],
            "device_count": row[2],
        }
        for row in timeline_result
    ]

    return {
        "application": ApplicationResponse.model_validate(app).model_dump(mode="json"),
        "devices": devices,
        "domains": domains,
        "timeline": timeline,
        "total_queries": sum(d["query_count"] for d in devices),
        "total_devices": len(devices),
    }
