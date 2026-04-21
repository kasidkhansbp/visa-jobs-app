from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base


class Sponsor(Base):
    __tablename__ = "sponsors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    organisation_name: Mapped[str] = mapped_column(Text, nullable=False)
    town: Mapped[str | None] = mapped_column(String(200), nullable=True)
    county: Mapped[str | None] = mapped_column(String(200), nullable=True)
    rating_raw: Mapped[str | None] = mapped_column(String(200), nullable=True)
    rating: Mapped[str | None] = mapped_column(String(1), nullable=True)  # 'A' or 'B'
    route: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("organisation_name", "route", name="uq_sponsor_org_route"),
        Index("ix_sponsors_organisation_name", "organisation_name"),
        Index("ix_sponsors_town", "town"),
        Index("ix_sponsors_route", "route"),
        Index("ix_sponsors_rating", "rating"),
    )


class SponsorStat(Base):
    __tablename__ = "sponsor_stats"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    stat_key: Mapped[str] = mapped_column(String(50), nullable=False)   # e.g. "by_city", "by_route", "totals"
    label: Mapped[str] = mapped_column(String(200), nullable=False)     # e.g. "London", "Skilled Worker"
    count: Mapped[int] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("stat_key", "label", name="uq_stat_key_label"),
        Index("ix_sponsor_stats_stat_key", "stat_key"),
    )
