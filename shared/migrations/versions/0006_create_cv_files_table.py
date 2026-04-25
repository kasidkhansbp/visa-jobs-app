"""create cv_files table

Revision ID: 0006
Revises: 0005
Create Date: 2026-04-25
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cv_files",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("storage_key", sa.String(1000), nullable=False),
        sa.Column("file_size", sa.Integer, nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_cv_files_user_id", "cv_files", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_cv_files_user_id", table_name="cv_files")
    op.drop_table("cv_files")
