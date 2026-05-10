"""
LLM Factory — Brain.

Returns a LangChain chat model based on config.
Swap provider by changing LLM_PROVIDER env var — no agent code changes needed.

Usage:
    llm = get_llm("email_tracker")
    structured_llm = llm.with_structured_output(EmailClassification)
"""
from __future__ import annotations

from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from ..config import AgentConfig

config = AgentConfig()  # type: ignore[call-arg]


def get_llm(agent: str):
    """
    Returns a LangChain chat model for the given agent.

    agent: "email_tracker" | "profile" | "company_research"
    """
    model = _get_model(agent)
    provider = config.llm_provider.lower()

    if provider == "anthropic":
        return ChatAnthropic(  # type: ignore[call-arg]
            model_name=model,
            api_key=SecretStr(config.anthropic_api_key),
            timeout=60,
            stop=None,
        )
    elif provider == "openai":
        return ChatOpenAI(  # type: ignore[call-arg]
            model=model,
            api_key=SecretStr(config.openai_api_key),
        )
    elif provider == "google":
        return ChatGoogleGenerativeAI(  # type: ignore[call-arg]
            model=model,
            google_api_key=config.google_api_key,
        )
    else:
        raise ValueError(f"Unknown LLM provider: {provider}. Must be anthropic | openai | google")


def _get_model(agent: str) -> str:
    """Returns the model name configured for the given agent."""
    model_map = {
        "email_tracker": config.email_tracker_model,
        "profile": config.profile_agent_model,
        "company_research": config.company_research_model,
        "market_analyst": config.market_analyst_model,
    }
    if agent not in model_map:
        raise ValueError(f"Unknown agent: {agent}. Must be email_tracker | profile | company_research | market_analyst")
    return model_map[agent]
