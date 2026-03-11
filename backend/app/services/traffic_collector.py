import logging
import time
from datetime import datetime, timezone

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.models.session import Session
from app.models.traffic_log import TrafficLog
from app.services.unifi_client import unifi_client
from app.services.app_identifier import identify_app, get_or_create_application
from app.utils.unifi_app_mappings import get_app_name_from_unifi

logger = logging.getLogger(__name__)


async def collect_traffic_data(db: AsyncSession) -> None:
    """Collect per-client traffic data from UniFi and update sessions."""
    now_ms = int(time.time()) * 1000
    hour_ago = now_ms - 3600000

    client_stats = await unifi_client.get_client_traffic_stats(hour_ago, now_ms)
    if not client_stats:
        return

    now = datetime.now(timezone.utc)
    updated = 0

    for entry in client_stats:
        mac = entry.get("user", "").lower()
        tx = int(entry.get("tx_bytes", 0))
        rx = int(entry.get("rx_bytes", 0))

        if not mac or (tx == 0 and rx == 0):
            continue

        result = await db.execute(select(Device).where(Device.mac_address == mac))
        device = result.scalar_one_or_none()
        if not device:
            continue

        # Update open session with traffic data
        result = await db.execute(
            select(Session).where(
                and_(Session.device_id == device.id, Session.ended_at == None)
            )
        )
        open_session = result.scalar_one_or_none()
        if open_session:
            open_session.bytes_sent = max(open_session.bytes_sent, tx)
            open_session.bytes_received = max(open_session.bytes_received, rx)
            updated += 1

    await db.flush()
    if updated > 0:
        logger.info("Updated traffic for %d devices from %d stats entries", updated, len(client_stats))


async def collect_dpi_data(db: AsyncSession) -> None:
    """Collect DPI data from UniFi and create traffic logs with app mapping."""
    dpi_data = await unifi_client.get_client_dpi()
    if not dpi_data:
        # DPI not available, try collecting traffic stats instead
        await collect_traffic_data(db)
        return

    now = datetime.now(timezone.utc)
    logs_created = 0

    for entry in dpi_data:
        mac = entry.get("mac", "").lower()
        if not mac:
            continue

        result = await db.execute(select(Device).where(Device.mac_address == mac))
        device = result.scalar_one_or_none()
        if not device:
            continue

        result = await db.execute(
            select(Session).where(
                and_(Session.device_id == device.id, Session.ended_at == None)
            )
        )
        open_session = result.scalar_one_or_none()

        by_app = entry.get("by_app", [])
        for app_entry in by_app:
            app_tx = app_entry.get("tx_bytes", 0)
            app_rx = app_entry.get("rx_bytes", 0)
            cat_id = app_entry.get("cat", 255)
            app_id_num = app_entry.get("app", 0)

            if app_tx == 0 and app_rx == 0:
                continue

            application_id = None
            app_info = get_app_name_from_unifi(cat_id, app_id_num)
            if app_info:
                app_name, category = app_info
                application_id = await get_or_create_application(db, app_name, category)

            log = TrafficLog(
                device_id=device.id,
                session_id=open_session.id if open_session else None,
                application_id=application_id,
                timestamp=now,
                bytes_sent=app_tx,
                bytes_received=app_rx,
            )
            db.add(log)
            logs_created += 1

        if not by_app:
            by_cat = entry.get("by_cat", [])
            for cat_entry in by_cat:
                cat_tx = cat_entry.get("tx_bytes", 0)
                cat_rx = cat_entry.get("rx_bytes", 0)
                cat_id = cat_entry.get("cat", 255)

                if cat_tx == 0 and cat_rx == 0:
                    continue

                application_id = None
                app_info = get_app_name_from_unifi(cat_id, 0)
                if app_info:
                    app_name, category = app_info
                    application_id = await get_or_create_application(db, app_name, category)

                log = TrafficLog(
                    device_id=device.id,
                    session_id=open_session.id if open_session else None,
                    application_id=application_id,
                    timestamp=now,
                    bytes_sent=cat_tx,
                    bytes_received=cat_rx,
                )
                db.add(log)
                logs_created += 1

    await db.flush()
    if logs_created > 0:
        logger.info("Created %d traffic logs from DPI data", logs_created)


async def log_dns_traffic(
    db: AsyncSession,
    device_mac: str,
    domain: str,
    bytes_sent: int = 0,
    bytes_received: int = 0,
    protocol: str = "UDP",
) -> None:
    """Log a DNS-based traffic entry."""
    result = await db.execute(select(Device).where(Device.mac_address == device_mac.lower()))
    device = result.scalar_one_or_none()
    if not device:
        return

    result = await db.execute(
        select(Session).where(
            and_(Session.device_id == device.id, Session.ended_at == None)
        )
    )
    open_session = result.scalar_one_or_none()

    app_name = identify_app(domain)
    app_id = None
    if app_name:
        app_id = await get_or_create_application(db, app_name)

    log = TrafficLog(
        device_id=device.id,
        session_id=open_session.id if open_session else None,
        application_id=app_id,
        timestamp=datetime.now(timezone.utc),
        domain=domain,
        bytes_sent=bytes_sent,
        bytes_received=bytes_received,
        protocol=protocol,
    )
    db.add(log)
    await db.flush()
