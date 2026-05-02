"""create interview_stories and interview_story_sections tables

Revision ID: 0014
Revises: 0013
Create Date: 2026-05-02
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0014"
down_revision = "0013"
branch_labels = None
depends_on = None

SECTION_TYPES = ('broken', 'urgency', 'role', 'tech', 'org', 'decision', 'hardest', 'impact')


SECTION_CHECK = "section_type IN ('broken','urgency','role','tech','org','decision','hardest','impact')"


def upgrade() -> None:
    op.create_table(
        "interview_stories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False, server_default="Untitled story"),
        sa.Column("narrative", sa.Text, nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_interview_stories_user_id", "interview_stories", ["user_id"])

    op.create_table(
        "interview_story_sections",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("story_id", UUID(as_uuid=True), nullable=False),
        sa.Column("section_type", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False, server_default=""),
        sa.ForeignKeyConstraint(["story_id"], ["interview_stories.id"], ondelete="CASCADE"),
        sa.CheckConstraint(SECTION_CHECK, name="ck_story_section_type"),
    )
    op.create_index("ix_interview_story_sections_story_id", "interview_story_sections", ["story_id"])
    op.create_index(
        "uq_story_section_type",
        "interview_story_sections",
        ["story_id", "section_type"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_story_section_type", table_name="interview_story_sections")
    op.drop_index("ix_interview_story_sections_story_id", table_name="interview_story_sections")
    op.drop_table("interview_story_sections")
    op.drop_index("ix_interview_stories_user_id", table_name="interview_stories")
    op.drop_table("interview_stories")
