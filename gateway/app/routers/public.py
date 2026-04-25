from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.cv_file import CvFile
from shared.db.models.cv_share import CvShare
from shared.db.models.user import User
from ..storage import download_file

router = APIRouter(prefix="/public", tags=["public"])


class PublicCvShareOut(BaseModel):
    cv_label: str
    owner_name: str
    username: str
    expires_at: datetime
    view_count: int


@router.get("/cv/{username}/{token}/info", response_model=PublicCvShareOut)
async def get_share_info(
    username: str,
    token: str,
    session: AsyncSession = Depends(get_session),
) -> PublicCvShareOut:
    share, cv, user = await _resolve_share(username, token, session)
    return PublicCvShareOut(
        cv_label=cv.label,
        owner_name=user.name,
        username=user.username,
        expires_at=share.expires_at,
        view_count=share.view_count,
    )


@router.get("/cv/{username}/{token}/download")
async def download_shared_cv(
    username: str,
    token: str,
    session: AsyncSession = Depends(get_session),
) -> Response:
    share, cv, user = await _resolve_share(username, token, session)

    share.view_count += 1
    share.last_viewed_at = datetime.now(timezone.utc)
    await session.commit()

    data = download_file(cv.storage_key)
    return Response(
        content=data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{cv.filename}"'},
    )


async def _resolve_share(
    username: str,
    token: str,
    session: AsyncSession,
) -> tuple[CvShare, CvFile, User]:
    user_result = await session.execute(
        select(User).where(User.username == username)
    )
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="Link not found")

    share_result = await session.execute(
        select(CvShare).where(
            CvShare.id == token,
            CvShare.user_id == user.id,
        )
    )
    share = share_result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=404, detail="Link not found")

    if share.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Link has expired")

    cv_result = await session.execute(
        select(CvFile).where(CvFile.id == share.cv_file_id)
    )
    cv = cv_result.scalar_one_or_none()
    if cv is None:
        raise HTTPException(status_code=404, detail="Link not found")

    return share, cv, user
