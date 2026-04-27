"""
Node: gmail_reader

Reads the state, decrypts the refresh token, builds Gmail service,
fetches new emails since last check, and returns them in state.
"""
from __future__ import annotations

import logging

from ....config import AgentConfig
from ....tools.gmail import build_gmail_service, decrypt_token, fetch_new_emails
from ..state import EmailTrackerState

logger = logging.getLogger(__name__)
config = AgentConfig()  # type: ignore[call-arg]


def gmail_reader(state: EmailTrackerState) -> dict:
    """
    Decrypts the user's refresh token, connects to Gmail,
    and fetches new emails since last_checked_at.
    """
    logger.info("gmail_reader — user_id=%s", state["user_id"])

    refresh_token = decrypt_token(
        state["encrypted_refresh_token"],
        config.gmail_encryption_key,
    )

    service = build_gmail_service(
        refresh_token=refresh_token,
        client_id=config.gmail_client_id,
        client_secret=config.gmail_client_secret,
    )

    emails = fetch_new_emails(
        service=service,
        since=state["last_checked_at"],
    )

    logger.info("gmail_reader — %d emails fetched for user_id=%s", len(emails), state["user_id"])

    return {"raw_emails": emails}
