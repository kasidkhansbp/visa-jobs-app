"""
Market Analyst Agent — Graph.

Fixed sequence — no conditional routing needed today.
Extensible: add nodes (e.g. web_search, validate_summary) between existing ones.

Flow:
  START → fetch_data → generate_summary → store_summary → END
"""
from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from .nodes.fetch_data import fetch_data
from .nodes.generate_summary import generate_summary
from .nodes.store_summary import store_summary
from .state import MarketAnalystState


def build_graph():
    graph = StateGraph(MarketAnalystState)

    graph.add_node("fetch_data", fetch_data)
    graph.add_node("generate_summary", generate_summary)
    graph.add_node("store_summary", store_summary)

    graph.add_edge(START, "fetch_data")
    graph.add_edge("fetch_data", "generate_summary")
    graph.add_edge("generate_summary", "store_summary")
    graph.add_edge("store_summary", END)

    return graph.compile()


market_analyst_graph = build_graph()
