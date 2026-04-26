from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.cv_file import CvFile
from shared.db.models.cv_share import CvShare
from shared.db.models.job import Job
from shared.db.models.user import User
from ..auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_EMAIL = "kasidkhan@gmail.com"


class UserStats(BaseModel):
    total: int
    new_this_week: int
    new_this_month: int


class JobStats(BaseModel):
    total: int
    added_this_week: int
    by_source: dict[str, int]
    sponsor_verified: int
    frequent_sponsor: int


class CvStats(BaseModel):
    total_cvs: int
    active_share_links: int
    total_cv_views: int


class AdminStatsOut(BaseModel):
    users: UserStats
    jobs: JobStats
    cvs: CvStats


@router.get("/stats", response_model=AdminStatsOut)
async def get_stats(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> AdminStatsOut:
    if current_user.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Forbidden")

    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    one_month_ago = now - timedelta(days=30)

    # ── Users ────────────────────────────────────────────────────
    total_users = await session.scalar(select(func.count(User.id))) or 0

    new_this_week = await session.scalar(
        select(func.count(User.id)).where(User.created_at >= one_week_ago)
    ) or 0

    new_this_month = await session.scalar(
        select(func.count(User.id)).where(User.created_at >= one_month_ago)
    ) or 0

    # ── Jobs ─────────────────────────────────────────────────────
    total_jobs = await session.scalar(select(func.count(Job.id))) or 0

    jobs_this_week = await session.scalar(
        select(func.count(Job.id)).where(Job.fetched_at >= one_week_ago)
    ) or 0

    source_rows = await session.execute(
        select(Job.source, func.count(Job.id)).group_by(Job.source)
    )
    by_source = {row[0]: row[1] for row in source_rows}

    sponsor_verified = await session.scalar(
        select(func.count(Job.id)).where(Job.is_sponsor_verified.is_(True))
    ) or 0

    frequent_sponsor = await session.scalar(
        select(func.count(Job.id)).where(Job.is_frequent_sponsor.is_(True))
    ) or 0

    # ── CVs ──────────────────────────────────────────────────────
    total_cvs = await session.scalar(select(func.count(CvFile.id))) or 0

    active_shares = await session.scalar(select(func.count(CvShare.id))) or 0

    total_views = await session.scalar(select(func.coalesce(func.sum(CvShare.view_count), 0))) or 0

    return AdminStatsOut(
        users=UserStats(
            total=total_users,
            new_this_week=new_this_week,
            new_this_month=new_this_month,
        ),
        jobs=JobStats(
            total=total_jobs,
            added_this_week=jobs_this_week,
            by_source=by_source,
            sponsor_verified=sponsor_verified,
            frequent_sponsor=frequent_sponsor,
        ),
        cvs=CvStats(
            total_cvs=total_cvs,
            active_share_links=active_shares,
            total_cv_views=total_views,
        ),
    )
