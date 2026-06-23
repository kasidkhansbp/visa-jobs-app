from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.cv_file import CvFile
from shared.db.models.interview_story import InterviewStory
from shared.db.models.question_bank import QuestionBank
from shared.db.models.user import User
from shared.db.models.user_application import UserApplication
from shared.db.models.user_profile import UserProfile
from ..auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])


# ── Pydantic schemas ─────────────────────────────────────────────────────────

class SkillItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    note: str = Field(default="", max_length=255)
    level: int = Field(..., ge=0, le=100)


class ProfileOut(BaseModel):
    # from users table
    name: str
    email: str
    username: str | None
    picture: str | None
    created_at: datetime

    # from user_profiles table
    headline: str | None
    location: str | None
    years_experience: int | None
    open_to_work: bool
    target_level: str | None
    salary_min: int | None
    salary_max: int | None
    work_mode: str | None
    preferred_locations: str | None
    notice_period: str | None
    visa_status: str | None
    visa_expiry: date | None
    sponsorship_required: bool | None
    skills: list[SkillItem] | None

    # aggregated stats
    cv_count: int
    story_count: int
    question_total: int
    application_count: int


class ApplicationPipelineItem(BaseModel):
    id: str
    company: str
    role: list
    status: str
    applied_at: datetime | None
    updated_at: datetime


class ProfileUpdate(BaseModel):
    # user-table fields
    name: str | None = Field(default=None, min_length=1, max_length=255)
    username: str | None = Field(default=None, min_length=1, max_length=100)

    # identity
    headline: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    years_experience: int | None = Field(default=None, ge=0, le=99)
    open_to_work: bool | None = None

    # search preferences
    target_level: str | None = Field(default=None, max_length=100)
    salary_min: int | None = Field(default=None, ge=0, le=1_000_000)
    salary_max: int | None = Field(default=None, ge=0, le=1_000_000)
    work_mode: str | None = Field(default=None, max_length=100)
    preferred_locations: str | None = Field(default=None, max_length=500)
    notice_period: str | None = Field(default=None, max_length=100)

    # visa & sponsorship
    visa_status: str | None = Field(default=None, max_length=100)
    visa_expiry: date | None = None
    sponsorship_required: bool | None = None

    # competencies
    skills: list[SkillItem] | None = Field(default=None, max_length=20)


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_user_or_404(user_id: uuid.UUID, session: AsyncSession) -> User:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def _get_or_create_profile(user_id: uuid.UUID, session: AsyncSession) -> UserProfile:
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        profile = UserProfile(user_id=user_id)
        session.add(profile)
        await session.flush()
    return profile


async def _get_stats(user_id: uuid.UUID, session: AsyncSession) -> dict:
    cv_q = await session.execute(
        select(func.count(CvFile.id)).where(CvFile.user_id == user_id)
    )
    story_q = await session.execute(
        select(func.count(InterviewStory.id)).where(InterviewStory.user_id == user_id)
    )
    question_q = await session.execute(select(func.count(QuestionBank.id)))
    app_q = await session.execute(
        select(func.count(UserApplication.id)).where(UserApplication.user_id == user_id)
    )
    return {
        "cv_count": cv_q.scalar() or 0,
        "story_count": story_q.scalar() or 0,
        "question_total": question_q.scalar() or 0,
        "application_count": app_q.scalar() or 0,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=ProfileOut)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ProfileOut:
    user_id = uuid.UUID(current_user["sub"])
    user = await _get_user_or_404(user_id, session)
    profile = await _get_or_create_profile(user_id, session)
    stats = await _get_stats(user_id, session)

    await session.commit()

    return ProfileOut(
        name=user.name,
        email=user.email,
        username=user.username,
        picture=user.picture,
        created_at=user.created_at,
        headline=profile.headline,
        location=profile.location,
        years_experience=profile.years_experience,
        open_to_work=profile.open_to_work,
        target_level=profile.target_level,
        salary_min=profile.salary_min,
        salary_max=profile.salary_max,
        work_mode=profile.work_mode,
        preferred_locations=profile.preferred_locations,
        notice_period=profile.notice_period,
        visa_status=profile.visa_status,
        visa_expiry=profile.visa_expiry,
        sponsorship_required=profile.sponsorship_required,
        skills=profile.skills,
        **stats,
    )


@router.get("/pipeline", response_model=list[ApplicationPipelineItem])
async def get_pipeline(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ApplicationPipelineItem]:
    user_id = uuid.UUID(current_user["sub"])
    result = await session.execute(
        select(UserApplication)
        .where(UserApplication.user_id == user_id)
        .order_by(UserApplication.updated_at.desc())
        .limit(10)
    )
    apps = result.scalars().all()
    return [
        ApplicationPipelineItem(
            id=app.id,
            company=app.company,
            role=app.role,
            status=app.status,
            applied_at=app.applied_at,
            updated_at=app.updated_at,
        )
        for app in apps
    ]


@router.patch("", response_model=ProfileOut)
async def update_profile(
    body: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ProfileOut:
    user_id = uuid.UUID(current_user["sub"])
    user = await _get_user_or_404(user_id, session)
    profile = await _get_or_create_profile(user_id, session)
    sent = body.model_fields_set

    # ── User-table fields ────────────────────────────────────────────────
    if "name" in sent:
        user.name = body.name
    if "username" in sent:
        existing = await session.execute(
            select(User).where(User.username == body.username, User.id != user_id)
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail="Username already taken")
        user.username = body.username

    # ── Profile-table fields (explicit assignment, never **dict unpacking) ──

    # Identity
    if "headline" in sent:
        profile.headline = body.headline
    if "location" in sent:
        profile.location = body.location
    if "years_experience" in sent:
        profile.years_experience = body.years_experience
    if "open_to_work" in sent:
        profile.open_to_work = body.open_to_work

    # Search preferences
    if "target_level" in sent:
        profile.target_level = body.target_level
    if "salary_min" in sent:
        profile.salary_min = body.salary_min
    if "salary_max" in sent:
        profile.salary_max = body.salary_max
    if "work_mode" in sent:
        profile.work_mode = body.work_mode
    if "preferred_locations" in sent:
        profile.preferred_locations = body.preferred_locations
    if "notice_period" in sent:
        profile.notice_period = body.notice_period

    # Visa & sponsorship
    if "visa_status" in sent:
        profile.visa_status = body.visa_status
    if "visa_expiry" in sent:
        profile.visa_expiry = body.visa_expiry
    if "sponsorship_required" in sent:
        profile.sponsorship_required = body.sponsorship_required

    # Competencies
    if "skills" in sent:
        profile.skills = [s.model_dump() for s in body.skills] if body.skills else None

    profile.updated_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(user)
    await session.refresh(profile)

    stats = await _get_stats(user_id, session)

    return ProfileOut(
        name=user.name,
        email=user.email,
        username=user.username,
        picture=user.picture,
        created_at=user.created_at,
        headline=profile.headline,
        location=profile.location,
        years_experience=profile.years_experience,
        open_to_work=profile.open_to_work,
        target_level=profile.target_level,
        salary_min=profile.salary_min,
        salary_max=profile.salary_max,
        work_mode=profile.work_mode,
        preferred_locations=profile.preferred_locations,
        notice_period=profile.notice_period,
        visa_status=profile.visa_status,
        visa_expiry=profile.visa_expiry,
        sponsorship_required=profile.sponsorship_required,
        skills=profile.skills,
        **stats,
    )
