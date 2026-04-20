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

from .clients.adzuna import AdzunaClient
from .clients.reed import ReedClient
from .config import JobsConfig
from .scheduler import _store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)

logger = logging.getLogger(__name__)


async def main() -> None:
    config = JobsConfig()  # type: ignore[call-arg]

    logger.info("Run-once fetch started")

    reed = ReedClient(api_key=config.reed_api_key)
    adzuna = AdzunaClient(app_id=config.adzuna_app_id, app_key=config.adzuna_app_key)

    reed_jobs = await reed.fetch_all(config.search_keywords, config.search_location)
    logger.info("Reed: %d jobs fetched", len(reed_jobs))

    adzuna_jobs = await adzuna.fetch_all(config.search_keywords, config.search_location)
    logger.info("Adzuna: %d jobs fetched", len(adzuna_jobs))

    await _store(reed_jobs + adzuna_jobs)
    logger.info("Run-once fetch complete")


if __name__ == "__main__":
    asyncio.run(main())
