from pydantic import BaseModel

from app.schemas.device import DeviceResponse
from app.schemas.application import ApplicationUsage


class DashboardOverview(BaseModel):
    total_devices: int
    online_devices: int
    total_bandwidth_today: int
    total_upload_today: int
    total_download_today: int
    top_devices: list[DeviceResponse]
    top_applications: list[ApplicationUsage]


class TimelineEntry(BaseModel):
    device_id: str
    device_name: str
    started_at: str
    ended_at: str
    duration_seconds: int


class TrafficPoint(BaseModel):
    timestamp: str
    bytes_sent: int
    bytes_received: int


class TrafficTimeline(BaseModel):
    points: list[TrafficPoint]
