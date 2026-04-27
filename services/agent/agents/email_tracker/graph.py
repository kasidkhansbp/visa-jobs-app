"""
Email Tracker Agent — Planner.

Graph flow:
  START → gmail_reader → email_classifier → status_writer → END

Conditional edge after gmail_reader:
  - No emails found → END (skip classifier and writer)
  - Emails found    → email_classifier → status_writer → END
"""
from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from .nodes.email_classifier import email_classifier
from .nodes.gmail_reader import gmail_reader
from .nodes.status_writer import status_writer
from .state import EmailTrackerState


def _has_emails(state: EmailTrackerState) -> str:
    """Conditional edge — skip classifier if no emails were found."""
    return "email_classifier" if state["raw_emails"] else END


def build_graph():
    """Build and compile the email tracker LangGraph graph."""
    graph = StateGraph(EmailTrackerState)

    # Register nodes
    graph.add_node("gmail_reader", gmail_reader)
    graph.add_node("email_classifier", email_classifier)
    graph.add_node("status_writer", status_writer)

    # Edges
    graph.add_edge(START, "gmail_reader")
    graph.add_conditional_edges("gmail_reader", _has_emails)
    graph.add_edge("email_classifier", "status_writer")
    graph.add_edge("status_writer", END)

    return graph.compile()


# Compiled graph — imported by runner.py
email_tracker_graph = build_graph()
