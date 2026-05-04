"""add manually_added column to user_applications

Revision ID: 0017
Revises: 0016
Create Date: 2026-05-04

Distinguishes agent-detected applications from manually added ones.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0017"
down_revision = "0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_applications",
        sa.Column("manually_added", sa.Boolean, nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("user_applications", "manually_added")
