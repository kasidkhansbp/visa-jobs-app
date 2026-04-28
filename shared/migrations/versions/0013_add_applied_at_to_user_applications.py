"""add applied_at to user_applications

Revision ID: 0013
Revises: 0012
Create Date: 2026-04-28
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_applications",
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=True),
    )
    # Backfill existing rows — use last_email_at as best approximation
    op.execute("UPDATE user_applications SET applied_at = last_email_at WHERE applied_at IS NULL")


def downgrade() -> None:
    op.drop_column("user_applications", "applied_at")
