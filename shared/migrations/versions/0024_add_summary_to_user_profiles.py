"""add summary to user_profiles

Revision ID: 0024
Revises: 0023
Create Date: 2026-06-23
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0024"
down_revision = "0023"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_profiles",
        sa.Column("summary", sa.Text, nullable=True),
    )


def downgrade() -> None:
    op.drop_column("user_profiles", "summary")
