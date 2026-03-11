from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class DeviceResponse(BaseModel):
    id: UUID
    mac_address: str
    hostname: str | None
    friendly_name: str | None
    ip_address: str | None
    vendor: str | None
    device_type: str | None
    connection_type: str | None
    is_online: bool
    first_seen: datetime
    last_seen: datetime
    usage_seconds: int = 0
    usage_bytes: int = 0

    class Config:
        from_attributes = True


class DeviceUpdate(BaseModel):
    friendly_name: str | None = None
    device_type: str | None = None


class DeviceListResponse(BaseModel):
    devices: list[DeviceResponse]
    total: int
    page: int
    per_page: int
