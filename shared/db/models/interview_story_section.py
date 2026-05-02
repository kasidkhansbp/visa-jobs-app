from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base

SECTION_TYPES = ('broken', 'urgency', 'role', 'tech', 'org', 'decision', 'hardest', 'impact')


class InterviewStorySection(Base):
    __tablename__ = "interview_story_sections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    story_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("interview_stories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    section_type: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
