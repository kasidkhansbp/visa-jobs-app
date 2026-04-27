"""
Node: status_writer

Takes classified emails from state, writes or updates application
records in DB via db/queries.py.
"""
from __future__ import annotations

import asyncio
import logging

from shared.db.connection import AsyncSessionLocal
from ....db.queries import upsert_application, mark_gmail_last_checked
from ..state import EmailTrackerState

logger = logging.getLogger(__name__)


def status_writer(state: EmailTrackerState) -> dict:
    """
    Writes each classified job email to the user_applications table.
    Updates last_checked_at after all writes are complete.
    """
    return asyncio.run(_write(state))


async def _write(state: EmailTrackerState) -> dict:
    classified_emails = state["classified_emails"]
    user_id = state["user_id"]
    count = 0

    async with AsyncSessionLocal() as session:
        for item in classified_emails:
            email = item["email"]
            classification = item["classification"]
            try:
                await upsert_application(
                    session=session,
                    user_id=user_id,
                    company=classification.company,
                    role=classification.role,
                    status=classification.status,
                    source_email_id=email.email_id,
                    last_email_at=email.received_at,
                )
                count += 1
            except Exception:
                logger.exception(
                    "status_writer — failed to write application for email_id=%s",
                    email.email_id,
                )

        await mark_gmail_last_checked(session, user_id)

    logger.info("status_writer — %d applications written for user_id=%s", count, user_id)

    return {"applications_written": count}
