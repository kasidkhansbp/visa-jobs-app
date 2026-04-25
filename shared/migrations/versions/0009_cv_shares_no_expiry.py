"""make cv_shares.expires_at nullable (links never expire unless revoked)

Revision ID: 0009
Revises: 0008
Create Date: 2026-04-25
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("cv_shares", "expires_at", nullable=True)
    op.execute("UPDATE cv_shares SET expires_at = NULL")


def downgrade() -> None:
    op.execute(
        "UPDATE cv_shares SET expires_at = NOW() + INTERVAL '30 days' WHERE expires_at IS NULL"
    )
    op.alter_column("cv_shares", "expires_at", nullable=False)
