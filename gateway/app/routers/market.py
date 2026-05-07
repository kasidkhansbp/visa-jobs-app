from __future__ import annotations

from datetime import date
from collections import defaultdict

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from shared.db.connection import get_session
from shared.db.models.job import Job

router = APIRouter(prefix="/api/market", tags=["market"])

# ── Sector metadata ───────────────────────────────────────────────────────────

SECTOR_SUBTITLES = {
    "Infrastructure":      "Cloud, DC, networks",
    "Cybersecurity":       "SecOps, GRC, identity",
    "AI / ML":             "LLM infra, MLOps",
    "Data platforms":      "Analytics, data mesh",
    "Fintech / Payments":  "Regulated tech, PSD2",
    "Software Delivery":   "Platform eng, SWE",
    "DevOps":              "SRE, release eng",
    "E-commerce":          "Marketplace, logistics",
    "Product":             "Roadmap, GTM",
}

# ── Response models ───────────────────────────────────────────────────────────

class WeeklyCount(BaseModel):
    week: str
    openings: int


class SectorHeatmapRow(BaseModel):
    name: str
    subtitle: str
    latest_openings: int
    previous_openings: int
    week_on_week_pct: float
    overall_trend_pct: float
    direction: str          # growing | shrinking | stable
    demand_pct: float       # relative to total latest openings
    weekly_data: list[WeeklyCount]


class MarketSummary(BaseModel):
    total_openings: int
    by_sector: dict[str, int]
    hottest_sector: str | None
    hottest_trend_pct: float | None
    cooling_sector: str | None
    cooling_trend_pct: float | None
    updated_at: str | None


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_weekly_counts(session: AsyncSession) -> dict[str, list[tuple[str, int]]]:
    """
    Returns weekly job counts per sector.
    { sector: [ (week_str, count), ... ] } ordered by week ASC
    """
    result = await session.execute(
        text("""
            SELECT
                sector,
                DATE_TRUNC('week', fetched_at)::date AS week,
                COUNT(*) AS openings
            FROM jobs
            WHERE sector IS NOT NULL AND is_hidden = false
            GROUP BY sector, week
            ORDER BY sector, week ASC
        """)
    )
    rows = result.fetchall()

    data: dict[str, list[tuple[str, int]]] = defaultdict(list)
    for row in rows:
        data[row[0]].append((str(row[1]), int(row[2])))
    return dict(data)


def _compute_direction(trend_pct: float) -> str:
    if trend_pct > 5:
        return "growing"
    if trend_pct < -5:
        return "shrinking"
    return "stable"


def _safe_pct_change(new: int, old: int) -> float:
    if old == 0:
        return 0.0
    return round((new - old) / old * 100, 1)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/summary", response_model=MarketSummary)
async def get_summary(
    session: AsyncSession = Depends(get_session),
) -> MarketSummary:
    """
    Returns headline numbers:
    - Total live TPM openings (latest week)
    - Openings for Infrastructure, Cybersecurity, AI/ML
    - Hottest and cooling sectors
    """
    weekly = await _get_weekly_counts(session)

    if not weekly:
        return MarketSummary(
            total_openings=0,
            by_sector={},
            hottest_sector=None,
            hottest_trend_pct=None,
            cooling_sector=None,
            cooling_trend_pct=None,
            updated_at=None,
        )

    # Latest week openings per sector
    latest: dict[str, int] = {s: weeks[-1][1] for s, weeks in weekly.items()}
    earliest: dict[str, int] = {s: weeks[0][1] for s, weeks in weekly.items()}
    total_openings = sum(latest.values())
    updated_at = max(weeks[-1][0] for weeks in weekly.values())

    # Overall trend per sector
    trends = {
        s: _safe_pct_change(latest[s], earliest[s])
        for s in weekly
    }

    hottest = max(trends, key=lambda s: trends[s])
    cooling = min(trends, key=lambda s: trends[s])

    # Featured sectors for headline
    featured = ["Infrastructure", "Cybersecurity", "AI / ML"]
    by_sector = {s: latest.get(s, 0) for s in featured}

    return MarketSummary(
        total_openings=total_openings,
        by_sector=by_sector,
        hottest_sector=hottest,
        hottest_trend_pct=trends[hottest],
        cooling_sector=cooling,
        cooling_trend_pct=trends[cooling],
        updated_at=updated_at,
    )


@router.get("/heatmap", response_model=list[SectorHeatmapRow])
async def get_heatmap(
    session: AsyncSession = Depends(get_session),
) -> list[SectorHeatmapRow]:
    """
    Returns full sector heatmap:
    - Latest openings, week-on-week change, overall trend
    - Direction: growing / shrinking / stable
    - Demand relative to total latest openings
    - Weekly data for sparkline
    """
    weekly = await _get_weekly_counts(session)

    if not weekly:
        return []

    # Total latest openings across all sectors for demand %
    total_latest = sum(weeks[-1][1] for weeks in weekly.values())

    rows = []
    for sector, weeks in weekly.items():
        latest_openings = weeks[-1][1]
        previous_openings = weeks[-2][1] if len(weeks) >= 2 else 0
        earliest_openings = weeks[0][1]

        wow_pct = _safe_pct_change(latest_openings, previous_openings)
        overall_pct = _safe_pct_change(latest_openings, earliest_openings)
        demand_pct = round(latest_openings / total_latest * 100, 1) if total_latest else 0.0

        rows.append(SectorHeatmapRow(
            name=sector,
            subtitle=SECTOR_SUBTITLES.get(sector, ""),
            latest_openings=latest_openings,
            previous_openings=previous_openings,
            week_on_week_pct=wow_pct,
            overall_trend_pct=overall_pct,
            direction=_compute_direction(overall_pct),
            demand_pct=demand_pct,
            weekly_data=[WeeklyCount(week=w, openings=c) for w, c in weeks],
        ))

    # Sort by latest openings descending
    rows.sort(key=lambda r: r.latest_openings, reverse=True)
    return rows
