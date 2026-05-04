from __future__ import annotations

import secrets
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.user import User
from shared.db.models.user_gmail_token import UserGmailToken
from shared.db.models.user_application import UserApplication
from ..auth import get_current_user
from ..config import GatewayConfig

router = APIRouter(prefix="/api/gmail", tags=["gmail"])
config = GatewayConfig()  # type: ignore[call-arg]

GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke"


def _encrypt_token(token: str) -> str:
    f = Fernet(config.gmail_encryption_key.encode())
    return f.encrypt(token.encode()).decode()


# ── Response models ───────────────────────────────────────────────────────────

class GmailStatusOut(BaseModel):
    connected: bool
    last_checked_at: datetime | None


VALID_STATUSES = {
    "applied", "interview_scheduled", "rejected",
    "offer_received", "withdrawn", "no_response"
}


class ApplicationOut(BaseModel):
    id: str
    company: str
    roles: list[str]
    status: str
    job_id: str | None
    applied_at: datetime | None
    last_email_at: datetime | None
    manually_added: bool
    created_at: datetime
    updated_at: datetime


class ApplicationCreate(BaseModel):
    company: str
    role: str = ""
    status: str = "applied"


class ApplicationStatusUpdate(BaseModel):
    status: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/auth-url")
async def get_auth_url(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Generate Gmail OAuth URL. Only available to users on the allowlist."""
    if not config.is_gmail_allowed(current_user["email"]):
        raise HTTPException(status_code=403, detail="Gmail feature not available for your account")

    params = {
        "client_id": config.gmail_client_id,
        "redirect_uri": config.gmail_redirect_uri,
        "response_type": "code",
        "scope": GMAIL_SCOPES,
        "access_type": "offline",
        "prompt": "consent",                # force refresh token on every consent
        "state": current_user["sub"],       # pass user_id to verify in callback
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return {"url": url}


@router.get("/callback")
async def gmail_callback(
    code: str,
    state: str,
    session: AsyncSession = Depends(get_session),
) -> RedirectResponse:
    """
    Handles Gmail OAuth callback from Google.
    Exchanges auth code for refresh token, encrypts and stores it.
    Redirects back to the Job Tracker page.
    """
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        response = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": config.gmail_client_id,
            "client_secret": config.gmail_client_secret,
            "redirect_uri": config.gmail_redirect_uri,
            "grant_type": "authorization_code",
        })

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange Gmail auth code")

    tokens = response.json()
    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="No refresh token returned — ensure prompt=consent")

    # Fetch user by user_id passed in state
    user_result = await session.execute(select(User).where(User.id == state))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Encrypt and upsert token
    encrypted = _encrypt_token(refresh_token)
    existing = await session.execute(
        select(UserGmailToken).where(UserGmailToken.user_id == user.id)
    )
    token_row = existing.scalar_one_or_none()

    if token_row:
        token_row.refresh_token = encrypted
        token_row.scope = GMAIL_SCOPES
        token_row.connected_at = datetime.now(timezone.utc)
        token_row.is_valid = True
    else:
        session.add(UserGmailToken(
            id=secrets.token_hex(16),
            user_id=user.id,
            refresh_token=encrypted,
            scope=GMAIL_SCOPES,
            connected_at=datetime.now(timezone.utc),
        ))

    await session.commit()

    return RedirectResponse(url=f"{config.frontend_origin}/tracker?gmail=connected")


@router.delete("/disconnect")
async def disconnect_gmail(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Revoke Gmail access and delete token from DB."""
    result = await session.execute(
        select(UserGmailToken).where(UserGmailToken.user_id == current_user["sub"])
    )
    token_row = result.scalar_one_or_none()
    if not token_row:
        raise HTTPException(status_code=404, detail="Gmail not connected")

    # Decrypt token and revoke with Google
    try:
        f = Fernet(config.gmail_encryption_key.encode())
        refresh_token = f.decrypt(token_row.refresh_token.encode()).decode()
        async with httpx.AsyncClient() as client:
            await client.post(GOOGLE_REVOKE_URL, params={"token": refresh_token})
    except Exception:
        pass  # still delete from DB even if revoke fails

    await session.execute(
        delete(UserGmailToken).where(UserGmailToken.user_id == current_user["sub"])
    )
    await session.commit()

    return {"status": "disconnected"}


@router.get("/status", response_model=GmailStatusOut)
async def gmail_status(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> GmailStatusOut:
    """Returns Gmail connection status for the logged-in user."""
    result = await session.execute(
        select(UserGmailToken).where(
            UserGmailToken.user_id == current_user["sub"],
            UserGmailToken.is_valid.is_(True),
        )
    )
    token_row = result.scalar_one_or_none()

    return GmailStatusOut(
        connected=token_row is not None,
        last_checked_at=token_row.last_checked_at if token_row else None,
    )


@router.get("/applications", response_model=list[ApplicationOut])
async def get_applications(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ApplicationOut]:
    """Returns all tracked applications for the logged-in user."""
    result = await session.execute(
        select(UserApplication)
        .where(UserApplication.user_id == current_user["sub"])
        .order_by(UserApplication.applied_at.desc().nullslast(), UserApplication.created_at.desc())
    )
    applications = result.scalars().all()

    return [
        ApplicationOut(
            id=app.id,
            company=app.company,
            roles=app.role if isinstance(app.role, list) else ([app.role] if app.role else []),
            status=app.status,
            job_id=str(app.job_id) if app.job_id else None,
            applied_at=app.applied_at,
            last_email_at=app.last_email_at,
            manually_added=app.manually_added,
            created_at=app.created_at,
            updated_at=app.updated_at,
        )
        for app in applications
    ]


@router.post("/applications", response_model=ApplicationOut)
async def create_application(
    body: ApplicationCreate,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ApplicationOut:
    """Manually add a job application."""
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")

    now = datetime.now(timezone.utc)
    app = UserApplication(
        id=secrets.token_hex(16),
        user_id=current_user["sub"],
        company=body.company,
        role=[body.role] if body.role else [],
        status=body.status,
        manually_added=True,
        applied_at=now,
        last_email_at=None,
        created_at=now,
        updated_at=now,
    )
    session.add(app)
    await session.commit()
    await session.refresh(app)

    return ApplicationOut(
        id=app.id,
        company=app.company,
        roles=app.role if isinstance(app.role, list) else ([app.role] if app.role else []),
        status=app.status,
        job_id=None,
        applied_at=app.applied_at,
        last_email_at=app.last_email_at,
        manually_added=app.manually_added,
        created_at=app.created_at,
        updated_at=app.updated_at,
    )


@router.patch("/applications/{application_id}", response_model=ApplicationOut)
async def update_application_status(
    application_id: str,
    body: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ApplicationOut:
    """Update the status of an application."""
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")

    result = await session.execute(
        select(UserApplication).where(
            UserApplication.id == application_id,
            UserApplication.user_id == current_user["sub"],
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = body.status
    app.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(app)

    return ApplicationOut(
        id=app.id,
        company=app.company,
        roles=app.role if isinstance(app.role, list) else ([app.role] if app.role else []),
        status=app.status,
        job_id=str(app.job_id) if app.job_id else None,
        applied_at=app.applied_at,
        last_email_at=app.last_email_at,
        manually_added=app.manually_added,
        created_at=app.created_at,
        updated_at=app.updated_at,
    )
