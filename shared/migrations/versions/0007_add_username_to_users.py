"""add username to users

Revision ID: 0007
Revises: 0006
Create Date: 2026-04-25
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add nullable first so existing rows don't violate NOT NULL
    op.add_column("users", sa.Column("username", sa.String(100), nullable=True))

    # Backfill existing users by slugifying their name:
    # "Md Kasid Khan" → "md-kasid-khan"
    op.execute("""
        UPDATE users
        SET username = lower(
            regexp_replace(
                regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'),
                '-+', '-', 'g'
            )
        )
    """)

    # Resolve any collisions by appending the first 6 chars of the user id
    op.execute("""
        UPDATE users u
        SET username = u.username || '-' || left(u.id::text, 6)
        WHERE (
            SELECT COUNT(*) FROM users u2
            WHERE u2.username = u.username AND u2.id != u.id
        ) > 0
    """)

    # Now safe to add unique index
    op.create_index("ix_users_username", "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_column("users", "username")
