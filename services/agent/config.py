"""
Environment variables and model selection for the agent service.
"""
from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_SERVICE_ENV = Path(__file__).parent / ".env"


class AgentConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_SERVICE_ENV), extra="ignore")

    database_url: str
    llm_provider: str = "anthropic"         # anthropic | openai | google
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_api_key: str = ""
    profile_agent_model: str = "claude-haiku-4-5-20251001"
    email_tracker_model: str = "claude-haiku-4-5-20251001"
    company_research_model: str = "claude-haiku-4-5-20251001"
    market_analyst_model: str = "claude-sonnet-4-6"  # Sonnet for better prose quality

    # Gmail OAuth
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    gmail_encryption_key: str = ""          # Fernet key — generate with Fernet.generate_key()

    # Comma-separated list of emails allowed to use Gmail feature
    # e.g. "kasidkhan@gmail.com"
    gmail_feature_allowlist: str = ""

    # Scheduler intervals
    profile_agent_interval_hours: int = 6
    email_tracker_interval_hours: int = 1

    def is_gmail_allowed(self, email: str) -> bool:
        allowed = [e.strip() for e in self.gmail_feature_allowlist.split(",") if e.strip()]
        return email in allowed
