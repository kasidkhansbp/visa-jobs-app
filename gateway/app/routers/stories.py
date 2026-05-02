from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.interview_story import InterviewStory
from shared.db.models.interview_story_section import InterviewStorySection
from ..auth import get_current_user

router = APIRouter(prefix="/api/stories", tags=["stories"])

SECTION_KEYS = ["broken", "urgency", "role", "tech", "org", "decision", "hardest", "impact"]

# ── Seed story ────────────────────────────────────────────────────────────────

SEED_TITLE = "PSD2 SCA rollout — 14 markets"

SEED_NARRATIVE = """Took over the PSD2 Strong Customer Authentication programme 4 months before the regulator's hard deadline. 14 EU markets, three payment processors, a legacy ledger that didn't guarantee idempotency, and a Risk team that thought this was an Eng problem.

Built a single-threaded ownership model: one DRI per market, weekly exec brief, daily on-call rotation across Eng + Risk during rollout. Cut the rollout into 3 waves so we could learn from the first two. Pilot wave hit a production outage at T-3 weeks; held the line, fixed the root cause in 36 hours, kept to the wave plan.

All 14 markets live by the deadline. Zero compliance breaches in the 18 months since. Fraud loss down 38% as a side effect of the new auth flow."""

SEED_SECTIONS = {
    "broken":   "Settlement reconciliation took 48 hours; SCA enforcement was unhandled across 14 markets.",
    "urgency":  "Regulator hard deadline 4 months out. Non-compliance = fines + suspension of card processing.",
    "role":     "Single-threaded owner across Eng, Risk, Legal. The name on every exec brief.",
    "tech":     "Ledger lacked idempotent retries; 3 processors with inconsistent SCA exemption flags.",
    "org":      "Risk and Eng both believed exemption logic was the other team's problem.",
    "decision": "Wave-based rollout (3+5+6) instead of big-bang. Trade speed for learnable launches.",
    "hardest":  "T-3 weeks, pilot-market outage at 11pm. Exec asked if we should pull the deadline.",
    "impact":   "14 markets live on time. 0 breaches in 18 months. Fraud loss −38%.",
}

# ── Response models ───────────────────────────────────────────────────────────

class StoryListItem(BaseModel):
    id: str
    title: str
    updated_at: datetime
    filled_count: int


class StoryOut(BaseModel):
    id: str
    title: str
    narrative: str
    sharpen: dict
    created_at: datetime
    updated_at: datetime
    filled_count: int


class StoryPatch(BaseModel):
    title: str | None = None
    narrative: str | None = None
    sharpen: dict | None = None

# ── Helpers ───────────────────────────────────────────────────────────────────

def _sections_to_dict(sections: list[InterviewStorySection]) -> dict:
    return {s.section_type: s.content for s in sections}


def _filled_count(sections_dict: dict) -> int:
    return sum(1 for k in SECTION_KEYS if (sections_dict.get(k) or "").strip())


def _to_out(story: InterviewStory, sections: list[InterviewStorySection]) -> StoryOut:
    sharpen = _sections_to_dict(sections)
    return StoryOut(
        id=str(story.id),
        title=story.title,
        narrative=story.narrative,
        sharpen=sharpen,
        created_at=story.created_at,
        updated_at=story.updated_at,
        filled_count=_filled_count(sharpen),
    )


async def _get_sections(story_id: uuid.UUID, session: AsyncSession) -> list[InterviewStorySection]:
    result = await session.execute(
        select(InterviewStorySection).where(InterviewStorySection.story_id == story_id)
    )
    return list(result.scalars().all())


async def _get_story_or_404(story_id: str, user_id: uuid.UUID, session: AsyncSession) -> InterviewStory:
    result = await session.execute(
        select(InterviewStory).where(
            InterviewStory.id == uuid.UUID(story_id),
            InterviewStory.user_id == user_id,
        )
    )
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story


async def _create_story_with_sections(
    user_id: uuid.UUID,
    title: str,
    narrative: str,
    sections_content: dict,
    session: AsyncSession,
) -> tuple[InterviewStory, list[InterviewStorySection]]:
    """Create a story and its 8 section rows in one transaction."""
    now = datetime.now(timezone.utc)
    story = InterviewStory(
        id=uuid.uuid4(),
        user_id=user_id,
        title=title,
        narrative=narrative,
        created_at=now,
        updated_at=now,
    )
    session.add(story)
    await session.flush()  # get story.id without committing

    sections = [
        InterviewStorySection(
            id=uuid.uuid4(),
            story_id=story.id,
            section_type=key,
            content=sections_content.get(key, ""),
        )
        for key in SECTION_KEYS
    ]
    session.add_all(sections)
    await session.commit()
    await session.refresh(story)
    return story, sections


async def _create_seed(user_id: uuid.UUID, session: AsyncSession) -> tuple[InterviewStory, list[InterviewStorySection]]:
    return await _create_story_with_sections(
        user_id=user_id,
        title=SEED_TITLE,
        narrative=SEED_NARRATIVE,
        sections_content=SEED_SECTIONS,
        session=session,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[StoryListItem])
async def list_stories(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[StoryListItem]:
    user_id = uuid.UUID(current_user["sub"])
    result = await session.execute(
        select(InterviewStory)
        .where(InterviewStory.user_id == user_id)
        .order_by(InterviewStory.created_at.asc())
    )
    stories = list(result.scalars().all())

    if not stories:
        story, sections = await _create_seed(user_id, session)
        return [StoryListItem(
            id=str(story.id),
            title=story.title,
            updated_at=story.updated_at,
            filled_count=_filled_count(_sections_to_dict(sections)),
        )]

    # Compute filled_count per story from sections
    items = []
    for story in stories:
        sections = await _get_sections(story.id, session)
        items.append(StoryListItem(
            id=str(story.id),
            title=story.title,
            updated_at=story.updated_at,
            filled_count=_filled_count(_sections_to_dict(sections)),
        ))
    return items


@router.get("/{story_id}", response_model=StoryOut)
async def get_story(
    story_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StoryOut:
    user_id = uuid.UUID(current_user["sub"])
    story = await _get_story_or_404(story_id, user_id, session)
    sections = await _get_sections(story.id, session)
    return _to_out(story, sections)


@router.post("", response_model=StoryOut)
async def create_story(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StoryOut:
    user_id = uuid.UUID(current_user["sub"])

    count_result = await session.execute(
        select(func.count(InterviewStory.id)).where(InterviewStory.user_id == user_id)
    )
    count = count_result.scalar() or 0

    story, sections = await _create_story_with_sections(
        user_id=user_id,
        title=f"Story {count + 1}",
        narrative="",
        sections_content={k: "" for k in SECTION_KEYS},
        session=session,
    )
    return _to_out(story, sections)


@router.patch("/{story_id}", response_model=StoryOut)
async def update_story(
    story_id: str,
    body: StoryPatch,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StoryOut:
    user_id = uuid.UUID(current_user["sub"])

    try:
        story = await _get_story_or_404(story_id, user_id, session)
        now = datetime.now(timezone.utc)

        # Update interview_stories
        if body.title is not None:
            story.title = body.title
        if body.narrative is not None:
            story.narrative = body.narrative
        story.updated_at = now

        # Update interview_story_sections — same transaction, not yet committed
        if body.sharpen is not None:
            for key, content in body.sharpen.items():
                if key not in SECTION_KEYS:
                    continue
                result = await session.execute(
                    select(InterviewStorySection).where(
                        InterviewStorySection.story_id == story.id,
                        InterviewStorySection.section_type == key,
                    )
                )
                section = result.scalar_one_or_none()
                if section:
                    section.content = content

        # Single commit — both tables saved together or neither
        await session.commit()

    except Exception:
        await session.rollback()
        raise

    await session.refresh(story)
    sections = await _get_sections(story.id, session)
    return _to_out(story, sections)


@router.delete("/{story_id}")
async def delete_story(
    story_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    user_id = uuid.UUID(current_user["sub"])
    story = await _get_story_or_404(story_id, user_id, session)

    # Sections cascade delete automatically via FK
    await session.delete(story)
    await session.commit()

    count_result = await session.execute(
        select(func.count(InterviewStory.id)).where(InterviewStory.user_id == user_id)
    )
    remaining = count_result.scalar() or 0

    if remaining == 0:
        seed_story, seed_sections = await _create_seed(user_id, session)
        return Response(
            content=_to_out(seed_story, seed_sections).model_dump_json(),
            status_code=200,
            media_type="application/json",
        )

    return Response(status_code=204)
