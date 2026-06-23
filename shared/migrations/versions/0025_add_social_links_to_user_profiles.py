"""add linkedin_url and github_url to user_profiles

Revision ID: 0025
Revises: 0024
Create Date: 2026-06-23
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0025"
down_revision = "0024"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_profiles",
        sa.Column("linkedin_url", sa.String(255), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("github_url", sa.String(255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("user_profiles", "github_url")
    op.drop_column("user_profiles", "linkedin_url")
