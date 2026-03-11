import logging

from app.database import async_session
from app.services.unifi_client import unifi_client
from app.services.device_tracker import sync_devices
from app.services.session_manager import update_sessions

logger = logging.getLogger(__name__)


async def poll_clients_task():
    try:
        clients = await unifi_client.get_clients()

        async with async_session() as db:
            await sync_devices(db)
            await update_sessions(db, clients)
            await db.commit()

        logger.debug("Poll clients complete: %d clients", len(clients))
    except Exception as e:
        logger.error("Error polling clients: %s", e)
