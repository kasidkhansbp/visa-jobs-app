"""
Memory — DB Queries.

All DB reads and writes for the agent service.
No DB calls are scattered across nodes — everything goes through here.
"""
from __future__ import annotations

import secrets
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.models.user import User
from shared.db.models.user_gmail_token import UserGmailToken
from shared.db.models.user_application import UserApplication


# ── Email Tracker queries ─────────────────────────────────────────────────────

async def get_eligible_gmail_users(session: AsyncSession) -> list[dict]:
    """
    Fetch all users who have a valid Gmail token connected.
    Returns list of { user_id, email, encrypted_refresh_token, last_checked_at }
    """
    result = await session.execute(
        select(
            User.id,
            User.email,
            UserGmailToken.refresh_token,
            UserGmailToken.last_checked_at,
        )
        .join(UserGmailToken, UserGmailToken.user_id == User.id)
        .where(UserGmailToken.is_valid.is_(True))
    )
    return [
        {
            "user_id": row.id,
            "email": row.email,
            "encrypted_refresh_token": row.refresh_token,
            "last_checked_at": row.last_checked_at,
        }
        for row in result
    ]


async def mark_gmail_last_checked(session: AsyncSession, user_id: str) -> None:
    """Update last_checked_at for a user's Gmail token after each agent run."""
    await session.execute(
        update(UserGmailToken)
        .where(UserGmailToken.user_id == user_id)
        .values(last_checked_at=datetime.now(timezone.utc))
    )
    await session.commit()


async def mark_gmail_token_invalid(session: AsyncSession, user_id: str) -> None:
    """
    Mark a user's Gmail token as invalid when Google rejects it.
    Frontend will prompt the user to reconnect.
    """
    await session.execute(
        update(UserGmailToken)
        .where(UserGmailToken.user_id == user_id)
        .values(is_valid=False)
    )
    await session.commit()


async def upsert_application(
    session: AsyncSession,
    user_id: str,
    company: str,
    role: str,
    status: str,
    source_email_id: str,
    last_email_at: datetime,
) -> None:
    """
    Create a new application or update status if one already exists
    for the same user + company combination.

    - Matches on user_id + company only
    - role is stored as a JSON list — each email's extracted role is appended
    - Uses source_email_id to prevent duplicate processing of the same email
    """
    # Check if this email has already been processed
    existing_by_email = await session.execute(
        select(UserApplication).where(
            UserApplication.user_id == user_id,
            UserApplication.source_email_id == source_email_id,
        )
    )
    if existing_by_email.scalar_one_or_none():
        return  # Already processed this email — skip

    now = datetime.now(timezone.utc)

    # Check if an application for this company already exists
    existing = await session.execute(
        select(UserApplication).where(
            UserApplication.user_id == user_id,
            UserApplication.company == company,
        )
    )
    application = existing.scalar_one_or_none()

    if application:
        # Update status
        application.status = status
        application.last_email_at = last_email_at
        application.updated_at = now
        # Append role if extracted and not already in the list
        if role and role not in application.role:
            application.role = application.role + [role]
    else:
        # Create new application record
        session.add(UserApplication(
            id=secrets.token_hex(16),
            user_id=user_id,
            company=company,
            role=[role] if role else [],
            status=status,
            source_email_id=source_email_id,
            last_email_at=last_email_at,
            created_at=now,
            updated_at=now,
        ))

    await session.commit()


