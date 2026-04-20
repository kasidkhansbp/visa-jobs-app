from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.job import Job

logger = logging.getLogger(__name__)

from sqlalchemy import text

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/ping")
async def ping_db(db: AsyncSession = Depends(get_session)):
    try:
        await asyncio.wait_for(db.execute(text("SELECT 1")), timeout=5.0)
        return {"db": "ok"}
    except asyncio.TimeoutError:
        return {"db": "timeout - connection hanging"}
    except Exception as e:
        logger.error("DB ping failed: %s", e, exc_info=True)
        return {"db": f"error: {e}"}


# ── Response schema ────────────────────────────────────────────────────────────

class JobResponse(BaseModel):
    id: uuid.UUID
    source: str
    job_id: str
    title: str
    employer_name: str
    location: str
    description: str
    url: str
    salary_min: float | None
    salary_max: float | None
    contract_type: str | None
    job_type: str | None

    model_config = {"from_attributes": True}


# ── GET /api/jobs ──────────────────────────────────────────────────────────────

@router.get("", response_model=list[JobResponse])
async def get_jobs(
    source: str | None = Query(None, description="Filter by source: reed or adzuna"),
    title: str | None = Query(None, description="Filter by job title (partial match)"),
    location: str | None = Query(None, description="Filter by location (partial match)"),
    posted_from: datetime | None = Query(None, description="Filter jobs posted from this date (ISO 8601)"),
    posted_to: datetime | None = Query(None, description="Filter jobs posted up to this date (ISO 8601)"),
    limit: int = Query(50, le=200, description="Max results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_session),
) -> list[Job]:
    """
    Return job listings from the DB.
    All filter parameters are optional and can be combined.
    """
    stmt = select(Job)

    if source:
        stmt = stmt.where(Job.source == source)
    if title:
        stmt = stmt.where(Job.title.ilike(f"%{title}%"))
    if location:
        stmt = stmt.where(Job.location.ilike(f"%{location}%"))
    if posted_from:
        stmt = stmt.where(Job.posted_at >= posted_from)
    if posted_to:
        stmt = stmt.where(Job.posted_at <= posted_to)

    stmt = stmt.order_by(
        Job.posted_at.desc().nulls_last(),  # latest posted first, nulls at end
        Job.fetched_at.desc(),              # fallback: latest fetched
    ).offset(offset).limit(limit)

    try:
        result = await db.execute(stmt)
        return list(result.scalars().all())
    except Exception as e:
        logger.error("DB query failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── DELETE /api/jobs/{id} ──────────────────────────────────────────────────────

@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_session),
) -> None:
    """
    Delete a single job by its UUID.
    Returns 404 if the job does not exist.
    """
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.execute(delete(Job).where(Job.id == job_id))
    await db.commit()
