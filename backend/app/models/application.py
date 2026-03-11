import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[str | None] = mapped_column(String(50))
    icon_url: Mapped[str | None] = mapped_column(String(255))
    domain_patterns: Mapped[dict | None] = mapped_column(JSONB, default=list)

    traffic_logs = relationship("TrafficLog", back_populates="application", lazy="noload")
    daily_aggregates = relationship("DailyAggregate", back_populates="application", lazy="noload")
