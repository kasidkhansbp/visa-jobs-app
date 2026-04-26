"""
One-shot fetch — used by Railway cron job.
Fetches from Reed and Adzuna, stores results in DB, then exits.

Railway railway.toml:
    [deploy]
    cronSchedule = "0 2 * * *"
    startCommand = "python -m jobs.run_once"
"""
from __future__ import annotations

import asyncio
import logging
import os
import subprocess
import sys

from .clients.adzuna import AdzunaClient
from .clients.reed import ReedClient
from .config import JobsConfig
from .ingest_sponsors import _match_jobs
from .scheduler import _store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)

logger = logging.getLogger(__name__)


def _run_migrations() -> None:
    logger.info("Running DB migrations")
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd="/app/shared",
        env={**os.environ, "PYTHONPATH": "/app"},
        capture_output=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Migrations failed with exit code {result.returncode}")
    logger.info("Migrations complete")


async def main() -> None:
    config = JobsConfig()  # type: ignore[call-arg]

    _run_migrations()
    logger.info("Run-once fetch started")

    reed = ReedClient(api_key=config.reed_api_key)
    adzuna = AdzunaClient(app_id=config.adzuna_app_id, app_key=config.adzuna_app_key)

    all_jobs = []

    try:
        reed_jobs = await reed.fetch_all(config.search_keywords, config.search_location)
        logger.info("Reed: %d jobs fetched", len(reed_jobs))
        all_jobs.extend(reed_jobs)
    except Exception:
        logger.exception("Reed fetch failed — skipping")

    try:
        adzuna_jobs = await adzuna.fetch_all(config.search_keywords, config.search_location)
        logger.info("Adzuna: %d jobs fetched", len(adzuna_jobs))
        all_jobs.extend(adzuna_jobs)
    except Exception:
        logger.exception("Adzuna fetch failed — skipping")

    await _store(all_jobs)
    logger.info("Run-once fetch complete — %d jobs stored", len(all_jobs))

    await _match_jobs(full_reset=False)
    logger.info("Sponsor matching complete")


if __name__ == "__main__":
    asyncio.run(main())
