"""
Entry point — starts the scheduler which orchestrates all agent runs.
"""
from .scheduler.cron import start_scheduler

if __name__ == "__main__":
    start_scheduler()
