"""
Market Analyst Agent — State.

Passed between nodes within a single agent run.

Flow:
  fetch_data → generate_summary → store_summary
"""
from __future__ import annotations

from datetime import date
from typing import TypedDict


class MarketAnalystState(TypedDict):
    # Set before graph starts
    week_start: str                    # ISO date string e.g. "2026-05-04"

    # Set by fetch_data node
    heatmap_data: list[dict]           # Full sector data as list of dicts

    # Set by generate_summary node
    summary_text: str                  # 3-paragraph prose from Claude

    # Set by store_summary node
    stored: bool                       # True if successfully written to DB
