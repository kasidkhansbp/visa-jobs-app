"""create market_weekly_summaries table

Revision ID: 0020
Revises: 0019
Create Date: 2026-05-10
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0020"
down_revision = "0019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "market_weekly_summaries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("week_start", sa.Date, nullable=False, unique=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("summary_text", sa.Text, nullable=False),
        sa.Column("sector_insights", sa.JSON, nullable=False, server_default="[]"),
        sa.Column("headline_sector", sa.String(100), nullable=True),
        sa.Column("headline_signal", sa.String(500), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="published"),
    )
    op.create_index("ix_market_weekly_summaries_week_start", "market_weekly_summaries", ["week_start"])


def downgrade() -> None:
    op.drop_index("ix_market_weekly_summaries_week_start", table_name="market_weekly_summaries")
    op.drop_table("market_weekly_summaries")
