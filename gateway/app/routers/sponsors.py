from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.sponsor import Sponsor, SponsorStat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sponsors", tags=["sponsors"])


# ── Response schemas ───────────────────────────────────────────────────────────

class StatEntry(BaseModel):
    label: str
    count: int


class ActiveSponsorsResponse(BaseModel):
    routes_2plus: int
    routes_3plus: int
    routes_4plus: int
    routes_5plus: int
    routes_6plus: int


class SponsorStatsResponse(BaseModel):
    total_entries: int
    unique_orgs: int
    a_rated_count: int
    b_rated_count: int
    active_sponsors: ActiveSponsorsResponse
    by_city: list[StatEntry]
    by_route: list[StatEntry]


class SponsorResponse(BaseModel):
    organisation_name: str
    town: str | None
    county: str | None
    rating_raw: str | None
    rating: str | None
    route: str

    model_config = {"from_attributes": True}


class SponsorsListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[SponsorResponse]


# ── GET /api/sponsors/stats ────────────────────────────────────────────────────

@router.get("/stats", response_model=SponsorStatsResponse)
async def get_sponsor_stats(db: AsyncSession = Depends(get_session)) -> SponsorStatsResponse:
    """
    Returns pre-aggregated sponsor statistics from sponsor_stats table.
    Used to populate dashboard stat cards and charts.
    """
    result = await db.execute(select(SponsorStat))
    rows = result.scalars().all()

    totals: dict[str, int] = {}
    active: dict[str, int] = {}
    by_city: list[StatEntry] = []
    by_route: list[StatEntry] = []

    for row in rows:
        if row.stat_key == "totals":
            totals[row.label] = row.count
        elif row.stat_key == "active_sponsors":
            active[row.label] = row.count
        elif row.stat_key == "by_city":
            by_city.append(StatEntry(label=row.label, count=row.count))
        elif row.stat_key == "by_route":
            by_route.append(StatEntry(label=row.label, count=row.count))

    return SponsorStatsResponse(
        total_entries=totals.get("total_entries", 0),
        unique_orgs=totals.get("unique_orgs", 0),
        a_rated_count=totals.get("a_rated_count", 0),
        b_rated_count=totals.get("b_rated_count", 0),
        active_sponsors=ActiveSponsorsResponse(
            routes_2plus=active.get("2plus", 0),
            routes_3plus=active.get("3plus", 0),
            routes_4plus=active.get("4plus", 0),
            routes_5plus=active.get("5plus", 0),
            routes_6plus=active.get("6plus", 0),
        ),
        by_city=sorted(by_city, key=lambda x: x.count, reverse=True),
        by_route=sorted(by_route, key=lambda x: x.count, reverse=True),
    )


# ── GET /api/sponsors ──────────────────────────────────────────────────────────

@router.get("", response_model=SponsorsListResponse)
async def get_sponsors(
    q: str | None = Query(None, description="Search by organisation name"),
    route: str | None = Query(None, description="Filter by visa route"),
    rating: str | None = Query(None, description="Filter by rating: A or B"),
    min_routes: int | None = Query(None, ge=2, le=6, description="Min number of distinct routes sponsored"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
    db: AsyncSession = Depends(get_session),
) -> SponsorsListResponse:
    """
    Paginated, filterable list of sponsors from the raw sponsors table.
    """
    stmt = select(Sponsor)
    count_stmt = select(func.count()).select_from(Sponsor)

    if q:
        stmt = stmt.where(Sponsor.organisation_name.ilike(f"%{q}%"))
        count_stmt = count_stmt.where(Sponsor.organisation_name.ilike(f"%{q}%"))
    if route:
        stmt = stmt.where(Sponsor.route == route)
        count_stmt = count_stmt.where(Sponsor.route == route)
    if rating:
        stmt = stmt.where(Sponsor.rating == rating.upper())
        count_stmt = count_stmt.where(Sponsor.rating == rating.upper())
    if min_routes:
        subq = (
            select(Sponsor.organisation_name)
            .group_by(Sponsor.organisation_name)
            .having(func.count(func.distinct(Sponsor.route)) >= min_routes)
            .subquery()
        )
        stmt = stmt.where(Sponsor.organisation_name.in_(select(subq)))
        count_stmt = count_stmt.where(Sponsor.organisation_name.in_(select(subq)))

    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        stmt.order_by(Sponsor.organisation_name)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(stmt)
    sponsors = result.scalars().all()

    return SponsorsListResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=list(sponsors),
    )
