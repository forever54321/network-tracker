import logging

from app.database import async_session
from app.services.data_retention import aggregate_and_cleanup

logger = logging.getLogger(__name__)


async def retention_cleanup_task():
    try:
        async with async_session() as db:
            await aggregate_and_cleanup(db)
            await db.commit()
        logger.info("Retention cleanup complete")
    except Exception as e:
        logger.error("Error during retention cleanup: %s", e)
