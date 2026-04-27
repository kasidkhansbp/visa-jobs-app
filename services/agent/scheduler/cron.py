"""
Orchestrator — Cron.

Wires up all agent schedules using APScheduler.
- Email tracker: every 1 hour
- Profile agent: every 6 hours (Phase 2)
"""
from __future__ import annotations

import logging

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

from ..config import AgentConfig
from .runner import run_email_tracker

logger = logging.getLogger(__name__)
config = AgentConfig()  # type: ignore[call-arg]


def start_scheduler() -> None:
    """Start the blocking scheduler — runs until the process is stopped."""
    scheduler = BlockingScheduler()

    scheduler.add_job(
        func=run_email_tracker,
        trigger=IntervalTrigger(hours=config.email_tracker_interval_hours),
        id="email_tracker",
        name="Email Tracker Agent",
        max_instances=1,        # prevent overlap if a run takes longer than 1 hour
        replace_existing=True,
    )

    logger.info(
        "Scheduler started — email_tracker every %d hour(s)",
        config.email_tracker_interval_hours,
    )

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped")
