"""create jobs table

Revision ID: 0001
Revises:
Create Date: 2026-04-18
"""
from __future__ import annotations

import uuid

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("source", sa.String(20), nullable=False),
        sa.Column("job_id", sa.String(100), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("employer_name", sa.String(500), nullable=False),
        sa.Column("location", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("url", sa.String(2000), nullable=False),
        sa.Column("salary_min", sa.Float, nullable=True),
        sa.Column("salary_max", sa.Float, nullable=True),
        sa.Column("contract_type", sa.String(100), nullable=True),
        sa.Column("job_type", sa.String(100), nullable=True),
        sa.Column("posted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("source", "job_id", name="uq_job_source_id"),
    )


def downgrade() -> None:
    op.drop_table("jobs")
