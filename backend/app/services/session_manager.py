import logging
from datetime import datetime, timezone

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.models.session import Session

logger = logging.getLogger(__name__)

# Track last known bytes per device to compute deltas
_last_bytes: dict[str, tuple[int, int]] = {}


async def update_sessions(db: AsyncSession, unifi_clients: list[dict]) -> None:
    now = datetime.now(timezone.utc)
    online_macs = set()

    for client_data in unifi_clients:
        mac = client_data.get("mac", "").lower()
        if not mac:
            continue
        online_macs.add(mac)

        result = await db.execute(select(Device).where(Device.mac_address == mac))
        device = result.scalar_one_or_none()
        if not device:
            continue

        # Check for open session
        result = await db.execute(
            select(Session).where(
                and_(Session.device_id == device.id, Session.ended_at == None)
            )
        )
        open_session = result.scalar_one_or_none()

        tx_bytes = client_data.get("tx_bytes", 0)
        rx_bytes = client_data.get("rx_bytes", 0)

        if open_session is None:
            # Start new session
            session = Session(
                device_id=device.id,
                started_at=now,
                bytes_sent=0,
                bytes_received=0,
            )
            db.add(session)
            _last_bytes[mac] = (tx_bytes, rx_bytes)
        else:
            # Update existing session with byte deltas
            last_tx, last_rx = _last_bytes.get(mac, (tx_bytes, rx_bytes))
            delta_tx = max(0, tx_bytes - last_tx)
            delta_rx = max(0, rx_bytes - last_rx)
            open_session.bytes_sent += delta_tx
            open_session.bytes_received += delta_rx
            _last_bytes[mac] = (tx_bytes, rx_bytes)

    # Close sessions for devices that went offline
    result = await db.execute(
        select(Session).join(Device).where(
            and_(
                Session.ended_at == None,
                Device.mac_address.notin_(online_macs) if online_macs else True,
            )
        )
    )
    open_sessions = result.scalars().all()
    for session in open_sessions:
        session.ended_at = now
        session.duration_seconds = int((now - session.started_at).total_seconds())
        logger.info("Closed session %s (duration: %ds)", session.id, session.duration_seconds)

    await db.flush()
