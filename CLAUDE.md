# Visa Jobs App — Claude Code Context

## What this project is
A web application that helps international students in London find
visa-sponsored jobs. It cross-references job listings from Adzuna and
Reed APIs against the UK Home Office register of licensed Skilled Worker
sponsors, and provides AI-powered CV analysis against job descriptions.

## Tech stack
- **Frontend**: React + Vite (JavaScript), port 5173
- **Gateway**: FastAPI (Python 3.12), port 8000 — only public-facing service
- **Jobs service**: FastAPI (Python 3.12), port 8001 — internal only
- **CV Advisor service**: FastAPI (Python 3.12), port 8002 — internal only
- **Auth**: Google OAuth 2.0 → JWT stored in httpOnly cookies
- **Database**: TBD— sponsor register cache
- **Rate limiting**: TBD
- **HTTP client**: httpx (async)

## Folder structure
visa-jobs-app/
frontend/              ← React + Vite
src/
pages/
components/
package.json
.env.local
gateway/               ← FastAPI entry point
app/
auth/
jwt.py           ← token create/decode/dependency
google.py        ← OAuth routes
core/
config.py        ← all settings from .env
middleware/
security.py      ← CORS, headers, trusted host
rate_limit.py    ← slowapi per-user limiter
models/
jobs.py          ← Pydantic schemas
routers/
jobs.py          ← /api/jobs/* endpoints
services/
sponsor.py       ← UK sponsor register fuzzy matching
jobs.py          ← Adzuna + Reed integration
main.py            ← app factory, middleware wiring
requirements.txt
.env
services/
jobs/                ← job search microservice (port 8001)
cv-advisor/          ← CV vs JD analysis microservice (port 8002)
shared/                ← shared Pydantic models and utilities
models/
job.py
user.py
exceptions.py
constants.py
infra/
docker-compose.yml
nginx.conf
.env.example
CLAUDE.md              ← this file
Makefile
.gitignore

## Coding conventions
- No business logic in route handlers — always use services/
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
- JWT stored in httpOnly + Secure + SameSite=Lax cookies only
- Never store tokens in localStorage
- CORS locked to FRONTEND_ORIGIN only — never allow_origins=["*"]
- Rate limits: 10/min for /auth/*, 30/min for /jobs/search, 60/min default
- Swagger docs disabled in production (DEBUG=false)
- All string inputs sanitised via Pydantic validators

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

## Student-specific features to build
1. Visa situation onboarding — user inputs visa type, expiry, degree
   subject, age → app calculates their exact salary threshold and
   eligible roles
2. New entrant salary filter — students switching from Student/Graduate
   visa qualify at £33,400 not £41,700 (July 2025 rules)
3. A-rated sponsor filter only — B-rated companies cannot issue new CoS
4. Salary eligibility check per job card — shown before applying
5. Deadline calendar — graduate scheme deadlines by graduation year
6. Visa clock dashboard — days remaining, applications per week target
7. CV vs JD analysis — POST /api/cv/analyse via cv-advisor microservice - TBD ( A feature to be developed later)
8. Sponsor register outreach list — A-rated London sponsors by sector

## Running locally
# Terminal 1 — backend gateway
cd gateway
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev

## Current status / next tasks
- [ ] Scaffold gateway FastAPI app with Google OAuth and JWT middleware
- [ ] Implement jobs router with Adzuna + Reed integration
- [ ] Seed sponsor register from Home Office CSV into SQLite
- [ ] Build React frontend with job search page
- [ ] Add visa situation onboarding screen
- [ ] Add CV advisor microservice
- [ ] Add docker-compose for all services


##RoadMap
Phase A — Core data pipeline
- Job ingestion service — fetch & store jobs
- Jobs API — serve listings to the UI

Phase B — Enrichment pipeline
- Sponsor enrichment — add visa metadata to jobs
- Company intelligence — richer employer metadata
- Apply button & click tracking

Phase C -  Student profile & personalisation
- Student profile & visa situation onboarding
- New entrant salary filter
- Deadline calendar
