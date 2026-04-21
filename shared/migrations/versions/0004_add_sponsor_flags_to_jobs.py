"""add sponsor flags to jobs table

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-21
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("is_sponsor_verified", sa.Boolean, nullable=False, server_default="false"))
    op.add_column("jobs", sa.Column("is_frequent_sponsor", sa.Boolean, nullable=False, server_default="false"))
    op.create_index("ix_jobs_is_sponsor_verified", "jobs", ["is_sponsor_verified"])
    op.create_index("ix_jobs_is_frequent_sponsor", "jobs", ["is_frequent_sponsor"])


def downgrade() -> None:
    op.drop_index("ix_jobs_is_frequent_sponsor", table_name="jobs")
    op.drop_index("ix_jobs_is_sponsor_verified", table_name="jobs")
    op.drop_column("jobs", "is_frequent_sponsor")
    op.drop_column("jobs", "is_sponsor_verified")
