"""
Environment variables and model selection for the agent service.
"""
from pydantic_settings import BaseSettings


class AgentConfig(BaseSettings):
    database_url: str
    llm_provider: str = "anthropic"         # anthropic | openai | google
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_api_key: str = ""
    profile_agent_model: str = "claude-sonnet-4-6"
    email_tracker_model: str = "claude-sonnet-4-6"
    company_research_model: str = "claude-sonnet-4-6"
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    profile_agent_interval_hours: int = 6
    email_tracker_interval_hours: int = 1

    class Config:
        env_file = ".env"
