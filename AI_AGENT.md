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

### Application Tracking / Agentic Loop — PRIORITY 1
- Separate Job Tracker page — not the personalised jobs page
- No manual input from user — agent discovers applications automatically from Gmail
- User connects Gmail once via OAuth consent (`gmail.readonly` scope)
- Refresh token stored per user in DB — agent accesses inbox silently going forward
- Agent runs hourly + on-demand (user can hit "Refresh" on Job Tracker page)
- Decision logged: 2026-04-26 — elevated to Priority 1

**Gmail search strategy — 2026-04-27**
- Single `messages.list` call per check (5 units) using OR query:
  ```
  subject:("thank you for applying" OR "thanks for applying" OR "your application" OR
           "we received your application" OR "application received" OR
           "application confirmation") after:YYYY/MM/DD
  ```
- `after:` filter scoped to emails since last check — avoids re-reading old emails
- Each matched email read via `messages.get` (5 units each)
- Cost per user per check: 5 units (no new emails) to ~15-25 units (2-4 new emails)
- Gmail API quota: 1 billion units/day per project — safe at any realistic scale for TPMguild

**Email classification — Claude reads each matched email and extracts:**
- Company name
- Role title
- Status: `Applied` / `Interview Scheduled` / `Rejected` / `Offer Received` / `No Response`

**Application statuses:**
- `Applied` — confirmation email received
- `Interview Scheduled` — interview invite detected
- `Rejected` — rejection email detected
- `Offer Received` — offer email detected
- `No Response` — no reply after X days

**Separate OAuth from site login:**
- Site login uses `openid profile email` scopes
- Gmail monitoring requires `gmail.readonly` — separate OAuth client
- Admin/test mode first (kasidkhan@gmail.com) — Google app verification required before public rollout

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

### 2026-04-27

**Project structure — Confirmed**

Agreed principle: `agents/` contains business logic per agent. Everything else at the same level is shared infrastructure any agent can use.

Maps to the 5-component agent model:
- `agents/*/graph.py` → **Planner** (LangGraph nodes + edges)
- `llm/` → **Brain** (LangChain LLM factory, prompts)
- `tools/` → **Tools** (what the brain can call)
- `db/` → **Memory** (long-term persistence, short-term in AgentState)
- `scheduler/` → **Orchestrator** (schedules, eligibility, error handling)

```
services/agent/
├── agents/
│   ├── profile/               ← fixed sequence graph
│   │   ├── graph.py
│   │   ├── state.py
│   │   └── nodes/
│   │       ├── cv_reader.py
│   │       ├── profile_builder.py
│   │       ├── job_ranker.py
│   │       ├── gap_analyser.py
│   │       └── result_writer.py
│   ├── email_tracker/         ← conditional routing graph
│   │   ├── graph.py
│   │   ├── state.py
│   │   └── nodes/
│   │       ├── gmail_reader.py
│   │       ├── email_classifier.py
│   │       └── status_writer.py
│   └── company_research/      ← Phase 2, placeholder only
│       ├── graph.py
│       └── state.py
├── llm/
│   ├── factory.py             ← returns Claude/GPT-4/Gemini based on config
│   └── prompts/
│       ├── profile_building.py
│       ├── job_ranking.py
│       ├── gap_analysis.py
│       └── email_classification.py
├── tools/
│   ├── pdf_extractor.py
│   ├── gmail.py
│   └── web_search.py          ← Phase 2 placeholder
├── scheduler/
│   ├── cron.py                ← APScheduler, all schedules
│   └── runner.py              ← eligible users, error handling, logging
├── db/
│   └── queries.py             ← all DB reads/writes centralised here
├── main.py
├── config.py
├── Dockerfile
└── railway.toml
```

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