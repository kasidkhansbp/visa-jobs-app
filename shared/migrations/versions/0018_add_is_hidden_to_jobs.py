"""add is_hidden to jobs table

Revision ID: 0018
Revises: 0017
Create Date: 2026-05-07

Soft delete — hidden jobs stay in DB but do not appear in listings.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0018"
down_revision = "0017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "jobs",
        sa.Column("is_hidden", sa.Boolean, nullable=False, server_default="false"),
    )
    op.create_index("ix_jobs_is_hidden", "jobs", ["is_hidden"])


def downgrade() -> None:
    op.drop_index("ix_jobs_is_hidden", table_name="jobs")
    op.drop_column("jobs", "is_hidden")
