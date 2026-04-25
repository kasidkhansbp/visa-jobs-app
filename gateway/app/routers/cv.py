from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.cv_file import CvFile
from shared.db.models.cv_share import CvShare
from shared.db.models.user import User
from ..auth import get_current_user
from ..config import GatewayConfig
from ..storage import upload_file, download_file, delete_file

router = APIRouter(prefix="/api/cv", tags=["cv"])

config = GatewayConfig()  # type: ignore[call-arg]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class CvFileOut(BaseModel):
    id: str
    label: str
    filename: str
    file_size: int
    uploaded_at: datetime


class CvShareOut(BaseModel):
    token: str
    url: str
    created_at: datetime
    view_count: int
    last_viewed_at: datetime | None


@router.get("", response_model=list[CvFileOut])
async def list_cvs(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[CvFileOut]:
    result = await session.execute(
        select(CvFile)
        .where(CvFile.user_id == uuid.UUID(current_user["sub"]))
        .order_by(CvFile.uploaded_at.desc())
    )
    cvs = result.scalars().all()
    return [
        CvFileOut(
            id=str(cv.id),
            label=cv.label,
            filename=cv.filename,
            file_size=cv.file_size,
            uploaded_at=cv.uploaded_at,
        )
        for cv in cvs
    ]


@router.post("", response_model=CvFileOut, status_code=status.HTTP_201_CREATED)
async def upload_cv(
    label: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CvFileOut:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size must be under 5 MB")

    cv_id = uuid.uuid4()
    user_id = uuid.UUID(current_user["sub"])
    storage_key = f"{user_id}/{cv_id}.pdf"

    upload_file(key=storage_key, data=data)

    cv = CvFile(
        id=cv_id,
        user_id=user_id,
        label=label,
        filename=file.filename,
        storage_key=storage_key,
        file_size=len(data),
        uploaded_at=datetime.now(timezone.utc),
    )
    session.add(cv)
    await session.commit()
    await session.refresh(cv)

    return CvFileOut(
        id=str(cv.id),
        label=cv.label,
        filename=cv.filename,
        file_size=cv.file_size,
        uploaded_at=cv.uploaded_at,
    )


@router.get("/{cv_id}/download")
async def download_cv(
    cv_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    result = await session.execute(
        select(CvFile).where(
            CvFile.id == uuid.UUID(cv_id),
            CvFile.user_id == uuid.UUID(current_user["sub"]),
        )
    )
    cv = result.scalar_one_or_none()
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    data = download_file(cv.storage_key)

    return Response(
        content=data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{cv.filename}"'},
    )


@router.patch("/{cv_id}", response_model=CvFileOut)
async def rename_cv(
    cv_id: str,
    label: str = Form(...),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CvFileOut:
    result = await session.execute(
        select(CvFile).where(
            CvFile.id == uuid.UUID(cv_id),
            CvFile.user_id == uuid.UUID(current_user["sub"]),
        )
    )
    cv = result.scalar_one_or_none()
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    cv.label = label
    await session.commit()
    await session.refresh(cv)

    return CvFileOut(
        id=str(cv.id),
        label=cv.label,
        filename=cv.filename,
        file_size=cv.file_size,
        uploaded_at=cv.uploaded_at,
    )


@router.post("/{cv_id}/share", response_model=CvShareOut, status_code=status.HTTP_201_CREATED)
async def create_share(
    cv_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CvShareOut:
    user_id = uuid.UUID(current_user["sub"])

    result = await session.execute(
        select(CvFile).where(
            CvFile.id == uuid.UUID(cv_id),
            CvFile.user_id == user_id,
        )
    )
    cv = result.scalar_one_or_none()
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    user_result = await session.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user is None or user.username is None:
        raise HTTPException(status_code=400, detail="User profile incomplete")

    token = secrets.token_urlsafe(24)
    now = datetime.now(timezone.utc)

    share = CvShare(
        id=token,
        cv_file_id=cv.id,
        user_id=user_id,
        created_at=now,
        view_count=0,
    )
    session.add(share)
    await session.commit()
    await session.refresh(share)

    url = f"{config.frontend_origin}/cv/share/{user.username}/{token}"
    return CvShareOut(
        token=token,
        url=url,
        created_at=share.created_at,
        view_count=share.view_count,
        last_viewed_at=share.last_viewed_at,
    )


@router.get("/{cv_id}/shares", response_model=list[CvShareOut])
async def list_shares(
    cv_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[CvShareOut]:
    user_id = uuid.UUID(current_user["sub"])

    result = await session.execute(
        select(CvFile).where(
            CvFile.id == uuid.UUID(cv_id),
            CvFile.user_id == user_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="CV not found")

    user_result = await session.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    shares_result = await session.execute(
        select(CvShare)
        .where(CvShare.cv_file_id == uuid.UUID(cv_id))
        .order_by(CvShare.created_at.desc())
    )
    shares = shares_result.scalars().all()

    return [
        CvShareOut(
            token=s.id,
            url=f"{config.frontend_origin}/cv/share/{user.username}/{s.id}",
            created_at=s.created_at,
            view_count=s.view_count,
            last_viewed_at=s.last_viewed_at,
        )
        for s in shares
    ]


@router.delete("/shares/{token}")
async def revoke_share(
    token: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    result = await session.execute(
        select(CvShare).where(
            CvShare.id == token,
            CvShare.user_id == uuid.UUID(current_user["sub"]),
        )
    )
    share = result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=404, detail="Share not found")

    await session.execute(delete(CvShare).where(CvShare.id == token))
    await session.commit()
    return Response(status_code=204)


@router.delete("/{cv_id}")
async def delete_cv(
    cv_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    result = await session.execute(
        select(CvFile).where(
            CvFile.id == uuid.UUID(cv_id),
            CvFile.user_id == uuid.UUID(current_user["sub"]),
        )
    )
    cv = result.scalar_one_or_none()
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    delete_file(cv.storage_key)

    await session.execute(
        delete(CvFile).where(CvFile.id == uuid.UUID(cv_id))
    )
    await session.commit()
    return Response(status_code=204)
