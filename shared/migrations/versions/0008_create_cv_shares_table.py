"""create cv_shares table

Revision ID: 0008
Revises: 0007
Create Date: 2026-04-25
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cv_shares",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("cv_file_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("view_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_viewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["cv_file_id"], ["cv_files.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_cv_shares_cv_file_id", "cv_shares", ["cv_file_id"])
    op.create_index("ix_cv_shares_user_id", "cv_shares", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_cv_shares_user_id", table_name="cv_shares")
    op.drop_index("ix_cv_shares_cv_file_id", table_name="cv_shares")
    op.drop_table("cv_shares")
