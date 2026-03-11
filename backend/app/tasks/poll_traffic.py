import logging

from app.database import async_session
from app.services.traffic_collector import collect_dpi_data

logger = logging.getLogger(__name__)


async def poll_traffic_task():
    try:
        async with async_session() as db:
            await collect_dpi_data(db)
            await db.commit()
        logger.debug("Traffic data collection complete")
    except Exception as e:
        logger.error("Error collecting traffic data: %s", e)
