import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.utils.domain_mappings import DOMAIN_MAP, CATEGORY_MAP

logger = logging.getLogger(__name__)

_app_cache: dict[str, UUID] = {}


def identify_app(domain: str) -> str | None:
    if not domain:
        return None

    domain = domain.lower().rstrip(".")

    # Direct match
    if domain in DOMAIN_MAP:
        return DOMAIN_MAP[domain]

    # Strip subdomains progressively
    parts = domain.split(".")
    for i in range(1, len(parts)):
        parent = ".".join(parts[i:])
        if parent in DOMAIN_MAP:
            return DOMAIN_MAP[parent]

    return None


async def get_or_create_application(db: AsyncSession, app_name: str, category: str | None = None) -> UUID:
    if app_name in _app_cache:
        return _app_cache[app_name]

    result = await db.execute(select(Application).where(Application.name == app_name))
    app = result.scalar_one_or_none()

    if app is None:
        app = Application(
            name=app_name,
            category=category or CATEGORY_MAP.get(app_name),
        )
        db.add(app)
        await db.flush()

    _app_cache[app_name] = app.id
    return app.id
