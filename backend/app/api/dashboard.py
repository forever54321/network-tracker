from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.device import Device
from app.models.session import Session
from app.models.traffic_log import TrafficLog
from app.models.application import Application
from app.schemas.dashboard import DashboardOverview, TrafficTimeline, TrafficPoint, TimelineEntry
from app.schemas.device import DeviceResponse
from app.schemas.application import ApplicationUsage, ApplicationResponse
from app.api.deps import get_current_user
from app.utils.device_categories import get_device_group, get_group_label, GROUP_LABELS

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/overview", response_model=DashboardOverview)
async def get_overview(db: AsyncSession = Depends(get_db)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total_devices = (await db.execute(select(func.count(Device.id)))).scalar()
    online_devices = (await db.execute(
        select(func.count(Device.id)).where(Device.is_online == True)
    )).scalar()

    # Bandwidth from sessions
    bw_result = await db.execute(
        select(
            func.coalesce(func.sum(Session.bytes_sent), 0),
            func.coalesce(func.sum(Session.bytes_received), 0),
        ).where(Session.started_at >= today_start)
    )
    bw = bw_result.one()
    total_upload = bw[0]
    total_download = bw[1]

    # Top 10 devices by bytes
    top_devices_result = await db.execute(
        select(Device)
        .join(Session, Session.device_id == Device.id)
        .where(Session.started_at >= today_start)
        .group_by(Device.id)
        .order_by(func.sum(Session.bytes_sent + Session.bytes_received).desc())
        .limit(10)
    )
    top_devices = [DeviceResponse.model_validate(d) for d in top_devices_result.scalars().all()]

    # Top applications - rank by query count (DNS hits), then by bytes
    top_apps_result = await db.execute(
        select(
            Application,
            func.sum(TrafficLog.bytes_sent + TrafficLog.bytes_received).label("total_bytes"),
            func.count(TrafficLog.id).label("query_count"),
        )
        .join(TrafficLog, TrafficLog.application_id == Application.id)
        .where(TrafficLog.timestamp >= today_start)
        .group_by(Application.id)
        .order_by(func.count(TrafficLog.id).desc())
        .limit(10)
    )
    top_apps = []
    for app_row in top_apps_result:
        top_apps.append(ApplicationUsage(
            application=ApplicationResponse.model_validate(app_row[0]),
            total_time_seconds=0,
            total_bytes=app_row[1] or 0,
            query_count=app_row[2] or 0,
        ))

    return DashboardOverview(
        total_devices=total_devices,
        online_devices=online_devices,
        total_bandwidth_today=total_upload + total_download,
        total_upload_today=total_upload,
        total_download_today=total_download,
        top_devices=top_devices,
        top_applications=top_apps,
    )


@router.get("/devices-by-usage")
async def get_devices_by_usage(
    hours: int = Query(24, ge=1, le=720),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    # Get all devices with session stats
    result = await db.execute(
        select(
            Device,
            func.coalesce(func.sum(Session.bytes_sent), 0).label("total_sent"),
            func.coalesce(func.sum(Session.bytes_received), 0).label("total_received"),
            func.count(Session.id).label("session_count"),
        )
        .outerjoin(Session, and_(Session.device_id == Device.id, Session.started_at >= cutoff))
        .group_by(Device.id)
        .order_by(func.coalesce(func.sum(Session.bytes_sent + Session.bytes_received), 0).desc())
    )

    now = datetime.now(timezone.utc)
    devices = []
    for row in result:
        device = row[0]
        # Calculate time from sessions
        sess_result = await db.execute(
            select(Session).where(
                and_(Session.device_id == device.id, Session.started_at >= cutoff)
            )
        )
        total_time = 0
        for sess in sess_result.scalars():
            if sess.ended_at:
                total_time += sess.duration_seconds or 0
            else:
                total_time += int((now - sess.started_at).total_seconds())

        devices.append({
            "device": DeviceResponse.model_validate(device).model_dump(mode="json"),
            "total_time_seconds": total_time,
            "total_bytes_sent": int(row[1] or 0),
            "total_bytes_received": int(row[2] or 0),
            "session_count": int(row[3] or 0),
        })

    # Sort by time
    devices.sort(key=lambda x: x["total_time_seconds"], reverse=True)
    return devices


@router.get("/devices-by-category")
async def get_devices_by_category(
    hours: int = Query(24, ge=1, le=720),
    db: AsyncSession = Depends(get_db),
):
    """Get devices grouped by category with usage stats."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(
            Device,
            func.coalesce(func.sum(Session.bytes_sent), 0).label("total_sent"),
            func.coalesce(func.sum(Session.bytes_received), 0).label("total_received"),
            func.count(Session.id).label("session_count"),
        )
        .outerjoin(Session, and_(Session.device_id == Device.id, Session.started_at >= cutoff))
        .group_by(Device.id)
    )

    groups: dict[str, dict] = {}
    for row in result:
        device = row[0]
        category = device.device_type or "Unknown"
        group_key = get_device_group(category)
        group_label = get_group_label(group_key)

        if group_key not in groups:
            groups[group_key] = {
                "group": group_key,
                "label": group_label,
                "devices": [],
                "total_bytes": 0,
                "total_time_seconds": 0,
                "online_count": 0,
                "device_count": 0,
            }

        # Calculate usage time
        sess_result = await db.execute(
            select(Session).where(
                and_(Session.device_id == device.id, Session.started_at >= cutoff)
            )
        )
        total_time = 0
        for sess in sess_result.scalars():
            if sess.ended_at:
                total_time += sess.duration_seconds or 0
            else:
                total_time += int((now - sess.started_at).total_seconds())

        total_bytes = int((row[1] or 0) + (row[2] or 0))

        dev_data = DeviceResponse.model_validate(device).model_dump(mode="json")
        dev_data["usage_seconds"] = total_time
        dev_data["usage_bytes"] = total_bytes

        groups[group_key]["devices"].append(dev_data)
        groups[group_key]["total_bytes"] += total_bytes
        groups[group_key]["total_time_seconds"] += total_time
        groups[group_key]["device_count"] += 1
        if device.is_online:
            groups[group_key]["online_count"] += 1

    # Sort devices within each group by usage time
    for g in groups.values():
        g["devices"].sort(key=lambda d: d["usage_seconds"], reverse=True)

    # Sort groups by total_time
    sorted_groups = sorted(groups.values(), key=lambda g: g["total_time_seconds"], reverse=True)
    return sorted_groups


@router.get("/traffic-timeline", response_model=TrafficTimeline)
async def get_traffic_timeline(
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
):
    import time as _time
    from app.services.unifi_client import unifi_client

    now_ms = int(_time.time()) * 1000
    start_ms = now_ms - (hours * 3600 * 1000)

    # Use hourly interval for 24h+, 5min for shorter
    interval = "hourly" if hours >= 6 else "5minutes"
    stats = await unifi_client.get_traffic_stats(start_ms, now_ms, interval)

    points = []
    if stats:
        interval_seconds = 3600 if interval == "hourly" else 300
        for i, entry in enumerate(stats):
            # Try to get timestamp from response, otherwise calculate from start time
            ts = entry.get("datetime") or entry.get("time")
            if ts:
                timestamp = datetime.fromtimestamp(ts / 1000 if ts > 1e12 else ts, tz=timezone.utc).isoformat()
            else:
                # Calculate timestamp based on position in the array
                bucket_time = datetime.fromtimestamp(start_ms / 1000 + i * interval_seconds, tz=timezone.utc)
                timestamp = bucket_time.isoformat()
            points.append(TrafficPoint(
                timestamp=timestamp,
                bytes_sent=int(entry.get("wan-tx_bytes", 0)),
                bytes_received=int(entry.get("wan-rx_bytes", 0)),
            ))

    # Fallback to DB if UniFi returned nothing
    if not points:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        result = await db.execute(
            select(
                func.date_trunc("hour", TrafficLog.timestamp).label("bucket"),
                func.sum(TrafficLog.bytes_sent).label("sent"),
                func.sum(TrafficLog.bytes_received).label("received"),
            )
            .where(TrafficLog.timestamp >= cutoff)
            .group_by("bucket")
            .order_by("bucket")
        )
        for row in result:
            points.append(TrafficPoint(
                timestamp=row[0].isoformat() if row[0] else "",
                bytes_sent=row[1] or 0,
                bytes_received=row[2] or 0,
            ))

    return TrafficTimeline(points=points)


@router.get("/activity-timeline")
async def get_activity_timeline(
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    result = await db.execute(
        select(Session, Device)
        .join(Device, Session.device_id == Device.id)
        .where(Session.started_at >= cutoff)
        .order_by(Session.started_at.desc())
        .limit(100)
    )

    entries = []
    for session, device in result:
        entries.append(TimelineEntry(
            device_id=str(device.id),
            device_name=device.friendly_name or device.hostname or device.mac_address,
            started_at=session.started_at.isoformat(),
            ended_at=session.ended_at.isoformat() if session.ended_at else datetime.now(timezone.utc).isoformat(),
            duration_seconds=session.duration_seconds or int((datetime.now(timezone.utc) - session.started_at).total_seconds()),
        ))

    return entries


@router.post("/force-dns-renewal")
async def force_dns_renewal():
    """Force all clients to reconnect, triggering DHCP renewal to pick up new DNS settings."""
    from app.services.unifi_client import unifi_client

    # First check what DNS settings networks are advertising
    networks = await unifi_client.get_all_networks()
    dns_info = []
    for net in networks:
        if net.get("purpose") == "corporate" or net.get("purpose") == "vlan-only":
            dns_info.append({
                "name": net.get("name"),
                "id": net.get("_id"),
                "dhcpd_dns_enabled": net.get("dhcpd_dns_enabled", False),
                "dhcpd_dns_1": net.get("dhcpd_dns_1", "not set"),
                "dhcpd_dns_2": net.get("dhcpd_dns_2", "not set"),
            })

    # Force reconnect all clients
    result = await unifi_client.reconnect_all_clients()
    result["networks"] = dns_info

    return result


@router.get("/dpi-status")
async def get_dpi_status(db: AsyncSession = Depends(get_db)):
    """Check DPI data availability and syslog listener status."""
    from app.services.unifi_client import unifi_client
    from app.services.dns_logger import get_stats
    from app.services.dns_proxy import get_dns_stats

    # Check if we have any traffic logs with applications
    app_log_count = (await db.execute(
        select(func.count(TrafficLog.id)).where(TrafficLog.application_id != None)
    )).scalar() or 0

    app_count = (await db.execute(select(func.count(Application.id)))).scalar() or 0

    # Check DPI availability from UniFi
    dpi_data = await unifi_client.get_client_dpi()
    dpi_available = len(dpi_data) > 0

    syslog_stats = get_stats()
    dns_stats = get_dns_stats()

    dns_active = dns_stats["total_queries"] > 0

    return {
        "dpi_available": dpi_available,
        "dns_proxy_active": dns_active,
        "dpi_client_count": len(dpi_data),
        "applications_tracked": app_count,
        "traffic_logs_with_apps": app_log_count,
        "syslog": syslog_stats,
        "dns_proxy": dns_stats,
        "message": (
            "DPI data is flowing" if dpi_available
            else "DNS proxy is capturing app data" if dns_active
            else "Waiting for devices to use DNS proxy. Apps will appear as devices renew DHCP leases."
        ),
    }
