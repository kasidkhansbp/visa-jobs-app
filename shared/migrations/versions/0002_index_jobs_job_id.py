"""index jobs.job_id

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-20
"""
from __future__ import annotations

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_jobs_job_id", "jobs", ["job_id"])


def downgrade() -> None:
    op.drop_index("ix_jobs_job_id", table_name="jobs")
