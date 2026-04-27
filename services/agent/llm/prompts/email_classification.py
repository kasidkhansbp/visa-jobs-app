"""
Prompt: email_classification

Extracts structured data from a job application email.
Used by: email_tracker agent → email_classifier node
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class EmailClassification(BaseModel):
    is_job_email: bool = Field(
        description="True if this email is related to a job application, False otherwise."
    )
    company: str = Field(
        default="",
        description="Name of the company the application was sent to. Empty if not a job email.",
    )
    role: str = Field(
        default="",
        description="Job title or role applied for. Empty if not a job email.",
    )
    status: str = Field(
        default="",
        description=(
            "Application status detected from the email. "
            "Must be one of: applied | interview_scheduled | rejected | offer_received. "
            "Empty if not a job email."
        ),
    )


SYSTEM_PROMPT = """
You are an assistant that reads job application emails and extracts structured information.

Your job is to determine:
1. Whether the email is related to a job application
2. If yes — the company name, role, and current application status

Status definitions:
- applied: confirmation that the application was received
- interview_scheduled: an interview has been invited or scheduled
- rejected: the application was unsuccessful
- offer_received: a job offer has been made

Be conservative — if you are not confident it is a job application email, set is_job_email to false.
""".strip()


def build_prompt(subject: str, sender: str, body: str) -> str:
    return f"""
Email details:
From: {sender}
Subject: {subject}

Body:
{body[:3000]}
""".strip()
