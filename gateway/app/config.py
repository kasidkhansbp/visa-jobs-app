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
