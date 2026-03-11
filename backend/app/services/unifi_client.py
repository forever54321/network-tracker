import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class UniFiClient:
    def __init__(self):
        self.base_url = f"https://{settings.UNIFI_HOST}"
        self.site = settings.UNIFI_SITE
        self._client: httpx.AsyncClient | None = None
        self._authenticated = False
        self._csrf_token: str = ""

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                verify=settings.UNIFI_VERIFY_SSL,
                timeout=30.0,
            )
        return self._client

    async def authenticate(self) -> bool:
        client = await self._get_client()
        try:
            response = await client.post(
                "/api/auth/login",
                json={
                    "username": settings.UNIFI_USERNAME,
                    "password": settings.UNIFI_PASSWORD,
                },
            )
            if response.status_code == 200:
                self._authenticated = True
                # Extract CSRF token from response headers
                self._csrf_token = response.headers.get("x-csrf-token", "")
                if not self._csrf_token:
                    self._csrf_token = response.headers.get("x-updated-csrf-token", "")
                logger.info("Successfully authenticated with UniFi controller (CSRF: %s)", bool(self._csrf_token))
                return True
            logger.error("UniFi auth failed: %s", response.status_code)
            return False
        except httpx.HTTPError as e:
            logger.error("UniFi connection error: %s", e)
            return False

    def _get_headers(self) -> dict:
        headers = {}
        if self._csrf_token:
            headers["x-csrf-token"] = self._csrf_token
        return headers

    async def _request(self, method: str, path: str, **kwargs) -> dict | None:
        client = await self._get_client()
        # Always include CSRF token
        headers = kwargs.pop("headers", {})
        headers.update(self._get_headers())
        kwargs["headers"] = headers
        try:
            response = await getattr(client, method)(path, **kwargs)
            if response.status_code == 401 or response.status_code == 403:
                if await self.authenticate():
                    kwargs["headers"].update(self._get_headers())
                    response = await getattr(client, method)(path, **kwargs)
                else:
                    return None
            if response.status_code == 200:
                return response.json()
            logger.error("UniFi API error %s: %s", response.status_code, path)
            return None
        except httpx.HTTPError as e:
            logger.error("UniFi request error: %s", e)
            return None

    async def get_clients(self) -> list[dict[str, Any]]:
        data = await self._request("get", f"/proxy/network/api/s/{self.site}/stat/sta")
        if data and "data" in data:
            return data["data"]
        return []

    async def get_all_known_clients(self) -> list[dict[str, Any]]:
        data = await self._request("get", f"/proxy/network/api/s/{self.site}/stat/alluser")
        if data and "data" in data:
            return data["data"]
        return []

    async def get_client_dpi(self) -> list[dict[str, Any]]:
        """Get per-client DPI (Deep Packet Inspection) data."""
        data = await self._request("post", f"/proxy/network/api/s/{self.site}/stat/stadpi",
                                   json={"type": "by_app"})
        if data and "data" in data:
            return data["data"]
        return []

    async def get_site_dpi(self) -> list[dict[str, Any]]:
        """Get site-level DPI data."""
        data = await self._request("post", f"/proxy/network/api/s/{self.site}/stat/sitedpi",
                                   json={"type": "by_app"})
        if data and "data" in data:
            return data["data"]
        return []

    async def get_traffic_stats(self, start: int, end: int, interval: str = "5minutes") -> list[dict[str, Any]]:
        """Get traffic statistics for a time range.

        Args:
            start: Start time in milliseconds
            end: End time in milliseconds
            interval: '5minutes', 'hourly', or 'daily'
        """
        data = await self._request(
            "post",
            f"/proxy/network/api/s/{self.site}/stat/report/{interval}.site",
            json={"attrs": ["bytes", "wlan_bytes", "num_sta", "wan-tx_bytes", "wan-rx_bytes"], "start": start, "end": end},
        )
        if data and "data" in data:
            return data["data"]
        return []

    async def get_client_traffic_stats(self, start: int, end: int) -> list[dict[str, Any]]:
        """Get per-client traffic statistics."""
        data = await self._request(
            "post",
            f"/proxy/network/api/s/{self.site}/stat/report/daily.user",
            json={"attrs": ["tx_bytes", "rx_bytes"], "start": start, "end": end},
        )
        if data and "data" in data:
            return data["data"]
        return []

    async def reconnect_client(self, mac: str) -> bool:
        """Force a client to reconnect (triggers DHCP renewal)."""
        data = await self._request(
            "post",
            f"/proxy/network/api/s/{self.site}/cmd/stamgr",
            json={"cmd": "kick-sta", "mac": mac.lower()},
        )
        return data is not None

    async def reconnect_all_clients(self) -> dict:
        """Reconnect all online clients to force DHCP renewal."""
        clients = await self.get_clients()
        kicked = 0
        failed = 0
        for client in clients:
            mac = client.get("mac", "")
            if not mac:
                continue
            ok = await self.reconnect_client(mac)
            if ok:
                kicked += 1
            else:
                failed += 1
        logger.info("Reconnected %d clients (%d failed)", kicked, failed)
        return {"kicked": kicked, "failed": failed, "total": len(clients)}

    async def get_network_config(self, network_id: str) -> dict | None:
        """Get a network's configuration."""
        data = await self._request("get", f"/proxy/network/api/s/{self.site}/rest/networkconf/{network_id}")
        if data and "data" in data and data["data"]:
            return data["data"][0]
        return None

    async def get_all_networks(self) -> list[dict]:
        """Get all network configurations."""
        data = await self._request("get", f"/proxy/network/api/s/{self.site}/rest/networkconf")
        if data and "data" in data:
            return data["data"]
        return []

    async def update_network_dns(self, network_id: str, dns1: str, dns2: str = "") -> bool:
        """Update DHCP DNS settings for a network."""
        payload = {"dhcpd_dns_enabled": True, "dhcpd_dns_1": dns1}
        if dns2:
            payload["dhcpd_dns_2"] = dns2
        data = await self._request(
            "put",
            f"/proxy/network/api/s/{self.site}/rest/networkconf/{network_id}",
            json=payload,
        )
        return data is not None

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None
            self._authenticated = False
            self._csrf_token = ""


unifi_client = UniFiClient()
