"""create user_gmail_tokens table

Revision ID: 0010
Revises: 0009
Create Date: 2026-04-27
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_gmail_tokens",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("refresh_token", sa.Text, nullable=False),   # encrypted before storing
        sa.Column("scope", sa.String(500), nullable=False),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_checked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_valid", sa.Boolean, nullable=False, server_default="true"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_user_gmail_tokens_user_id", "user_gmail_tokens", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_user_gmail_tokens_user_id", table_name="user_gmail_tokens")
    op.drop_table("user_gmail_tokens")
