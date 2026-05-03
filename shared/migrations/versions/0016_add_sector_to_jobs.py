"""add sector column to jobs table

Revision ID: 0016
Revises: 0015
Create Date: 2026-05-04

Sector is nullable — backfilled separately via keyword classification script.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0016"
down_revision = "0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "jobs",
        sa.Column("sector", sa.String(100), nullable=True),
    )
    op.create_index("ix_jobs_sector", "jobs", ["sector"])


def downgrade() -> None:
    op.drop_index("ix_jobs_sector", table_name="jobs")
    op.drop_column("jobs", "sector")
