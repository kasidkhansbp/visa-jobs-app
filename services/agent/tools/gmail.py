"""
Tool: gmail

Gmail API wrapper.
- Encrypts/decrypts refresh tokens using Fernet symmetric encryption
- Authenticates per user using their stored refresh token
- Searches inbox with a single OR query since last check
- Fetches full email body for each matched email

Used by: email_tracker agent → gmail_reader node
"""
from __future__ import annotations

import base64
import logging
from dataclasses import dataclass
from datetime import datetime, timezone

from cryptography.fernet import Fernet
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

# Subject keywords used in a single OR query — costs 5 Gmail API units per check
SEARCH_QUERY = (
    'subject:("thank you for applying" OR "thanks for applying" OR '
    '"your application" OR "we received your application" OR '
    '"application received" OR "application confirmation")'
)


@dataclass
class EmailMessage:
    email_id: str
    subject: str
    body: str
    sender: str
    received_at: datetime


def encrypt_token(token: str, encryption_key: str) -> str:
    """Encrypt a refresh token before storing in DB."""
    f = Fernet(encryption_key.encode())
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str, encryption_key: str) -> str:
    """Decrypt a refresh token retrieved from DB."""
    f = Fernet(encryption_key.encode())
    return f.decrypt(encrypted_token.encode()).decode()


def build_gmail_service(
    refresh_token: str,
    client_id: str,
    client_secret: str,
):
    """
    Build an authenticated Gmail API service for a single user.
    Uses the refresh token to generate a fresh access token automatically.
    """
    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=GMAIL_SCOPES,
    )
    credentials.refresh(Request())
    return build("gmail", "v1", credentials=credentials)


def fetch_new_emails(
    service,
    since: datetime | None,
) -> list[EmailMessage]:
    """
    Search Gmail inbox for job application emails since the last check.
    Returns a list of EmailMessage objects.

    Costs: 5 units for the list call + 5 units per matched email read.
    """
    query = SEARCH_QUERY
    if since:
        date_str = since.strftime("%Y/%m/%d")
        query += f" after:{date_str}"

    results = service.users().messages().list(
        userId="me",
        q=query,
        maxResults=50,
    ).execute()

    messages = results.get("messages", [])
    if not messages:
        logger.info("No new job emails found")
        return []

    # Normalise since to UTC for comparison
    since_utc = since.replace(tzinfo=timezone.utc) if since and since.tzinfo is None else since

    emails = []
    for msg in messages:
        try:
            email = _read_email(service, msg["id"])
            if not email:
                continue
            # Gmail after: has date-only precision — filter by full datetime
            if since_utc and email.received_at <= since_utc:
                logger.info("Skipping email %s — received before last check", msg["id"])
                continue
            emails.append(email)
        except Exception:
            logger.exception("Failed to read email %s — skipping", msg["id"])

    logger.info("Fetched %d job emails", len(emails))
    return emails


def _read_email(service, email_id: str) -> EmailMessage | None:
    """Fetch and parse a single email by ID."""
    msg = service.users().messages().get(
        userId="me",
        id=email_id,
        format="full",
    ).execute()

    headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
    subject = headers.get("Subject", "")
    sender = headers.get("From", "")
    date_str = headers.get("Date", "")

    body = _extract_body(msg["payload"])

    try:
        received_at = datetime.strptime(
            date_str[:31].strip(), "%a, %d %b %Y %H:%M:%S %z"
        ).astimezone(timezone.utc)
    except ValueError:
        received_at = datetime.now(timezone.utc)

    return EmailMessage(
        email_id=email_id,
        subject=subject,
        body=body,
        sender=sender,
        received_at=received_at,
    )


def _extract_body(payload: dict) -> str:
    """Extract plain text body from email payload, handling multipart emails."""
    if "parts" in payload:
        for part in payload["parts"]:
            if part["mimeType"] == "text/plain":
                data = part["body"].get("data", "")
                return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
        # Fallback to first part if no plain text found
        for part in payload["parts"]:
            body = _extract_body(part)
            if body:
                return body

    data = payload.get("body", {}).get("data", "")
    if data:
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")

    return ""
