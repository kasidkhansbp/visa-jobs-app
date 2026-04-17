from __future__ import annotations

from abc import ABC, abstractmethod

from ..models.job import JobListing


class BaseJobClient(ABC):
    """
    Abstract interface every job-source client must implement.

    Each client is responsible for:
    - Authenticating with its source API.
    - Paginating through all available results.
    - Mapping raw API responses to the normalised JobListing model.
    """

    @abstractmethod
    async def fetch_all(
        self,
        keywords: list[str],
        location: str,
    ) -> list[JobListing]:
        """
        Fetch every matching job for the given keywords and location.
        Implementations must paginate until all results are retrieved.
        """
        ...
