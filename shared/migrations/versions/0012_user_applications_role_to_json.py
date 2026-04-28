"""change user_applications.role to JSON array

Revision ID: 0012
Revises: 0011
Create Date: 2026-04-28
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "user_applications",
        "role",
        type_=sa.JSON,
        existing_type=sa.String(500),
        postgresql_using="json_build_array(role)",
    )


def downgrade() -> None:
    op.alter_column(
        "user_applications",
        "role",
        type_=sa.String(500),
        existing_type=sa.JSON,
        postgresql_using="role->>0",
    )
