"""
Entry point — starts the scheduler which orchestrates all agent runs.
"""
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
    stream=sys.stdout,
)

logger = logging.getLogger(__name__)

try:
    logger.info("Agent service starting...")
    from agent.scheduler.cron import start_scheduler
    logger.info("Imports successful, starting scheduler...")
    start_scheduler()
except Exception as e:
    logger.exception("Failed to start agent service: %s", e)
    sys.exit(1)
