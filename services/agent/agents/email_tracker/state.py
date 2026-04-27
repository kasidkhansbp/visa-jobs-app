"""
Email Tracker Agent — State.

Holds everything passed between nodes within a single agent run.
LangGraph passes this TypedDict between nodes — each node reads what it needs
and adds its output before passing to the next node.

Flow:
  gmail_reader → email_classifier → status_writer
"""
from __future__ import annotations

from datetime import datetime
from typing import TypedDict

from ...tools.gmail import EmailMessage
from ...llm.prompts.email_classification import EmailClassification


class ClassifiedEmail(TypedDict):
    """An email that has been read and classified by the LLM."""
    email: EmailMessage
    classification: EmailClassification


class EmailTrackerState(TypedDict):
    # Set by scheduler before graph starts
    user_id: str
    encrypted_refresh_token: str
    last_checked_at: datetime | None

    # Set by gmail_reader node
    raw_emails: list[EmailMessage]

    # Set by email_classifier node
    classified_emails: list[ClassifiedEmail]

    # Set by status_writer node
    applications_written: int
