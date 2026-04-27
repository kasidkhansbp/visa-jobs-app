"""
LLM Factory — Brain.

Returns a LangChain chat model based on config.
Swap provider by changing LLM_PROVIDER env var — no agent code changes needed.

Usage:
    llm = get_llm("profile")
    structured_llm = llm.with_structured_output(SkillsProfile)
"""
