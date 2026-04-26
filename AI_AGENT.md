# AI Agent — Vision & Decision Log

## Status
> Early planning phase. UX not yet finalised. Nothing is confirmed until UX is nailed down.

---

## Decision Log
> Decisions recorded with date and time. If a decision changes, a new entry is added below the original — never overwrite.

---

### 2026-04-26

**Rollout strategy**
- Phase 1: Admin only (kasidkhan@gmail.com) for testing
- Phase 2: All users once stable
- Status: Confirmed

**Triggering**
- Runs every 6 hours automatically
- Only for users who have uploaded at least one CV
- Status: Confirmed

**CV handling**
- Agent reads ALL uploaded CVs per user
- Identifies which CV fits best for each job
- Tells user which CV to use and what the gap is
- Status: Confirmed

**Job matching output**
- Surfaces top 10 best-fit jobs per user
- User can mark a job as "Already Applied" — hidden from future results
- Status: Confirmed

**Agent output persistence**
- Results stored in DB — personalised page loads instantly, no Claude call on page load
- Status: Confirmed

**Skills profile**
- Agent builds a consolidated skills profile per user from all CVs
- Stored in DB as a "skills file" per user
- Captures: strengths, domains, seniority, weak areas
- Updated on every new CV upload or agent rerun
- Used as the basis for all future agent decisions
- Status: Confirmed

**Framework inclination**
- LangGraph for orchestration (conditional routing, parallel execution, agentic loops)
- LangChain for structured output via Pydantic schemas and multi-provider LLM switching
- Reason: need ability to switch LLM providers, RAG, internet search, Playwright MCP, agentic loops
- Status: Under consideration — blocked by UX finalisation

**LLM providers**
- Want ability to switch between: Anthropic (Claude), OpenAI (GPT-4), Google (Gemini)
- Status: Under consideration

**Model-per-task inclination**
- Profile building: Claude Sonnet
- Job ranking: Claude Haiku (fast, cheap)
- Company research: Claude Sonnet + web search
- Application tracking: Claude Opus
- Status: Under consideration — not confirmed

---

## Capabilities Wanted
> Features discussed. Not all confirmed for Phase 1.

### Core (Phase 1 candidate)
- CV text extraction (PDF → text)
- Skills profile building per user
- Job ranking against profile → top 10
- Gap analysis per matched job (missing skills, ATS keywords)
- Best CV recommendation per job

### Company Intelligence (Phase 2 candidate)
- Startup vs enterprise classification
- Funding status (Crunchbase, LinkedIn)
- Culture fit assessment
- Web scraping via Playwright MCP if data unavailable via API

### Internet Search (Phase 2 candidate)
- Live company news
- Recent funding rounds
- Job market signals

### Application Tracking / Agentic Loop (Phase 2 candidate)
- Triggered when user marks "Already Applied"
- Agent tracks application status over time
- Agent decides next action — follow up, move on, etc.

---

## Open Questions
> Must be resolved before implementation begins.

### UX (blocks all implementation decisions)
- [ ] What does a first-time user see on the personalised jobs page?
- [ ] After uploading a CV — does agent run silently or does user trigger it?
- [ ] What does a job card look like — match reason and gap inline or on click?
- [ ] Gap view — modal, side panel, or separate page?
- [ ] Already Applied — just hides the job or triggers application tracking?
- [ ] Returning user — how are refreshed/new results surfaced?

### Architecture (blocked by UX)
- [ ] RAG storage — pgvector vs Pinecone vs Chroma
- [ ] LangGraph state persistence — in-memory vs Postgres
- [ ] Playwright MCP — Railway sidecar or local only?
- [ ] Which models for which steps?

---

## Draft DB Tables
> Not finalised — pending UX and architecture decisions.

| Table | Purpose |
|---|---|
| `user_skills_profile` | One row per user, consolidated skills analysis |
| `user_job_matches` | Top 10 jobs per user with match score + gap analysis |
| `user_applied_jobs` | Jobs user has marked as applied |
| `user_rag_documents` | Per-user knowledge base for RAG |

Structure in the package:
services/agent/
│
├── agent/
│   ├── graph.py                   # LangGraph graph definition — nodes + edges
│   ├── state.py                   # AgentState TypedDict
│   └── nodes/
│       ├── cv_reader.py           # PDF → text for all user CVs
│       ├── profile_builder.py     # Builds consolidated skills profile
│       ├── job_ranker.py          # Scores jobs → top 10
│       ├── gap_analyser.py        # Per-job: missing skills, ATS gaps, best CV
│       └── result_writer.py       # Persists results to DB via shared/
│
├── llm/
│   ├── factory.py                 # Returns Claude / GPT-4 / Gemini based on config
│   └── prompts/
│       ├── profile_building.py
│       ├── job_ranking.py
│       └── gap_analysis.py
│
├── scheduler/
│   ├── cron.py                    # APScheduler — every 6 hours
│   └── trigger.py                 # Fetches eligible users, kicks off agent runs
│
├── main.py                        # Entry point — starts scheduler
├── config.py                      # Env vars, model selection
├── Dockerfile
├── railway.toml
└── requirements.txt

Expectation from Agent:
From the decision log and our discussion, here's what the agent does:
On every run (every 6 hours, users with at least one CV):

1. Read all CVs uploaded by the user
2. Extract text from each CV (PDF → text)
3. Build a consolidated skills profile per user — strengths, domains, seniority, weak areas
4. Save the skills profile to DB (updated on every run)
5. Fetch all current jobs from the DB
6. Rank jobs against the skills profile → surface top 10 best-fit jobs
7. For each of the top 10 jobs, run gap analysis — missing skills, ATS keywords
8. For each of the top 10 jobs, identify which of the user's CVs is the best fit
9. Tell the user which CV to use and what the gap is
10. Save all results to DB (so frontend loads instantly, no LLM call on page load)
11. Exclude any jobs the user has already marked as "Applied"

Phase 1 only (admin user kasidkhan@gmail.com first, then all users once stable).