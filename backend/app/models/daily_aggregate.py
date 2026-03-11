import uuid
from datetime import date

from sqlalchemy import BigInteger, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DailyAggregate(Base):
    __tablename__ = "daily_aggregates"
    __table_args__ = (
        UniqueConstraint("device_id", "application_id", "date", name="uq_daily_agg"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=False, index=True)
    application_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    total_bytes_sent: Mapped[int] = mapped_column(BigInteger, default=0)
    total_bytes_received: Mapped[int] = mapped_column(BigInteger, default=0)
    total_duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    session_count: Mapped[int] = mapped_column(Integer, default=0)

    device = relationship("Device", back_populates="daily_aggregates")
    application = relationship("Application", back_populates="daily_aggregates")
