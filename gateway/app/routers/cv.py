from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.cv_file import CvFile
from ..auth import get_current_user
from ..storage import upload_file, download_file, delete_file

router = APIRouter(prefix="/api/cv", tags=["cv"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class CvFileOut(BaseModel):
    id: str
    label: str
    filename: str
    file_size: int
    uploaded_at: datetime


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
