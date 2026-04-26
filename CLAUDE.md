# Visa Jobs App — Claude Code Context

## What this project is
A web application that helps collects TPMs jobs in London with
visa-sponsored. It cross-references job listings from Adzuna and
Reed APIs against the UK Home Office register of licensed Skilled Worker
sponsors.

## Tech stack
- **Frontend**: React + Vite (JavaScript), port 5173
- **Gateway**: FastAPI (Python 3.12), port 8000 — only public-facing service
- **Jobs service**: Clients which can make schedule call to third party.
- **Auth**: Google OAuth 2.0 → JWT stored in httpOnly cookies
- **Database**: TBD— sponsor register cache
- **Rate limiting**: TBD
- **HTTP client**: httpx (async)

## Folder structure
visa-jobs-app/
frontend/              ← React + Vite
gateway/
services/
infra/

## Coding conventions
- All query params and request bodies validated by Pydantic v2 before
  the handler runs
- All /api/* routes require Bearer JWT via get_current_user dependency
- JWT verified once at the gateway — downstream services trust the
  X-User-Id header and never re-verify
- Services on internal Docker network only — never exposed to internet
- No service calls another service directly
- Each service has its own requirements.txt and Dockerfile
- Secrets only in .env — never hardcoded anywhere

## Security rules

### Auth & transport
- JWT stored in httpOnly + Secure + SameSite=Lax cookies only
- Never store tokens in localStorage
- CORS locked to FRONTEND_ORIGIN only — never allow_origins=["*"]
- Rate limits: 10/min for /auth/*, 30/min for /jobs/search, 60/min default
- Swagger docs disabled in production (DEBUG=false)

### Input validation
- Every route that accepts user input must have a Pydantic schema with explicit
  field constraints (min_length, max_length, pattern). Never use raw str/int
  params on POST/PATCH routes.
- All string inputs sanitised via Pydantic validators — reject, don't sanitise

### SQL injection
- Never build queries with string formatting or concatenation
- Always use SQLAlchemy ORM or bindparams with text(). If a raw text() query
  is needed, it must use :param syntax, never f-strings

### Access control (IDOR)
- Every query for a user-owned resource must scope to the authenticated user_id.
  Never fetch by resource ID alone
- Pattern: .where(Model.id == resource_id, Model.user_id == current_user.id)
- Admin routes must additionally check user.email against a hardcoded allowlist
  in the gateway — never trust the frontend to enforce admin access

### Mass assignment
- Never map a request body directly onto a DB model with **body.dict()
- Always construct model instances with explicit field assignment

### File storage
- Storage keys must use UUIDs, never sequential IDs
- Files must always be accessed through the authenticated gateway, never via
  direct storage URLs

### Frontend
- Never use dangerouslySetInnerHTML
- All access control checks that matter must be enforced server-side.
  Frontend hiding of UI elements is UX only, not security

## Environment variables (gateway/.env)
- DEBUG=true
- JWT_SECRET=                    ← required, min 32 chars
- JWT_EXPIRY_MINUTES=60
- JWT_REFRESH_EXPIRY_DAYS=7
- GOOGLE_CLIENT_ID=              ← required
- GOOGLE_CLIENT_SECRET=          ← required
- GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
- FRONTEND_ORIGIN=http://localhost:5173
- ADZUNA_APP_ID=                 ← free tier from adzuna.co.uk
- ADZUNA_APP_KEY=
- REED_API_KEY=                  ← free from reed.co.uk/developers
- DATABASE_URL=sqlite:///./visa_jobs.db

## Key external data sources
- UK Home Office sponsor register: gov.uk/government/publications/
  register-of-licensed-sponsors-workers (public CSV, updated daily)
- Adzuna Jobs API: api.adzuna.com/v1/api/jobs (free tier available)
- Reed Jobs API: reed.co.uk/developers (free for personal use)
- Companies House API: developer.companieshouse.gov.uk (free, no auth
  needed for basic search) — used to resolve trading name vs legal name

## TPM-specific features to build
- 

## Running locally

### Terminal 1 — backend gateway
cd gateway
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

### Terminal 2 — frontend
cd frontend
npm run dev

## Current status / next tasks
- [ ] 


## RoadMap

Phase A — Services/ Core data pipeline
- Build third party client to make API call and get data.
- Build rescheduler - for schedule call to the third party, remove duplicates.
- Store the data into DB.

Phase B - Gateway - API for Data access
- test

Phase C - Frontend - UI for data visualization
- test
