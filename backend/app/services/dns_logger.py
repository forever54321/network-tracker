import asyncio
import logging
import re
from collections import defaultdict
from datetime import datetime, timezone

from app.config import settings
from app.database import async_session
from app.services.traffic_collector import log_dns_traffic

logger = logging.getLogger(__name__)

# dnsmasq format: query[A] youtube.com from 10.3.10.50
DNS_QUERY_PATTERN = re.compile(
    r"query\[(?P<type>\w+)\]\s+(?P<domain>\S+)\s+from\s+(?P<ip>\d+\.\d+\.\d+\.\d+)"
)

# Alternative format: DNS query from 10.3.10.50: youtube.com
DNS_ALT_PATTERN = re.compile(
    r"DNS\s+query\s+from\s+(?P<ip>\d+\.\d+\.\d+\.\d+).*?:\s*(?P<domain>\S+)"
)

# Generic syslog DNS patterns
DNS_GENERIC_PATTERN = re.compile(
    r"(?P<ip>\d+\.\d+\.\d+\.\d+).*?(?:query|request|lookup)\s+(?P<domain>[\w.-]+\.\w{2,})"
)

# Batch DNS queries to avoid flooding the DB
_dns_batch: dict[tuple[str, str], int] = defaultdict(int)
_batch_lock = asyncio.Lock()
_message_count = 0
_dns_count = 0


class SyslogProtocol(asyncio.DatagramProtocol):
    def connection_made(self, transport):
        self.transport = transport
        logger.info("Syslog listener started on port %d", settings.SYSLOG_PORT)

    def datagram_received(self, data: bytes, addr: tuple):
        global _message_count
        _message_count += 1
        try:
            message = data.decode("utf-8", errors="ignore")
            # Log first few messages for debugging
            if _message_count <= 5:
                logger.info("Syslog message #%d from %s: %s", _message_count, addr[0], message[:200])
            self._process_message(message, addr)
        except Exception as e:
            logger.error("Error processing syslog message: %s", e)

    def _process_message(self, message: str, addr: tuple):
        global _dns_count

        # Try each pattern
        match = DNS_QUERY_PATTERN.search(message)
        if not match:
            match = DNS_ALT_PATTERN.search(message)
        if not match:
            match = DNS_GENERIC_PATTERN.search(message)

        if match:
            domain = match.group("domain").lower().rstrip(".")
            client_ip = match.group("ip")

            # Skip internal/infrastructure domains
            if domain.endswith(".local") or domain.endswith(".arpa") or domain.endswith(".lan"):
                return

            _dns_count += 1
            if _dns_count <= 10:
                logger.info("DNS query: %s -> %s (total: %d)", client_ip, domain, _dns_count)

            asyncio.create_task(self._batch_query(client_ip, domain))

    async def _batch_query(self, client_ip: str, domain: str):
        async with _batch_lock:
            _dns_batch[(client_ip, domain)] += 1


async def flush_dns_batch():
    """Periodically flush batched DNS queries to the database."""
    global _dns_batch

    async with _batch_lock:
        if not _dns_batch:
            return
        batch = dict(_dns_batch)
        _dns_batch = defaultdict(int)

    if not batch:
        return

    from sqlalchemy import select
    from app.models.device import Device

    async with async_session() as db:
        processed = 0
        for (client_ip, domain), count in batch.items():
            result = await db.execute(
                select(Device).where(Device.ip_address == client_ip)
            )
            device = result.scalar_one_or_none()
            if device:
                await log_dns_traffic(db, device.mac_address, domain)
                processed += 1

        await db.commit()
        if processed > 0:
            logger.info("Flushed %d DNS entries from %d queries", processed, len(batch))


async def _periodic_flush():
    """Run flush every 30 seconds."""
    while True:
        await asyncio.sleep(30)
        try:
            await flush_dns_batch()
        except Exception as e:
            logger.error("Error flushing DNS batch: %s", e)


async def start_syslog_listener():
    loop = asyncio.get_event_loop()
    try:
        transport, protocol = await loop.create_datagram_endpoint(
            lambda: SyslogProtocol(),
            local_addr=("0.0.0.0", settings.SYSLOG_PORT),
        )
        logger.info("Syslog listener running on port %d", settings.SYSLOG_PORT)

        # Start periodic flush task
        asyncio.create_task(_periodic_flush())

        return transport
    except Exception as e:
        logger.warning("Could not start syslog listener: %s. DNS logging will be unavailable.", e)
        return None


def get_stats() -> dict:
    """Return syslog listener stats for debugging."""
    return {
        "total_messages": _message_count,
        "dns_queries": _dns_count,
        "pending_batch": len(_dns_batch),
    }
