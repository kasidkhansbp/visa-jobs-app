"""create sponsors and sponsor_stats tables

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-21
"""
from __future__ import annotations

import uuid

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sponsors",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("organisation_name", sa.Text, nullable=False),
        sa.Column("town", sa.String(200), nullable=True),
        sa.Column("county", sa.String(200), nullable=True),
        sa.Column("rating_raw", sa.String(200), nullable=True),
        sa.Column("rating", sa.String(1), nullable=True),
        sa.Column("route", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("organisation_name", "route", name="uq_sponsor_org_route"),
    )
    op.create_index("ix_sponsors_organisation_name", "sponsors", ["organisation_name"])
    op.create_index("ix_sponsors_town", "sponsors", ["town"])
    op.create_index("ix_sponsors_route", "sponsors", ["route"])
    op.create_index("ix_sponsors_rating", "sponsors", ["rating"])

    op.create_table(
        "sponsor_stats",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("stat_key", sa.String(50), nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("count", sa.Integer, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("stat_key", "label", name="uq_stat_key_label"),
    )
    op.create_index("ix_sponsor_stats_stat_key", "sponsor_stats", ["stat_key"])


def downgrade() -> None:
    op.drop_index("ix_sponsor_stats_stat_key", table_name="sponsor_stats")
    op.drop_table("sponsor_stats")

    op.drop_index("ix_sponsors_rating", table_name="sponsors")
    op.drop_index("ix_sponsors_route", table_name="sponsors")
    op.drop_index("ix_sponsors_town", table_name="sponsors")
    op.drop_index("ix_sponsors_organisation_name", table_name="sponsors")
    op.drop_table("sponsors")
