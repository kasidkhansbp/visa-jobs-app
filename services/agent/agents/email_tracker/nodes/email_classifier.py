"""
Node: email_classifier

Takes raw emails from state, sends each to Claude via LLM factory,
returns only job-related emails with their classification.
"""
from __future__ import annotations

import logging
from typing import cast

from langchain_core.messages import HumanMessage, SystemMessage

from ....llm.factory import get_llm
from ....llm.prompts.email_classification import (
    EmailClassification,
    SYSTEM_PROMPT,
    build_prompt,
)
from ..state import ClassifiedEmail, EmailTrackerState

logger = logging.getLogger(__name__)


def email_classifier(state: EmailTrackerState) -> dict:
    """
    Classifies each raw email using Claude.
    Filters out non-job emails.
    Returns only classified job-related emails.
    """
    raw_emails = state["raw_emails"]

    if not raw_emails:
        logger.info("email_classifier — no emails to classify")
        return {"classified_emails": []}

    llm = get_llm("email_tracker")
    structured_llm = llm.with_structured_output(EmailClassification)

    classified: list[ClassifiedEmail] = []

    for email in raw_emails:
        try:
            result = cast(EmailClassification, structured_llm.invoke([
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=build_prompt(
                    subject=email.subject,
                    sender=email.sender,
                    body=email.body,
                )),
            ]))

            if result.is_job_email:
                classified.append({
                    "email": email,
                    "classification": result,
                })
                logger.info(
                    "email_classifier — job email detected: company=%s role=%s status=%s",
                    result.company, result.role, result.status,
                )
            else:
                logger.info("email_classifier — not a job email, skipping")

        except Exception:
            logger.exception("email_classifier — failed to classify email_id=%s", email.email_id)

    logger.info(
        "email_classifier — %d/%d emails classified as job-related",
        len(classified), len(raw_emails),
    )

    return {"classified_emails": classified}
