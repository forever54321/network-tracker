import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.services.unifi_client import unifi_client
from app.utils.device_categories import get_device_category

logger = logging.getLogger(__name__)


async def sync_devices(db: AsyncSession) -> list[Device]:
    clients = await unifi_client.get_clients()
    if not clients:
        return []

    online_macs = set()
    devices = []

    for client_data in clients:
        mac = client_data.get("mac", "").lower()
        if not mac:
            continue
        online_macs.add(mac)

        result = await db.execute(select(Device).where(Device.mac_address == mac))
        device = result.scalar_one_or_none()

        now = datetime.now(timezone.utc)

        # Determine device type from UniFi fingerprinting
        dev_cat = client_data.get("dev_cat")
        vendor = client_data.get("oui")
        device_type = get_device_category(dev_cat, vendor)

        if device is None:
            device = Device(
                mac_address=mac,
                hostname=client_data.get("hostname") or client_data.get("name"),
                ip_address=client_data.get("ip"),
                vendor=vendor,
                device_type=device_type,
                connection_type="wifi" if client_data.get("is_wired") is False else "ethernet",
                is_online=True,
                first_seen=now,
                last_seen=now,
            )
            db.add(device)
        else:
            device.hostname = client_data.get("hostname") or client_data.get("name") or device.hostname
            device.ip_address = client_data.get("ip") or device.ip_address
            device.vendor = vendor or device.vendor
            device.device_type = device_type if device_type != "Unknown" else (device.device_type or device_type)
            device.connection_type = "wifi" if client_data.get("is_wired") is False else "ethernet"
            device.is_online = True
            device.last_seen = now

        devices.append(device)

    # Mark devices not in current client list as offline
    result = await db.execute(
        select(Device).where(Device.is_online == True, Device.mac_address.notin_(online_macs))
    )
    offline_devices = result.scalars().all()
    for device in offline_devices:
        device.is_online = False

    await db.flush()
    logger.info("Synced %d online devices, %d went offline", len(devices), len(offline_devices))
    return devices
