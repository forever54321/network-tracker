from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class SessionResponse(BaseModel):
    id: UUID
    device_id: UUID
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    bytes_sent: int
    bytes_received: int

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    sessions: list[SessionResponse]
    total: int
    page: int
    per_page: int
