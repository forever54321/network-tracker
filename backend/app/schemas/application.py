from uuid import UUID

from pydantic import BaseModel


class ApplicationResponse(BaseModel):
    id: UUID
    name: str
    category: str | None
    icon_url: str | None

    class Config:
        from_attributes = True


class ApplicationUsage(BaseModel):
    application: ApplicationResponse
    total_time_seconds: int = 0
    total_bytes: int = 0
    query_count: int = 0


class ApplicationUsageList(BaseModel):
    applications: list[ApplicationUsage]
