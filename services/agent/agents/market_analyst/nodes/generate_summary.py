"""
Node: generate_summary

Calls Claude with the analyst prompt + heatmap data.
Returns a 3-paragraph prose summary under 150 words.
"""
from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage

from ....llm.factory import get_llm
from ....llm.prompts.market_analyst import SYSTEM_PROMPT, build_prompt
from ....agents.market_analyst.state import MarketAnalystState

logger = logging.getLogger(__name__)


async def generate_summary(state: MarketAnalystState) -> dict:
    heatmap_data = state["heatmap_data"]

    if not heatmap_data:
        logger.warning("generate_summary — no data to summarise")
        return {"summary_text": ""}

    llm = get_llm("market_analyst")

    response = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=build_prompt(heatmap_data)),
    ])

    summary_text = str(response.content).strip()
    logger.info("generate_summary — %d chars generated", len(summary_text))
    return {"summary_text": summary_text}
