from __future__ import annotations

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .clients.adzuna import AdzunaClient
from .clients.reed import ReedClient
from .config import JobsConfig
from .models.job import JobListing

logger = logging.getLogger(__name__)

_scheduler = AsyncIOScheduler()


def start(config: JobsConfig) -> None:
    """Register jobs and start the scheduler. Call once at app startup."""

    _scheduler.add_job(
        _fetch_reed,
        trigger="interval",
        hours=24,
        args=[config],
        id="reed_fetch",
        name="Reed — fetch TPM jobs",
        replace_existing=True,
    )

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
        "Scheduler started — Reed every 24 h, Adzuna every 23 h"
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


async def _store(jobs: list[JobListing]) -> None:
    """
    Persist jobs to the database.
    TODO: implement once the DB layer is ready (Phase B).
    """
    logger.debug("_store called with %d jobs — DB layer not yet implemented", len(jobs))
