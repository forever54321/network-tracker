from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.session import Session
from app.schemas.session import SessionResponse, SessionListResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/sessions", tags=["sessions"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    query = select(Session)
    count_query = select(func.count(Session.id))

    if start_date:
        query = query.where(Session.started_at >= start_date)
        count_query = count_query.where(Session.started_at >= start_date)

    if end_date:
        query = query.where(Session.started_at <= end_date)
        count_query = count_query.where(Session.started_at <= end_date)

    if active_only:
        query = query.where(Session.ended_at == None)
        count_query = count_query.where(Session.ended_at == None)

    total = (await db.execute(count_query)).scalar()
    result = await db.execute(
        query.order_by(Session.started_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    sessions = result.scalars().all()

    return SessionListResponse(
        sessions=[SessionResponse.model_validate(s) for s in sessions],
        total=total,
        page=page,
        per_page=per_page,
    )
