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
from shared.db.models.job import Job

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

        # Active sponsors by route coverage threshold
        active_by_routes = {}
        for threshold in [2, 3, 4, 5, 6]:
            count = (
                await session.execute(
                    text(
                        """
                        SELECT COUNT(*) FROM (
                            SELECT organisation_name
                            FROM sponsors
                            GROUP BY organisation_name
                            HAVING COUNT(DISTINCT route) >= :threshold
                        ) t
                        """
                    ),
                    {"threshold": threshold},
                )
            ).scalar()
            active_by_routes[threshold] = count

        # Build all stat rows
        stat_rows = [
            {"stat_key": "totals", "label": "total_entries",   "count": total,       "updated_at": now},
            {"stat_key": "totals", "label": "unique_orgs",     "count": unique_orgs, "updated_at": now},
            {"stat_key": "totals", "label": "a_rated_count",   "count": a_rated,     "updated_at": now},
            {"stat_key": "totals", "label": "b_rated_count",   "count": b_rated,     "updated_at": now},
            *[
                {"stat_key": "active_sponsors", "label": f"{t}plus", "count": active_by_routes[t], "updated_at": now}
                for t in [2, 3, 4, 5, 6]
            ],
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
        "Stats rebuilt — total=%d, unique_orgs=%d, a_rated=%d, b_rated=%d, cities=%d, routes=%d, active(2+=%d 3+=%d 4+=%d 5+=%d 6+=%d)",
        total, unique_orgs, a_rated, b_rated, len(city_rows), len(route_rows),
        active_by_routes[2], active_by_routes[3], active_by_routes[4], active_by_routes[5], active_by_routes[6],
    )


import re

_STRIP = re.compile(
    r'\b(ltd|limited|plc|llp|llc|inc|group|uk|holdings|services|solutions|global|international|the)\b',
    re.IGNORECASE,
)

def _normalise(name: str) -> str:
    """Lowercase, strip common suffixes, collapse whitespace."""
    name = name.lower()
    name = _STRIP.sub('', name)
    name = re.sub(r'[^a-z0-9\s]', '', name)
    return re.sub(r'\s+', ' ', name).strip()


async def _match_jobs(full_reset: bool = False) -> None:
    """
    Cross-reference jobs.employer_name against sponsors.organisation_name
    using normalised name matching.

    Sets:
      is_sponsor_verified = true  — employer found in sponsors table
      is_frequent_sponsor = true  — employer sponsors 3+ routes

    full_reset=True  — wipe all flags first, rematch every job (monthly run)
    full_reset=False — only process jobs not yet matched (daily run)
    """
    async with AsyncSessionLocal() as session:
        # Build normalised sponsor lookup: {normalised_name: route_count}
        sponsor_rows = (
            await session.execute(
                text(
                    """
                    SELECT organisation_name, COUNT(DISTINCT route) AS route_count
                    FROM sponsors
                    GROUP BY organisation_name
                    """
                )
            )
        ).fetchall()

        sponsor_map: dict[str, int] = {
            _normalise(row.organisation_name): row.route_count
            for row in sponsor_rows
        }

        if full_reset:
            # Monthly: wipe all flags and rematch every job
            await session.execute(
                text("UPDATE jobs SET is_sponsor_verified = false, is_frequent_sponsor = false")
            )
            job_rows = (
                await session.execute(
                    text("SELECT id, employer_name FROM jobs")
                )
            ).fetchall()
        else:
            # Daily: only process jobs that have never been matched
            job_rows = (
                await session.execute(
                    text(
                        """
                        SELECT id, employer_name FROM jobs
                        WHERE is_sponsor_verified = false
                        AND is_frequent_sponsor = false
                        """
                    )
                )
            ).fetchall()

        verified_ids = []
        frequent_ids = []

        for job in job_rows:
            key = _normalise(job.employer_name)
            route_count = sponsor_map.get(key)
            if route_count is not None:
                verified_ids.append(str(job.id))
                if route_count >= 3:
                    frequent_ids.append(str(job.id))

        if verified_ids:
            await session.execute(
                text("UPDATE jobs SET is_sponsor_verified = true WHERE id = ANY(:ids)"),
                {"ids": verified_ids},
            )

        if frequent_ids:
            await session.execute(
                text("UPDATE jobs SET is_frequent_sponsor = true WHERE id = ANY(:ids)"),
                {"ids": frequent_ids},
            )

        await session.commit()

    logger.info(
        "Job matching complete — %d sponsor-verified, %d frequent sponsors (full_reset=%s)",
        len(verified_ids), len(frequent_ids), full_reset,
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
    await _match_jobs(full_reset=True)
    logger.info("Done.")


if __name__ == "__main__":
    asyncio.run(main())
