"""
Orchestrator — Cron.

Wires up all agent schedules using APScheduler AsyncIOScheduler.
All jobs run within one shared event loop — avoids asyncpg connection pool issues.
- Email tracker: runs immediately on startup, then every N hours
- Profile agent: every 6 hours (Phase 2)
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from ..config import AgentConfig
from .runner import _run_email_tracker, _run_market_analyst

logger = logging.getLogger(__name__)
config = AgentConfig()  # type: ignore[call-arg]


def start_scheduler() -> None:
    """Start the async scheduler — runs until the process is stopped."""
    asyncio.run(_start())


async def _start() -> None:
    scheduler = AsyncIOScheduler()

    scheduler.add_job(
        func=_run_email_tracker,
        trigger=IntervalTrigger(hours=config.email_tracker_interval_hours),  # type: ignore[call-arg]
        id="email_tracker",
        name="Email Tracker Agent",
        max_instances=1,
        replace_existing=True,
        next_run_time=datetime.now(timezone.utc),  # run immediately on startup
    )

    # Market analyst — every Monday at 6am UTC
    scheduler.add_job(
        func=_run_market_analyst,
        trigger="cron",
        day_of_week="mon",
        hour=6,
        minute=0,
        timezone="UTC",
        id="market_analyst",
        name="Market Analyst Agent",
        max_instances=1,
        replace_existing=True,
    )

    scheduler.start()
    logger.info(
        "Scheduler started — email_tracker every %d hour(s), market_analyst every Monday 6am UTC",
        config.email_tracker_interval_hours,
    )

    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Scheduler stopped")
