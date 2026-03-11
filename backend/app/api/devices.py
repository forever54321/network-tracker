from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.device import Device
from app.models.session import Session
from app.models.traffic_log import TrafficLog
from app.models.application import Application
from app.schemas.device import DeviceResponse, DeviceUpdate, DeviceListResponse
from app.schemas.session import SessionResponse, SessionListResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/devices", tags=["devices"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=DeviceListResponse)
async def list_devices(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    online_only: bool = Query(False),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Device)
    count_query = select(func.count(Device.id))

    if online_only:
        query = query.where(Device.is_online == True)
        count_query = count_query.where(Device.is_online == True)

    if search:
        pattern = f"%{search}%"
        filter_cond = (
            Device.hostname.ilike(pattern)
            | Device.friendly_name.ilike(pattern)
            | Device.mac_address.ilike(pattern)
            | Device.ip_address.ilike(pattern)
        )
        query = query.where(filter_cond)
        count_query = count_query.where(filter_cond)

    total = (await db.execute(count_query)).scalar()
    result = await db.execute(
        query.order_by(Device.is_online.desc(), Device.last_seen.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    devices = result.scalars().all()

    return DeviceListResponse(
        devices=[DeviceResponse.model_validate(d) for d in devices],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(device_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.patch("/{device_id}", response_model=DeviceResponse)
async def update_device(device_id: UUID, data: DeviceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if data.friendly_name is not None:
        device.friendly_name = data.friendly_name
    if data.device_type is not None:
        device.device_type = data.device_type

    await db.flush()
    return device


@router.get("/{device_id}/sessions", response_model=SessionListResponse)
async def get_device_sessions(
    device_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    count = (await db.execute(
        select(func.count(Session.id)).where(Session.device_id == device_id)
    )).scalar()

    result = await db.execute(
        select(Session)
        .where(Session.device_id == device_id)
        .order_by(Session.started_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    sessions = result.scalars().all()

    return SessionListResponse(
        sessions=[SessionResponse.model_validate(s) for s in sessions],
        total=count,
        page=page,
        per_page=per_page,
    )


@router.get("/{device_id}/applications")
async def get_device_applications(
    device_id: UUID,
    hours: int = Query(24, ge=1, le=720),
    db: AsyncSession = Depends(get_db),
):
    """Get applications detected for a specific device."""
    # Verify device exists
    device = (await db.execute(select(Device).where(Device.id == device_id))).scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    result = await db.execute(
        select(
            Application.id,
            Application.name,
            Application.category,
            Application.icon_url,
            func.count(TrafficLog.id).label("query_count"),
            func.sum(TrafficLog.bytes_sent + TrafficLog.bytes_received).label("total_bytes"),
            func.min(TrafficLog.timestamp).label("first_seen"),
            func.max(TrafficLog.timestamp).label("last_seen"),
        )
        .join(TrafficLog, TrafficLog.application_id == Application.id)
        .where(TrafficLog.device_id == device_id)
        .where(TrafficLog.timestamp >= cutoff)
        .group_by(Application.id, Application.name, Application.category, Application.icon_url)
        .order_by(func.count(TrafficLog.id).desc())
        .limit(50)
    )

    apps = []
    for row in result:
        apps.append({
            "id": str(row[0]),
            "name": row[1],
            "category": row[2],
            "icon_url": row[3],
            "query_count": row[4],
            "total_bytes": int(row[5] or 0),
            "first_seen": row[6].isoformat() if row[6] else None,
            "last_seen": row[7].isoformat() if row[7] else None,
        })

    # Also get recent domains (even unmatched ones) for this device
    domain_result = await db.execute(
        select(
            TrafficLog.domain,
            func.count(TrafficLog.id).label("count"),
        )
        .where(TrafficLog.device_id == device_id)
        .where(TrafficLog.timestamp >= cutoff)
        .where(TrafficLog.domain != None)
        .group_by(TrafficLog.domain)
        .order_by(func.count(TrafficLog.id).desc())
        .limit(30)
    )

    domains = [{"domain": row[0], "count": row[1]} for row in domain_result]

    return {"applications": apps, "domains": domains}
