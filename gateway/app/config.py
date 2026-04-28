from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).parent.parent / ".env"


class GatewayConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILE, extra="ignore")

    database_url: str
    debug: bool = False
    frontend_origin: str
    jwt_secret: str
    jwt_expiry_minutes: int = 60
    jwt_refresh_expiry_days: int = 7
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    r2_account_id: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str
    r2_endpoint_url: str
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    gmail_redirect_uri: str = "http://localhost:8000/api/gmail/callback"
    gmail_encryption_key: str = ""
    gmail_feature_allowlist: str = ""

    def is_gmail_allowed(self, email: str) -> bool:
        allowed = [e.strip() for e in self.gmail_feature_allowlist.split(",") if e.strip()]
        return email in allowed
