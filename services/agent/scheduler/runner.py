"""
Orchestrator — Runner.

Fetches eligible users and runs the email tracker graph per user.
Handles errors per user — one user failing does not stop others.
"""
from __future__ import annotations

import logging

from datetime import date, timedelta

from shared.db.connection import AsyncSessionLocal
from ..agents.email_tracker.graph import email_tracker_graph
from ..agents.market_analyst.graph import market_analyst_graph
from ..db.queries import get_eligible_gmail_users, mark_gmail_token_invalid

logger = logging.getLogger(__name__)


async def _run_market_analyst() -> None:
    """Generate weekly market summary using Claude."""
    # week_start = most recent Monday
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    logger.info("market_analyst runner — generating summary for week %s", week_start)
    try:
        await market_analyst_graph.ainvoke({
            "week_start": str(week_start),
            "heatmap_data": [],
            "summary_text": "",
            "stored": False,
        })
        logger.info("market_analyst runner — completed for week %s", week_start)
    except Exception as e:
        logger.exception("market_analyst runner — failed: %s", e)


async def _run_email_tracker() -> None:
    """Fetch eligible users and run the graph for each one."""
    async with AsyncSessionLocal() as session:
        users = await get_eligible_gmail_users(session)

    if not users:
        logger.info("email_tracker runner — no eligible users, skipping")
        return

    logger.info("email_tracker runner — running for %d users", len(users))

    # TODO: switch to batch concurrency (asyncio.gather, batch_size=50) before general rollout
    for user in users:
        try:
            logger.info("email_tracker runner — starting for user_id=%s", user["user_id"])

            await email_tracker_graph.ainvoke({
                "user_id": str(user["user_id"]),
                "encrypted_refresh_token": user["encrypted_refresh_token"],
                "last_checked_at": user["last_checked_at"],
                "raw_emails": [],
                "classified_emails": [],
                "applications_written": 0,
            })

            logger.info("email_tracker runner — completed for user_id=%s", user["user_id"])

        except Exception as e:
            logger.exception(
                "email_tracker runner — failed for user_id=%s: %s",
                user["user_id"], str(e),
            )
            # If Google rejected the token, mark it invalid
            if "invalid_grant" in str(e).lower() or "token" in str(e).lower():
                async with AsyncSessionLocal() as session:
                    await mark_gmail_token_invalid(session, user["user_id"])
                logger.warning(
                    "email_tracker runner — token marked invalid for user_id=%s",
                    user["user_id"],
                )
