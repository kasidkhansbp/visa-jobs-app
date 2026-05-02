"""add interview_story_sections and clean up sharpen column if exists

Revision ID: 0015
Revises: 0014
Create Date: 2026-05-02

RCA: Migration 0014 was rewritten after being applied to production.
Production has interview_stories (possibly with a sharpen JSON column from
the original 0014) but is missing interview_story_sections entirely.
This migration creates the missing table and removes the stale sharpen column.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0015"
down_revision = "0014"
branch_labels = None
depends_on = None

SECTION_CHECK = "section_type IN ('broken','urgency','role','tech','org','decision','hardest','impact')"


def upgrade() -> None:
    conn = op.get_bind()

    # Remove sharpen JSON column if it exists (leftover from original 0014)
    cols = [row[0] for row in conn.execute(
        sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='interview_stories'")
    )]
    if 'sharpen' in cols:
        op.drop_column('interview_stories', 'sharpen')

    # Create interview_story_sections if it doesn't exist
    tables = [row[0] for row in conn.execute(
        sa.text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    )]
    if 'interview_story_sections' not in tables:
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
