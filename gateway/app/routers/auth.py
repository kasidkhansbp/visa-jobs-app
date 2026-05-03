from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.user import User
from ..auth import COOKIE_NAME, create_access_token, get_current_user
from ..config import GatewayConfig

config = GatewayConfig()  # type: ignore[call-arg]

router = APIRouter(prefix="/auth", tags=["auth"])


def _slugify(name: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')
    return re.sub(r'-+', '-', slug)


async def _unique_username(base: str, session: AsyncSession) -> str:
    candidate = base
    result = await session.execute(select(User).where(User.username == candidate))
    if result.scalar_one_or_none() is None:
        return candidate
    # collision — append first 6 chars of a fresh uuid
    return f"{base}-{str(uuid.uuid4())[:6]}"

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    picture: str | None


@router.get("/login")
async def login() -> RedirectResponse:
    params = {
        "client_id": config.google_client_id,
        "redirect_uri": config.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/callback")
async def callback(
    code: str,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> RedirectResponse:
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": config.google_client_id,
                "client_secret": config.google_client_secret,
                "redirect_uri": config.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to exchange code")

        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to fetch user info")

        profile = userinfo_resp.json()

    google_id = profile["sub"]
    email = profile["email"]
    name = profile.get("name", email)
    picture = profile.get("picture")

    result = await session.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user is None:
        username = await _unique_username(_slugify(name), session)
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            username=username,
            picture=picture,
        )
        session.add(user)
    else:
        user.name = name
        user.picture = picture
        user.last_login_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(user)

    jwt_token = create_access_token(
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        picture=user.picture,
    )

    redirect = RedirectResponse(url=f"{config.frontend_origin}/?auth=success", status_code=302)
    redirect.set_cookie(
        key=COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        secure=not config.debug,
        samesite="lax",
        max_age=config.jwt_expiry_minutes * 60,
        path="/",
        domain=None if config.debug else ".tpmguild.com",
    )
    return redirect


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)) -> UserOut:
    return UserOut(
        id=current_user["sub"],
        email=current_user["email"],
        name=current_user["name"],
        picture=current_user.get("picture"),
    )


@router.post("/logout")
async def logout() -> Response:
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return response
