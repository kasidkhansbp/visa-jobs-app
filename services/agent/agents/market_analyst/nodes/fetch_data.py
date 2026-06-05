"""
Node: fetch_data

Fetches the latest heatmap data from the jobs DB.
Same query as GET /api/market/heatmap — all sectors with full weekly data.
"""
from __future__ import annotations

import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from ....agents.market_analyst.state import MarketAnalystState
from ....config import AgentConfig

logger = logging.getLogger(__name__)
config = AgentConfig()  # type: ignore[call-arg]


async def fetch_data(state: MarketAnalystState) -> dict:
    database_url = config.database_url
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(database_url)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        result = await session.execute(text("""
            SELECT
                sector,
                DATE_TRUNC('week', fetched_at)::date AS week,
                COUNT(*) AS openings
            FROM jobs
            WHERE sector IS NOT NULL
              AND is_hidden = false
              AND (
                title ILIKE '%technical program manager%'
                OR title ILIKE '%technical programme manager%'
                OR title ILIKE '% tpm %'
                OR title ILIKE 'tpm %'
                OR title ILIKE '% tpm'
                OR title ILIKE '%program manager%'
                OR title ILIKE '%programme manager%'
                OR title ILIKE '%pmo manager%'
                OR title ILIKE '%head of pmo%'
                OR title ILIKE '%project director%'
              )
            GROUP BY sector, week
            ORDER BY sector, week ASC
        """))
        rows = result.fetchall()

    await engine.dispose()

    # Build sector data grouped by sector
    from collections import defaultdict
    weekly: dict[str, list[tuple[str, int]]] = defaultdict(list)
    for row in rows:
        weekly[row[0]].append((str(row[1]), int(row[2])))

    if not weekly:
        logger.warning("fetch_data — no heatmap data found")
        return {"heatmap_data": []}

    total_latest = sum(weeks[-1][1] for weeks in weekly.values())

    heatmap = []
    for sector, weeks in weekly.items():
        latest = weeks[-1][1]
        previous = weeks[-2][1] if len(weeks) >= 2 else 0
        earliest = weeks[0][1]
        wow_pct = round((latest - previous) / previous * 100, 1) if previous else 0.0
        overall_pct = round((latest - earliest) / earliest * 100, 1) if earliest else 0.0
        demand_pct = round(latest / total_latest * 100, 1) if total_latest else 0.0

        if overall_pct > 5:
            direction = "growing"
        elif overall_pct < -5:
            direction = "shrinking"
        else:
            direction = "stable"

        heatmap.append({
            "sector": sector,
            "latest_openings": latest,
            "previous_openings": previous,
            "week_on_week_pct": wow_pct,
            "overall_trend_pct": overall_pct,
            "direction": direction,
            "demand_pct": demand_pct,
            "weekly_data": [{"week": w, "openings": c} for w, c in weeks],
        })

    heatmap.sort(key=lambda r: r["latest_openings"], reverse=True)
    logger.info("fetch_data — %d sectors fetched", len(heatmap))
    return {"heatmap_data": heatmap}
