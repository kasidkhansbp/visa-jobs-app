"""
Quick local test — fetches one keyword from Reed and Adzuna, prints results,
then stores them in the DB.

Run from the services/ directory:

    python -m jobs.test_fetch
"""
from __future__ import annotations

import asyncio
import json

from jobs.config import JobsConfig
from jobs.clients.reed import ReedClient
from jobs.clients.adzuna import AdzunaClient
from jobs.scheduler import _store


async def main() -> None:
    config = JobsConfig()  # type: ignore[call-arg]

    keywords = ["Technical Program Manager"]  # one keyword to keep it fast

    print("\n--- Reed ---")
    reed = ReedClient(api_key=config.reed_api_key)
    reed_jobs = await reed.fetch_all(keywords, config.search_location)
    print(f"Total jobs fetched: {len(reed_jobs)}")
    if reed_jobs:
        print("First result:")
        print(json.dumps(reed_jobs[0].model_dump(), indent=2, default=str))

    print("\n--- Adzuna ---")
    adzuna = AdzunaClient(app_id=config.adzuna_app_id, app_key=config.adzuna_app_key)
    adzuna_jobs = await adzuna.fetch_all(keywords, config.search_location)
    print(f"Total jobs fetched: {len(adzuna_jobs)}")
    if adzuna_jobs:
        print("First result:")
        print(json.dumps(adzuna_jobs[0].model_dump(), indent=2, default=str))

    all_jobs = reed_jobs + adzuna_jobs
    print(f"\n--- Storing {len(all_jobs)} jobs to DB ---")
    await _store(all_jobs)
    print("Done — check your DB for the results.")


if __name__ == "__main__":
    asyncio.run(main())
