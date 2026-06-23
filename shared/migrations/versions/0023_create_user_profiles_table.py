"""create user_profiles table

Revision ID: 0023
Revises: 0022
Create Date: 2026-06-23
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0023"
down_revision = "0022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_profiles",
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("headline", sa.String(255), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("years_experience", sa.Integer, nullable=True),
        sa.Column("open_to_work", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("target_level", sa.String(100), nullable=True),
        sa.Column("salary_min", sa.Integer, nullable=True),
        sa.Column("salary_max", sa.Integer, nullable=True),
        sa.Column("work_mode", sa.String(100), nullable=True),
        sa.Column("preferred_locations", sa.String(500), nullable=True),
        sa.Column("notice_period", sa.String(100), nullable=True),
        sa.Column("visa_status", sa.String(100), nullable=True),
        sa.Column("visa_expiry", sa.Date, nullable=True),
        sa.Column("sponsorship_required", sa.Boolean, nullable=True),
        sa.Column("skills", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("user_profiles")
