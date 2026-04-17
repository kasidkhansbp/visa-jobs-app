from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class JobsConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

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
