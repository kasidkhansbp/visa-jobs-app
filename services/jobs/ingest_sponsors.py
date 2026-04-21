"""
Sponsor register ingestion script.

Reads the Home Office CSV from data/sponsors.csv, upserts rows into the
sponsors table (skipping duplicates on organisation_name + route), then
recalculates all aggregations into sponsor_stats.

Usage (from project root, with gateway venv active):
    $env:DATABASE_URL = "postgresql://..."
    $env:PYTHONPATH = "C:\\path\\to\\visa-jobs-app"
    python -m services.jobs.ingest_sponsors
"""
from __future__ import annotations

import asyncio
import csv
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import delete, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.engine import CursorResult

from shared.db.connection import AsyncSessionLocal
from shared.db.models.sponsor import Sponsor, SponsorStat

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent.parent / "data"
_csv_files = sorted(_DATA_DIR.glob("*.csv"))
CSV_PATH = _csv_files[-1] if _csv_files else None


def _clean(value: str, title_case: bool = False) -> str | None:
    """Strip whitespace and convert empty strings or literal 'NULL' to None."""
    v = value.strip()
    if not v or v.upper() == "NULL":
        return None
    return v.title() if title_case else v


def _parse_rating(rating_raw: str | None) -> str | None:
    """Extract A or B from raw rating string. Returns None if unrecognised."""
    if not rating_raw:
        return None
    if "(A" in rating_raw:
        return "A"
    if "(B" in rating_raw:
        return "B"
    return None


def _load_csv() -> list[dict]:
    """Read and clean all rows from the CSV."""
    rows = []
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f: # type: ignore
        reader = csv.DictReader(f)
        for raw in reader:
            org = _clean(raw.get("Organisation Name", ""))
            route = _clean(raw.get("Route", ""))

            if not org or not route:
                continue

            rating_raw = _clean(raw.get("Type & Rating", ""))
            rows.append({
                "id": uuid.uuid4(),
                "organisation_name": org.title(),
                "town": _clean(raw.get("Town/City", ""), title_case=True),
                "county": _clean(raw.get("County", "")),
                "rating_raw": rating_raw,
                "rating": _parse_rating(rating_raw),
                "route": route,
                "created_at": datetime.now(timezone.utc),
            })

    logger.info("CSV loaded — %d rows", len(rows))
    return rows


async def _upsert_sponsors(rows: list[dict]) -> int:
    """
    Bulk insert sponsors, skipping any row where (organisation_name, route)
    already exists in the DB.
    Returns the number of rows actually inserted.
    """
    if not rows:
        return 0

    # Process in batches to avoid hitting parameter limits
    batch_size = 1000
    total_inserted = 0

    async with AsyncSessionLocal() as session:
        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]
            stmt = (
                insert(Sponsor)
                .values(batch)
                .on_conflict_do_nothing(
                    index_elements=["organisation_name", "route"]
                )
            )
            result: CursorResult = await session.execute(stmt)  # type: ignore[assignment]
            total_inserted += result.rowcount
            await session.commit()
            logger.info(
                "Batch %d/%d — %d inserted",
                i // batch_size + 1,
                -(-len(rows) // batch_size),
                result.rowcount,
            )

    return total_inserted


async def _rebuild_stats() -> None:
    """
    Delete all existing sponsor_stats rows and recalculate from the
    current sponsors table.
    """
    now = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as session:
        # Clear existing stats
        await session.execute(delete(SponsorStat))

        # Total entries
        total = (await session.execute(text("SELECT COUNT(*) FROM sponsors"))).scalar()

        # Unique organisations
        unique_orgs = (
            await session.execute(
                text("SELECT COUNT(DISTINCT organisation_name) FROM sponsors")
            )
        ).scalar()

        # A-rated count
        a_rated = (
            await session.execute(
                text("SELECT COUNT(*) FROM sponsors WHERE rating = 'A'")
            )
        ).scalar()

        # B-rated count
        b_rated = (
            await session.execute(
                text("SELECT COUNT(*) FROM sponsors WHERE rating = 'B'")
            )
        ).scalar()

        # Top 20 cities
        city_rows = (
            await session.execute(
                text(
                    """
                    SELECT town, COUNT(*) AS cnt
                    FROM sponsors
                    WHERE town IS NOT NULL
                    GROUP BY town
                    ORDER BY cnt DESC
                    LIMIT 20
                    """
                )
            )
        ).fetchall()

        # All routes
        route_rows = (
            await session.execute(
                text(
                    """
                    SELECT route, COUNT(*) AS cnt
                    FROM sponsors
                    GROUP BY route
                    ORDER BY cnt DESC
                    """
                )
            )
        ).fetchall()

        # Build all stat rows
        stat_rows = [
            {"stat_key": "totals", "label": "total_entries",   "count": total,       "updated_at": now},
            {"stat_key": "totals", "label": "unique_orgs",     "count": unique_orgs, "updated_at": now},
            {"stat_key": "totals", "label": "a_rated_count",   "count": a_rated,     "updated_at": now},
            {"stat_key": "totals", "label": "b_rated_count",   "count": b_rated,     "updated_at": now},
            *[
                {"stat_key": "by_city", "label": row.town, "count": row.cnt, "updated_at": now}
                for row in city_rows
            ],
            *[
                {"stat_key": "by_route", "label": row.route, "count": row.cnt, "updated_at": now}
                for row in route_rows
            ],
        ]

        await session.execute(insert(SponsorStat).values(stat_rows))
        await session.commit()

    logger.info(
        "Stats rebuilt — total=%d, unique_orgs=%d, a_rated=%d, b_rated=%d, cities=%d, routes=%d",
        total, unique_orgs, a_rated, b_rated, len(city_rows), len(route_rows),
    )


async def main() -> None:
    if not CSV_PATH or not CSV_PATH.exists():
        logger.error("No CSV file found in %s", _DATA_DIR)
        return

    logger.info("Using CSV: %s", CSV_PATH.name)

    rows = _load_csv()
    inserted = await _upsert_sponsors(rows)
    logger.info("Ingestion complete — %d new rows inserted, %d skipped as duplicates", inserted, len(rows) - inserted)

    await _rebuild_stats()
    logger.info("Done.")


if __name__ == "__main__":
    asyncio.run(main())
