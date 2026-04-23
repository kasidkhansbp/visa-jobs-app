from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx

from ..models.adzuna import AdzunaJob, AdzunaSearchResponse
from ..models.job import JobListing
from .base import BaseJobClient

logger = logging.getLogger(__name__)

_BASE_URL = "https://api.adzuna.com/v1/api/jobs/gb/search/{page}"
_PAGE_SIZE = 50  # Adzuna max per request
_MAX_REQUESTS = 249


class AdzunaClient(BaseJobClient):
    """
    Async client for the Adzuna Jobs API.

    Auth: app_id + app_key passed as query parameters.
    Docs: https://developer.adzuna.com/docs/search
    """

    def __init__(self, app_id: str, app_key: str) -> None:
        self._app_id = app_id
        self._app_key = app_key

    async def fetch_all(
        self,
        keywords: list[str],
        location: str,
    ) -> list[JobListing]:
        """Fetch all pages for every keyword and return deduplicated results."""
        seen: set[str] = set()
        results: list[JobListing] = []
        request_count = 0

        async with httpx.AsyncClient(timeout=30.0) as client:
            for keyword in keywords:
                if request_count >= _MAX_REQUESTS:
                    logger.warning("Adzuna: request limit of %d reached, stopping early", _MAX_REQUESTS)
                    break
                jobs, request_count = await self._fetch_keyword(client, keyword, location, seen, request_count)
                results.extend(jobs)

        logger.info("Adzuna: fetched %d jobs across %d keywords in %d requests", len(results), len(keywords), request_count)
        return results

    async def _fetch_keyword(
        self,
        client: httpx.AsyncClient,
        keyword: str,
        location: str,
        seen: set[str],
        request_count: int,
    ) -> tuple[list[JobListing], int]:
        results: list[JobListing] = []
        page = 1

        while True:
            if request_count >= _MAX_REQUESTS:
                logger.warning("Adzuna: request limit reached mid-keyword, stopping pagination")
                break

            params = {
                "app_id": self._app_id,
                "app_key": self._app_key,
                "results_per_page": _PAGE_SIZE,
                "what": keyword,
                "where": location,
                "content-type": "application/json",
            }

            url = _BASE_URL.format(page=page)
            response = await client.get(url, params=params)
            response.raise_for_status()
            request_count += 1

            data = AdzunaSearchResponse.model_validate(response.json())

            for job in data.results:
                if job.id not in seen:
                    seen.add(job.id)
                    results.append(_to_job_listing(job))

            logger.debug(
                "Adzuna keyword=%r page=%d page_results=%d total=%d requests=%d",
                keyword, page, len(data.results), data.count, request_count,
            )

            if len(data.results) < _PAGE_SIZE:
                break

            page += 1

        return results, request_count


def _to_job_listing(job: AdzunaJob) -> JobListing:
    created_at: datetime | None = None
    try:
        created_at = datetime.fromisoformat(job.created).replace(tzinfo=timezone.utc)
    except ValueError:
        pass

    return JobListing(
        source="adzuna",
        job_id=job.id,
        title=job.title,
        employer_name=job.company.display_name or "Unknown",
        location=job.location.display_name,
        description=job.description,
        url=job.redirect_url,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        contract_type=job.contract_type,
        job_type=job.contract_time,
        created_at=created_at,
    )
