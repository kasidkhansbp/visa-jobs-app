"""
Test script — email_classifier node.

Tests Claude's ability to classify job application emails.
No Gmail credentials required — emails are hardcoded.

Run from services/agent/:
    venv/Scripts/python.exe -m test_email_classifier
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Load .env
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

# Add project root for shared/ and services/ for agent package
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "services"))

from agent.agents.email_tracker.nodes.email_classifier import email_classifier
from agent.tools.gmail import EmailMessage

TEST_EMAILS = [
    EmailMessage(
        email_id="test_001",
        subject="Thank you for applying to Technical Program Manager at Google",
        body="Dear Kasid, thank you for applying for the Technical Program Manager position at Google. We have received your application and will be in touch shortly.",
        sender="recruiting@google.com",
        received_at=datetime.now(timezone.utc),
    ),
    EmailMessage(
        email_id="test_002",
        subject="Your application at Amazon — next steps",
        body="Hi Kasid, we reviewed your application for the Senior TPM role and would like to invite you for an interview. Please use the link below to schedule.",
        sender="no-reply@amazon.jobs",
        received_at=datetime.now(timezone.utc),
    ),
    EmailMessage(
        email_id="test_003",
        subject="Update on your application",
        body="Dear Kasid, after careful consideration we have decided to move forward with other candidates for the TPM role. We appreciate your interest in Meta.",
        sender="talent@meta.com",
        received_at=datetime.now(timezone.utc),
    ),
    EmailMessage(
        email_id="test_004",
        subject="Your Amazon order has shipped",
        body="Your order #123 has been shipped and will arrive tomorrow.",
        sender="shipment@amazon.com",
        received_at=datetime.now(timezone.utc),
    ),
]

if __name__ == "__main__":
    state = {
        "user_id": "test-user",
        "encrypted_refresh_token": "",
        "last_checked_at": None,
        "raw_emails": TEST_EMAILS,
        "classified_emails": [],
        "applications_written": 0,
    }

    print(f"\nTesting email_classifier with {len(TEST_EMAILS)} emails...\n")

    result = email_classifier(state)
    classified = result["classified_emails"]

    print(f"Classified as job emails: {len(classified)}/{len(TEST_EMAILS)}\n")

    for item in classified:
        c = item["classification"]
        e = item["email"]
        print(f"Email ID : {e.email_id}")
        print(f"Subject  : {e.subject}")
        print(f"Company  : {c.company}")
        print(f"Role     : {c.role}")
        print(f"Status   : {c.status}")
        print("-" * 50)
