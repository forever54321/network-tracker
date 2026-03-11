import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api import auth, devices, sessions, applications, dashboard
from app.tasks.scheduler import start_scheduler, stop_scheduler
from app.services.unifi_client import unifi_client
from app.services.dns_logger import start_syslog_listener
from app.services.dns_proxy import start_dns_proxy

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

syslog_transport = None
dns_proxy_transport = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global syslog_transport, dns_proxy_transport

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Authenticate with UniFi
    await unifi_client.authenticate()

    # Start background tasks
    start_scheduler()

    # Start DNS syslog listener
    syslog_transport = await start_syslog_listener()

    # Start DNS proxy for app identification
    dns_proxy_transport = await start_dns_proxy()

    logger.info("Application started")
    yield

    # Shutdown
    stop_scheduler()
    if syslog_transport:
        syslog_transport.close()
    if dns_proxy_transport:
        dns_proxy_transport.close()
    await unifi_client.close()
    await engine.dispose()
    logger.info("Application stopped")


app = FastAPI(
    title="Network Device & Application Usage Monitor",
    description="Monitor network devices, sessions, and application usage via UniFi integration",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(devices.router)
app.include_router(sessions.router)
app.include_router(applications.router)
app.include_router(dashboard.router)


@app.get("/api/health")
async def health_check():
    from app.services.dns_logger import get_stats
    from app.services.dns_proxy import get_dns_stats
    return {"status": "ok", "syslog": get_stats(), "dns_proxy": get_dns_stats()}
