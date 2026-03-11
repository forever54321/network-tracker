"""
DNS Proxy Server - intercepts DNS queries from network devices,
identifies applications from domain names, and forwards to upstream DNS via DoH.
"""
import asyncio
import logging
import socket
import struct
import time
from collections import defaultdict
from datetime import datetime, timezone

import httpx
from dnslib import DNSRecord

from app.config import settings
from app.database import async_session
from app.services.app_identifier import identify_app, get_or_create_application
from app.models.device import Device
from app.models.session import Session
from app.models.traffic_log import TrafficLog

logger = logging.getLogger(__name__)

# DNS over HTTPS endpoint (port 443, bypasses port 53 interception)
DOH_URL = "https://1.1.1.1/dns-query"
DNS_PORT = 53

# Batch queries to reduce DB writes
_query_batch: dict[tuple[str, str], int] = defaultdict(int)  # (ip, domain) -> count
_batch_lock = asyncio.Lock()
_stats = {"total_queries": 0, "app_matches": 0, "forwarded": 0, "errors": 0}
_source_ips: dict[str, int] = defaultdict(int)  # track all source IPs
_recent_domains: dict[str, list[str]] = defaultdict(list)  # ip -> last N domains

# Shared httpx client for DoH
_doh_client: httpx.AsyncClient | None = None


async def _get_doh_client() -> httpx.AsyncClient:
    global _doh_client
    if _doh_client is None:
        _doh_client = httpx.AsyncClient(
            timeout=5.0,
            verify=True,
        )
    return _doh_client


class DNSProxyProtocol(asyncio.DatagramProtocol):
    def __init__(self):
        self.transport = None
        self._pending: dict[int, tuple] = {}  # query_id -> (addr, timestamp)

    def connection_made(self, transport):
        self.transport = transport
        logger.info("DNS Proxy started on port %d, forwarding via DoH to %s", DNS_PORT, DOH_URL)

    def datagram_received(self, data: bytes, addr: tuple):
        _stats["total_queries"] += 1
        client_ip = addr[0]
        _source_ips[client_ip] += 1

        try:
            # Parse the DNS query
            request = DNSRecord.parse(data)
            query_name = str(request.q.qname).rstrip(".")
            query_type = request.q.qtype

            # Skip internal/infrastructure queries
            if not query_name or query_name.endswith(".local") or query_name.endswith(".arpa") or query_name.endswith(".lan"):
                asyncio.get_event_loop().create_task(
                    self._doh_forward(data, addr)
                )
                return

            # Track recent domains per IP for debugging
            recent = _recent_domains[client_ip]
            if query_name not in recent:
                recent.append(query_name)
                if len(recent) > 50:
                    recent.pop(0)

            # Log the query for app identification
            asyncio.get_event_loop().create_task(
                self._log_query(client_ip, query_name)
            )

            if _stats["total_queries"] <= 50 or _stats["total_queries"] % 200 == 0:
                logger.info("DNS: %s -> %s (app=%s)", client_ip, query_name, identify_app(query_name))

        except Exception as e:
            _stats["errors"] += 1
            if _stats["errors"] <= 5:
                logger.error("DNS parse error: %s", e)

        # Forward via DoH (async)
        asyncio.get_event_loop().create_task(
            self._doh_forward(data, addr)
        )

    async def _doh_forward(self, data: bytes, client_addr: tuple):
        """Forward DNS query via DNS over HTTPS and send response back to client."""
        try:
            client = await _get_doh_client()
            response = await client.post(
                DOH_URL,
                content=data,
                headers={
                    "Content-Type": "application/dns-message",
                    "Accept": "application/dns-message",
                },
            )
            if response.status_code == 200:
                self.transport.sendto(response.content, client_addr)
                _stats["forwarded"] += 1
                if _stats["forwarded"] <= 5:
                    logger.info("DoH OK: %d bytes -> %s (response %d bytes)", len(data), client_addr, len(response.content))
            else:
                _stats["errors"] += 1
                if _stats["errors"] <= 10:
                    logger.error("DoH error: HTTP %d - %s", response.status_code, response.text[:200])
        except Exception as e:
            _stats["errors"] += 1
            if _stats["errors"] <= 10:
                logger.error("DoH forward error to %s: %s", client_addr, e)

    async def _log_query(self, client_ip: str, domain: str):
        """Batch the DNS query for later processing."""
        async with _batch_lock:
            _query_batch[(client_ip, domain)] += 1


async def flush_dns_queries():
    """Process batched DNS queries - identify apps and create traffic logs."""
    global _query_batch

    async with _batch_lock:
        if not _query_batch:
            return
        batch = dict(_query_batch)
        _query_batch = defaultdict(int)

    from sqlalchemy import select, and_

    async with async_session() as db:
        processed = 0
        apps_found = 0
        now = datetime.now(timezone.utc)

        # Gateway IPs - queries from these are on behalf of other devices
        gateway_ips = {"10.3.10.1", "10.3.1.1", "10.3.20.1", "10.3.30.1", "10.3.40.1"}

        for (client_ip, domain), count in batch.items():
            # Identify the application from domain
            app_name = identify_app(domain)
            if not app_name:
                continue

            apps_found += 1

            # Find the device by IP
            result = await db.execute(
                select(Device).where(Device.ip_address == client_ip)
            )
            device = result.scalar_one_or_none()

            if not device:
                if client_ip not in gateway_ips:
                    continue
                # Query from gateway - get or create a gateway device record
                gw_result = await db.execute(
                    select(Device).where(Device.mac_address == f"gw-{client_ip}")
                )
                device = gw_result.scalar_one_or_none()
                if not device:
                    device = Device(
                        mac_address=f"gw-{client_ip}",
                        hostname="UDM-Pro",
                        friendly_name="Network (all devices)",
                        ip_address=client_ip,
                        device_type="Network Equipment",
                        is_online=True,
                    )
                    db.add(device)
                    await db.flush()
                    logger.info("Created gateway device for %s", client_ip)

            # Get or create the application
            app_id = await get_or_create_application(db, app_name)

            # Find open session
            result = await db.execute(
                select(Session).where(
                    and_(Session.device_id == device.id, Session.ended_at == None)
                )
            )
            open_session = result.scalar_one_or_none()

            # Create traffic log
            log = TrafficLog(
                device_id=device.id,
                session_id=open_session.id if open_session else None,
                application_id=app_id,
                timestamp=now,
                domain=domain,
                bytes_sent=0,
                bytes_received=0,
                protocol="DNS",
            )
            db.add(log)
            processed += 1

        await db.commit()
        if processed > 0:
            _stats["app_matches"] += apps_found
            logger.info(
                "DNS batch: %d queries -> %d app matches -> %d traffic logs",
                len(batch), apps_found, processed,
            )


async def _periodic_flush():
    """Flush DNS query batch every 15 seconds."""
    while True:
        await asyncio.sleep(15)
        try:
            await flush_dns_queries()
        except Exception as e:
            logger.error("DNS flush error: %s", e)


async def start_dns_proxy():
    """Start the DNS proxy server."""
    loop = asyncio.get_event_loop()
    try:
        transport, protocol = await loop.create_datagram_endpoint(
            lambda: DNSProxyProtocol(),
            local_addr=("0.0.0.0", DNS_PORT),
        )
        logger.info("DNS Proxy listening on port %d (DoH upstream)", DNS_PORT)

        # Start periodic flush
        asyncio.create_task(_periodic_flush())

        return transport
    except PermissionError:
        logger.error(
            "Cannot bind to port %d - need admin/root privileges. "
            "Run the backend as Administrator to enable DNS proxy.", DNS_PORT
        )
        return None
    except OSError as e:
        logger.warning("DNS Proxy could not start: %s", e)
        return None


def get_dns_stats() -> dict:
    """Return DNS proxy statistics."""
    return {
        "total_queries": _stats["total_queries"],
        "app_matches": _stats["app_matches"],
        "forwarded": _stats["forwarded"],
        "errors": _stats["errors"],
        "pending_batch": len(_query_batch),
        "source_ips": dict(_source_ips),
        "recent_domains": {ip: domains for ip, domains in _recent_domains.items()},
    }
