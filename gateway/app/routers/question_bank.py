from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.question_bank import QuestionBank
from ..auth import get_current_user

router = APIRouter(prefix="/api/questions", tags=["question-bank"])

ADMIN_EMAIL = "kasidkhan@gmail.com"

CATEGORY_ORDER = [
    "HR",
    "HM",
    "Program Management",
    "Technical",
    "Behavioral",
]


# ── Pydantic models ───────────────────────────────────────────────────────────

class QuestionOut(BaseModel):
    id: str
    category: str
    question: str
    answer: str
    order: int
    created_at: datetime


class CategoryGroup(BaseModel):
    category: str
    questions: list[QuestionOut]


class QuestionCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=50)
    question: str = Field(..., min_length=1, max_length=2000)
    answer: str = Field(..., min_length=1, max_length=10000)
    order: int = Field(default=0, ge=0)


class QuestionUpdate(BaseModel):
    category: str | None = Field(default=None, min_length=1, max_length=50)
    question: str | None = Field(default=None, min_length=1, max_length=2000)
    answer: str | None = Field(default=None, min_length=1, max_length=10000)
    order: int | None = Field(default=None, ge=0)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[CategoryGroup])
async def list_questions(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[CategoryGroup]:
    result = await session.execute(
        select(QuestionBank).order_by(QuestionBank.category, QuestionBank.order)
    )
    rows = result.scalars().all()

    grouped: dict[str, list[QuestionOut]] = {c: [] for c in CATEGORY_ORDER}
    for row in rows:
        if row.category not in grouped:
            grouped[row.category] = []
        grouped[row.category].append(QuestionOut(
            id=str(row.id),
            category=row.category,
            question=row.question,
            answer=row.answer,
            order=row.order,
            created_at=row.created_at,
        ))

    return [
        CategoryGroup(category=c, questions=grouped[c])
        for c in CATEGORY_ORDER
        if grouped.get(c)
    ]


@router.post("", response_model=QuestionOut, status_code=201)
async def create_question(
    body: QuestionCreate,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> QuestionOut:
    if current_user.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Forbidden")

    if body.category not in CATEGORY_ORDER:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(CATEGORY_ORDER)}",
        )

    question = QuestionBank(
        id=uuid.uuid4(),
        category=body.category,
        question=body.question,
        answer=body.answer,
        order=body.order,
        created_at=datetime.now(timezone.utc),
    )
    session.add(question)
    await session.commit()
    await session.refresh(question)

    return QuestionOut(
        id=str(question.id),
        category=question.category,
        question=question.question,
        answer=question.answer,
        order=question.order,
        created_at=question.created_at,
    )


@router.patch("/{question_id}", response_model=QuestionOut)
async def update_question(
    question_id: str,
    body: QuestionUpdate,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> QuestionOut:
    if current_user.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await session.execute(
        select(QuestionBank).where(QuestionBank.id == uuid.UUID(question_id))
    )
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if body.category is not None:
        if body.category not in CATEGORY_ORDER:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Must be one of: {', '.join(CATEGORY_ORDER)}",
            )
        question.category = body.category
    if body.question is not None:
        question.question = body.question
    if body.answer is not None:
        question.answer = body.answer
    if body.order is not None:
        question.order = body.order

    await session.commit()
    await session.refresh(question)

    return QuestionOut(
        id=str(question.id),
        category=question.category,
        question=question.question,
        answer=question.answer,
        order=question.order,
        created_at=question.created_at,
    )


@router.delete("/{question_id}", status_code=204, response_class=Response)
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    if current_user.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await session.execute(
        select(QuestionBank).where(QuestionBank.id == uuid.UUID(question_id))
    )
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    await session.delete(question)
    await session.commit()
    return Response(status_code=204)
