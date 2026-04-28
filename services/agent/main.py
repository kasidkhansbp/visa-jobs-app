"""
Entry point — starts the scheduler which orchestrates all agent runs.
"""
from agent.scheduler.cron import start_scheduler

start_scheduler()
