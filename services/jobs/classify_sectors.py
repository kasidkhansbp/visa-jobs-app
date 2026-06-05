"""
One-off backfill script — classifies existing jobs into sectors using keyword matching.

Priority order (first match wins):
1. Infrastructure
2. Cybersecurity
3. AI / ML
4. Data platforms
5. Fintech / Payments
6. Software Delivery
7. DevOps
8. E-commerce
9. Product
10. Other

Usage (from project root):
    $env:DATABASE_URL = "postgresql://..."
    $env:PYTHONPATH = "c:/Users/kasid/workspace/visa-jobs-app"
    gateway/venv/Scripts/python.exe -m services.jobs.classify_sectors
"""
from __future__ import annotations

import asyncio
import logging

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from shared.db.models.job import Job
from services.jobs.config import JobsConfig

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── Sector definitions in priority order ─────────────────────────────────────

SECTORS = [
    {
        "name": "Infrastructure",
        "keywords": [
            "infrastructure", "cloud", "aws", "gcp", "azure", "network",
            "sre", "reliability", "data centre", "data center", "on-premise",
            "kubernetes", "k8s", "terraform", "vpc", "dns", "cdn",
        ],
    },
    {
        "name": "Cybersecurity",
        "keywords": [
            "security", "secops", "grc", "identity", "cyber", "soc",
            "compliance", "penetration", "threat", "vulnerability", "iam",
            "zero trust", "siem", "endpoint", "devsecops",
        ],
    },
    {
        "name": "AI / ML",
        "keywords": [
            "ai", "machine learning", "ml", "llm", "mlops", "genai",
            "artificial intelligence", "deep learning", "nlp", "neural",
            "generative", "foundation model", "prompt", "vector",
        ],
    },
    {
        "name": "Data platforms",
        "keywords": [
            "data platform", "data mesh", "data warehouse", "analytics",
            "data pipeline", "data science", "data engineering", "bi ",
            "business intelligence", "dbt", "spark", "kafka", "airflow",
            "data lake", "data governance", "data quality",
        ],
    },
    {
        "name": "Fintech / Payments",
        "keywords": [
            "fintech", "payment", "banking", "financial", "psd2", "fraud",
            "fca", "settlement", "transaction", "lending", "insurance",
            "wealth", "trading", "regulatory", "open banking",
        ],
    },
    {
        "name": "Software Delivery",
        "keywords": [
            "software delivery", "platform engineering", "agile", "scrum",
            "engineering delivery", "software development", "sdlc",
            "sprint", "backlog", "velocity",
        ],
    },
    {
        "name": "DevOps",
        "keywords": [
            "devops", "ci/cd", "release engineering", "build pipeline",
            "continuous integration", "continuous delivery", "gitops",
            "deployment", "jenkins", "github actions",
        ],
    },
    {
        "name": "E-commerce",
        "keywords": [
            "e-commerce", "ecommerce", "retail", "marketplace", "logistics",
            "fulfilment", "fulfillment", "supply chain", "checkout",
            "inventory", "warehouse",
        ],
    },
    {
        "name": "Product",
        "keywords": [
            "product management", "product delivery", "roadmap",
            "product strategy", "go-to-market", "gtm", "product owner",
        ],
    },
]


def classify(title: str, description: str) -> str:
    """Return the first matching sector in priority order."""
    text = f"{title} {description}".lower()
    for sector in SECTORS:
        for kw in sector["keywords"]:
            if kw in text:
                return sector["name"]
    return None


async def main() -> None:
    database_url = JobsConfig().database_url
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        result = await session.execute(
            select(Job.id, Job.title, Job.description).where(Job.sector.is_(None))
        )
        jobs = result.fetchall()
        logger.info("Found %d unclassified jobs", len(jobs))

        if not jobs:
            logger.info("All jobs already classified — nothing to do")
            return

        sector_counts: dict[str, int] = {}
        updates = []

        for job in jobs:
            sector = classify(job.title or "", job.description or "")
            sector_counts[sector] = sector_counts.get(sector, 0) + 1
            if sector is not None:
                updates.append({"id": job.id, "sector": sector})

        # Bulk update in batches of 500
        batch_size = 500
        for i in range(0, len(updates), batch_size):
            batch = updates[i:i + batch_size]
            for u in batch:
                await session.execute(
                    update(Job).where(Job.id == u["id"]).values(sector=u["sector"])
                )
            await session.commit()
            logger.info("Updated batch %d/%d", i // batch_size + 1, -(-len(updates) // batch_size))

        logger.info("Classification complete:")
        for sector, count in sorted(sector_counts.items(), key=lambda x: -x[1]):
            logger.info("  %-25s %d jobs", sector, count)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
