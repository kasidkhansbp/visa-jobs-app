"""create question_bank table

Revision ID: 0021
Revises: 0020
Create Date: 2026-05-17
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0021"
down_revision = "0020"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "question_bank",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("answer", sa.Text, nullable=False),
        sa.Column("order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_question_bank_category", "question_bank", ["category"])
    op.create_index("ix_question_bank_order", "question_bank", ["category", "order"])


def downgrade() -> None:
    op.drop_index("ix_question_bank_order", table_name="question_bank")
    op.drop_index("ix_question_bank_category", table_name="question_bank")
    op.drop_table("question_bank")
