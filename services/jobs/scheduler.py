from __future__ import annotations

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.dialects.postgresql import insert

from db.connection import AsyncSessionLocal
from db.models.job import Job

from .clients.adzuna import AdzunaClient
from .clients.reed import ReedClient
from .config import JobsConfig
from .models.job import JobListing

logger = logging.getLogger(__name__)

_scheduler = AsyncIOScheduler()


def start(config: JobsConfig) -> None:
    """Register jobs and start the scheduler. Call once at app startup."""

    # paused: Reed returning 403
    # _scheduler.add_job(
    #     _fetch_reed,
    #     trigger="interval",
    #     hours=24,
    #     args=[config],
    #     id="reed_fetch",
    #     name="Reed — fetch TPM jobs",
    #     replace_existing=True,
    # )

    _scheduler.add_job(
        _fetch_adzuna,
        trigger="interval",
        hours=23,
        args=[config],
        id="adzuna_fetch",
        name="Adzuna — fetch TPM jobs",
        replace_existing=True,
    )

    _scheduler.start()
    logger.info(
        "Scheduler started — Adzuna every 23 h (Reed paused)"
    )


def stop() -> None:
    """Gracefully shut down the scheduler. Call on app shutdown."""
    _scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")


async def _fetch_reed(config: JobsConfig) -> None:
    logger.info("Reed fetch started")
    try:
        client = ReedClient(api_key=config.reed_api_key)
        jobs = await client.fetch_all(config.search_keywords, config.search_location)
        await _store(jobs)
        logger.info("Reed fetch complete — %d jobs", len(jobs))
    except Exception:
        logger.exception("Reed fetch failed")


async def _fetch_adzuna(config: JobsConfig) -> None:
    logger.info("Adzuna fetch started")
    try:
        client = AdzunaClient(
            app_id=config.adzuna_app_id,
            app_key=config.adzuna_app_key,
        )
        jobs = await client.fetch_all(config.search_keywords, config.search_location)
        await _store(jobs)
        logger.info("Adzuna fetch complete — %d jobs", len(jobs))
    except Exception:
        logger.exception("Adzuna fetch failed")


_CHUNK_SIZE = 500  # stays well under PostgreSQL's 65535 parameter limit

# ── Title filtering ────────────────────────────────────────────────────────────

_EXACT_TITLES = {t.lower() for t in [
    "Technical Program Manager",
    "Senior Technical Program Manager",
    "Staff Technical Program Manager",
    "Principal Technical Program Manager",
    "Engineering Program Manager",
    "Senior Engineering Program Manager",
]}

_PHRASE_MATCHES = [t.lower() for t in [
    "Program Manager",
    "Programme Manager",
]]

_EXCLUDE_KEYWORDS = [t.lower() for t in [
    "Project Manager",
    "Mechanical",
    "Electrical",
    "Construction",
    "Design",
    "Fitness",
    "Nurse",
    "Sales",
    "Room",
    "Driver",
    "Surveyor",
    "Planner",
    "Site Manager",
    "Trainer",
    "Commissioning",
    "Bid Manager",
    "Commercial",
    "Contracts",
    "Risk Manager",
]]


def _is_relevant(title: str) -> bool:
    """Return True if the job title is a TPM-relevant role."""
    t = title.lower().strip()

    # Exact match — always include
    if t in _EXACT_TITLES:
        return True

    # Phrase match — include unless an exclude keyword is present
    for phrase in _PHRASE_MATCHES:
        if phrase in t:
            for excl in _EXCLUDE_KEYWORDS:
                if excl in t:
                    return False
            return True

    return False


async def _store(jobs: list[JobListing]) -> None:
    if not jobs:
        return

    # Filter to relevant TPM roles only
    before = len(jobs)
    jobs = [j for j in jobs if _is_relevant(j.title)]
    logger.info("Title filter: %d → %d jobs (removed %d irrelevant titles)", before, len(jobs), before - len(jobs))

    if not jobs:
        return

    rows = [
        {
            "source": job.source,
            "job_id": job.job_id,
            "title": job.title,
            "employer_name": job.employer_name,
            "location": job.location,
            "description": job.description,
            "url": job.url,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "contract_type": job.contract_type,
            "job_type": job.job_type,
            "posted_at": job.created_at,
            "fetched_at": datetime.now(timezone.utc),
        }
        for job in jobs
    ]

    async with AsyncSessionLocal() as session:
        for i in range(0, len(rows), _CHUNK_SIZE):
            chunk = rows[i: i + _CHUNK_SIZE]
            stmt = insert(Job).values(chunk).on_conflict_do_nothing(
                index_elements=["source", "job_id"]
            )
            await session.execute(stmt)
        await session.commit()

    logger.info("Stored %d jobs (duplicates skipped)", len(rows))
