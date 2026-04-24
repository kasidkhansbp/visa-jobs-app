from __future__ import annotations

import asyncio
import logging

from .config import JobsConfig
from . import scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)


async def main() -> None:
    config = JobsConfig()  # type: ignore[call-arg]
    scheduler.start(config)
    logger.info("Jobs service running — press Ctrl+C to stop")

    try:
        while True:
            await asyncio.sleep(3600)  # keep process alive
    except (KeyboardInterrupt, SystemExit):
        scheduler.stop()


if __name__ == "__main__":
    asyncio.run(main())
