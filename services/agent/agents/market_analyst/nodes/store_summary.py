"""
Node: store_summary

Persists the generated summary to market_weekly_summaries table.
Uses upsert on week_start so re-running overwrites the existing summary.
"""
from __future__ import annotations

import json
import logging
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from ....agents.market_analyst.state import MarketAnalystState
from ....config import AgentConfig

logger = logging.getLogger(__name__)
config = AgentConfig()  # type: ignore[call-arg]


async def store_summary(state: MarketAnalystState) -> dict:
    summary_text = state["summary_text"]
    week_start = state["week_start"]
    heatmap_data = state["heatmap_data"]

    if not summary_text:
        logger.warning("store_summary — no summary to store")
        return {"stored": False}

    # Derive headline from hottest sector
    growing = [s for s in heatmap_data if s["direction"] == "growing"]
    headline_sector = growing[0]["sector"] if growing else None

    # Detect batch events — large WoW swing but flat overall
    batch_events = [
        s for s in heatmap_data
        if abs(s["week_on_week_pct"]) > 20 and abs(s["overall_trend_pct"]) < 5
    ]
    if batch_events:
        b = batch_events[0]
        direction = "drop" if b["week_on_week_pct"] < 0 else "spike"
        pct = abs(b["week_on_week_pct"])
        headline_signal = (
            f"{b['sector']} had a large {direction} in job openings this week "
            f"({pct:.0f}% WoW) but the overall trend is flat — likely roles filled or "
            f"expired in one go, not a sign the market is {'cooling' if direction == 'drop' else 'overheating'}."
        )
    else:
        headline_signal = None

    database_url = config.database_url
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(database_url)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        await session.execute(text("""
            INSERT INTO market_weekly_summaries
                (id, week_start, generated_at, model, summary_text,
                 sector_insights, headline_sector, headline_signal, status)
            VALUES
                (:id, :week_start, :generated_at, :model, :summary_text,
                 CAST(:sector_insights AS json), :headline_sector, :headline_signal, 'published')
            ON CONFLICT (week_start)
            DO UPDATE SET
                generated_at   = EXCLUDED.generated_at,
                model          = EXCLUDED.model,
                summary_text   = EXCLUDED.summary_text,
                sector_insights = EXCLUDED.sector_insights,
                headline_sector = EXCLUDED.headline_sector,
                headline_signal = EXCLUDED.headline_signal
        """), {
            "id": str(uuid.uuid4()),
            "week_start": date.fromisoformat(week_start),
            "generated_at": datetime.now(timezone.utc),
            "model": config.market_analyst_model,
            "summary_text": summary_text,
            "sector_insights": json.dumps(heatmap_data),
            "headline_sector": headline_sector,
            "headline_signal": headline_signal,
        })
        await session.commit()

    await engine.dispose()
    logger.info("store_summary — summary stored for week %s", week_start)
    return {"stored": True}
