"""create user_applications table

Revision ID: 0011
Revises: 0010
Create Date: 2026-04-27
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None

# Possible application statuses
# applied | interview_scheduled | rejected | offer_received | no_response


def upgrade() -> None:
    op.create_table(
        "user_applications",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", UUID(as_uuid=True), nullable=True),     # user links manually later
        sa.Column("company", sa.String(500), nullable=False),
        sa.Column("role", sa.String(500), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="applied"),
        sa.Column("source_email_id", sa.String(255), nullable=True),  # Gmail message ID
        sa.Column("last_email_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_user_applications_user_id", "user_applications", ["user_id"])
    op.create_index("ix_user_applications_status", "user_applications", ["status"])


def downgrade() -> None:
    op.drop_index("ix_user_applications_status", table_name="user_applications")
    op.drop_index("ix_user_applications_user_id", table_name="user_applications")
    op.drop_table("user_applications")
