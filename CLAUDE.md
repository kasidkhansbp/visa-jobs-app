# Visa Jobs App

London TPM jobs with visa sponsorship. Cross-references Adzuna + Reed listings against the UK Home Office licensed Skilled Worker sponsors register.

## Tech stack
- **Frontend**: React + Vite (JS), port 5173
- **Gateway**: FastAPI (Python 3.12), port 8000 — only public-facing service
- **Auth**: Google OAuth 2.0 → JWT in httpOnly cookies
- **HTTP client**: httpx (async)
- **DB**: SQLite (dev), SQLAlchemy ORM

## Coding conventions
- Pydantic v2 validates all query params and request bodies before handlers run
- All `/api/*` routes require JWT via `get_current_user` dependency
- JWT verified at gateway only — downstream services trust `X-User-Id` header
- Services on internal Docker network — never exposed to internet
- No service calls another service directly
- Secrets in `.env` only — never hardcoded

## Security rules
- JWT in httpOnly + Secure + SameSite=Lax cookies only — never localStorage
- CORS locked to `FRONTEND_ORIGIN` — never `allow_origins=["*"]`
- Rate limits: 10/min `/auth/*`, 30/min `/jobs/search`, 60/min default
- Swagger disabled in production (`DEBUG=false`)
- Pydantic schemas with explicit constraints on all user input routes — reject, don't sanitise
- SQL: SQLAlchemy ORM or `:param` bindparams only — never f-strings or concatenation
- IDOR: every user-resource query must scope to `user_id` — never fetch by ID alone
  - Pattern: `.where(Model.id == resource_id, Model.user_id == current_user.id)`
- Never `**body.dict()` onto a model — always explicit field assignment
- Never `dangerouslySetInnerHTML` — access control enforced server-side only

## Dev commands

### Start frontend
```bash
cd frontend && npm run dev
```

### Start gateway service
```powershell
# From project root (Windows) — project root must be on PYTHONPATH
# so Python can resolve the `shared` package (shared/)
$env:PYTHONPATH="."; gateway\venv\Scripts\uvicorn app.main:app --reload --port 8000 --app-dir gateway
```

Install dependencies first if needed:
```bash
gateway\venv\Scripts\pip install -r gateway\requirements.txt
```

### Start agent service
```powershell
# From project root (Windows) — both services/ and the project root must be on PYTHONPATH
# so Python can resolve both the `agent` package (services/agent/) and the `shared` package (shared/)
$env:PYTHONPATH="services;."; $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5433/visa_jobs"; services\agent\venv\Scripts\python services\agent\main.py
```

Install dependencies first if needed:
```powershell
services\agent\venv\Scripts\pip install -r services\agent\requirements.txt
```

#### Known gotchas for the agent service

**`shared` package**: `connection.py` and other modules import from `shared.*`. The `shared/` folder lives at the project root, so `.` must be in `PYTHONPATH` alongside `services/`.

**`DATABASE_URL` not found**: `shared/db/connection.py` reads `os.environ["DATABASE_URL"]` directly — it does NOT use `AgentConfig`. Pydantic settings loads `.env` into the config object but does not inject values back into `os.environ`. If this error appears, set `os.environ["DATABASE_URL"]` from `AgentConfig` in `main.py` before the scheduler starts.

**Local DB URL** (from `services/agent/.env`):
```
postgresql://postgres:postgres@localhost:5433/visa_jobs
```
Port is **5433**, not the default 5432. Postgres must be running locally on that port.

## External APIs
- Home Office sponsor register: `gov.uk/government/publications/register-of-licensed-sponsors-workers` (public CSV, daily)
- Adzuna: `api.adzuna.com/v1/api/jobs`
- Reed: `reed.co.uk/developers`
- Companies House: `developer.companieshouse.gov.uk` (no auth, resolves trading vs legal name)
