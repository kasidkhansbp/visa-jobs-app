from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT_ENV = Path(__file__).parent.parent.parent / ".env"
_SERVICE_ENV = Path(__file__).parent / ".env"


class JobsConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=[str(_ROOT_ENV), str(_SERVICE_ENV)], extra="ignore")

    database_url: str

    # API credentials
    reed_api_key: str
    adzuna_app_id: str
    adzuna_app_key: str

    # Default search parameters
    search_keywords: list[str] = [
        "Technical Program Manager",
        "TPM",
        "Program Manager",
        "Engineering Program Manager",
    ]
    search_location: str = "London"
