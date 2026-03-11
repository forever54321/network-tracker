import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.tasks.poll_clients import poll_clients_task
from app.tasks.poll_traffic import poll_traffic_task
from app.tasks.retention_cleanup import retention_cleanup_task

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    scheduler.add_job(
        poll_clients_task,
        "interval",
        seconds=settings.POLL_INTERVAL_SECONDS,
        id="poll_clients",
        replace_existing=True,
    )

    scheduler.add_job(
        poll_traffic_task,
        "interval",
        seconds=60,
        id="poll_traffic",
        replace_existing=True,
    )

    scheduler.add_job(
        retention_cleanup_task,
        "cron",
        hour=2,
        minute=0,
        id="retention_cleanup",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started with %d jobs", len(scheduler.get_jobs()))


def stop_scheduler():
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")
