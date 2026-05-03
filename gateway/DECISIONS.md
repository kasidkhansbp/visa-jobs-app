# Gateway — Decision Log

Decisions recorded with date. If a decision changes, a new entry is added below the original — never overwrite.

---

## Jobs Sector Classification

### 2026-05-03 — Sector classification approach — Under discussion

**Decision:** Use keyword-based classification (not LLM) to assign sectors to jobs.

**Why keyword-based:**
- Deterministic — same job always gets same sector, no LLM variability
- Free — no API cost for 6K+ jobs
- Fast — classify all jobs in seconds
- Auditable — rules are readable and understandable
- Easy to fix — update keyword list, re-run

**Production data available:**
- Week of Apr 13: 295 jobs
- Week of Apr 20: 3,967 jobs
- Week of Apr 27: 1,751 jobs
- Total: 6,013 jobs across 3 weeks

**Draft sectors and keywords:**

| Sector | Keywords |
|---|---|
| Software Delivery | platform eng, delivery, SWE, agile, scrum, software engineering |
| Infrastructure | cloud, AWS, GCP, Azure, infrastructure, DC, networks, SRE, reliability |
| Cybersecurity | security, SecOps, GRC, identity, compliance, cyber, SOC |
| AI / ML | AI, ML, machine learning, LLM, MLOps, data science, GenAI |
| Data platforms | data, analytics, data mesh, data warehouse, BI, pipeline |
| Fintech / Payments | fintech, payments, PSD2, banking, financial, FCA, fraud |
| DevOps | DevOps, platform engineering, release, CI/CD, SRE |
| E-commerce | e-commerce, retail, marketplace, logistics, fulfilment |
| Product | product management, product delivery, roadmap |
| Other | anything that doesn't match above |

**Confirmed decisions — 2026-05-03:**

- Sector list confirmed as above ✓
- Single sector per job — first match in priority order wins ✓
- Priority order (highest to lowest):
  1. Infrastructure
  2. Cybersecurity
  3. AI / ML
  4. Data platforms
  5. Fintech / Payments
  6. Software Delivery
  7. DevOps
  8. E-commerce
  9. Product
  10. Other (default if no match)

**Open questions (pending decision):**
- [ ] Where classification runs: at ingest time in jobs-services, or as a separate backfill script?
- [ ] Store sector as a column on `jobs` table or separate `job_sectors` table?

**Reports to build once classification is done:**
- Sector heat map with 3-4 week trend
- Total TPM jobs in London over time
- Frequent sponsors — companies sponsoring most consistently
- Top hiring employers for TPMs

---

## Stories Feature

### 2026-05-02 — DB Table Design

**Revised decision:** Sharpen fields stored in a separate child table, not JSON. Reason: Phase 2 AI needs to query individual sections cleanly (`WHERE section_type = 'broken'`). JSON column queries are awkward and slower.

**Table: `interview_stories`**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users, CASCADE delete |
| `title` | String(255) | Story tab label |
| `narrative` | Text | Raw long-form story |
| `created_at` | DateTime | When story was created |
| `updated_at` | DateTime | Updated on every save — used for cache invalidation |

**Table: `interview_story_sections`**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `story_id` | UUID | FK → interview_stories, CASCADE delete |
| `section_type` | Enum | `broken`, `urgency`, `role`, `tech`, `org`, `decision`, `hardest`, `impact` |
| `content` | Text | User's answer for that section |

- `section_type` enforced as PostgreSQL ENUM — only 8 known values allowed at DB level
- Unique constraint on `(story_id, section_type)` — one row per section per story
- Adding a new prompt type in Phase 2 = `ALTER TYPE story_section_type ADD VALUE 'new_type'`
- `filled_count` computed in gateway by counting non-empty `content` rows — not stored
- Both tables written in one transaction on save — if either fails, both roll back. No partial state.
- Index on `user_id` — all queries scoped to logged-in user.

---

### 2026-05-02 — Default Seed Story

**Decision:** On first login (new user creation), seed one pre-filled example story.

**Why:** Blank page on first visit is a poor experience. A concrete example teaches users what good looks like.

**Seed content:** PSD2 SCA rollout story (title, full narrative, all 8 sharpen fields pre-filled).

**Where:** `gateway/app/routers/auth.py` — in the `if user is None` block after user creation.

**Existing users:** Gateway fallback — if `GET /api/stories` returns empty list, create the seed story on the fly and return it. Prevents blank page for existing users who never had a story created.

---

### 2026-05-02 — Stories Loading Strategy

**Decision:** Three-step loading on page visit to balance speed and UX.

```
Step 1 — Fetch story list (lightweight)
         Returns: [{ id, title, updated_at, filled_count }]
         UI renders all tabs immediately

Step 2 — Fetch first story in full (immediate, blocks render)
         Returns: { id, title, narrative, sharpen }
         UI shows first story content right away

Step 3 — Fetch remaining stories in background (non-blocking)
         Silently cached one by one
         By the time user clicks Story 2, it's already there
```

**Why:** User sees content immediately without waiting for all stories to load. Background prefetch means subsequent tab clicks feel instant.

**Story order:** `created_at ASC` — oldest story is always Story 1, shown first.

**On demand fallback:** If user clicks a story before background fetch reaches it, fetches on demand. No blank states.

---

### 2026-05-02 — Frontend Caching Strategy

**Decision:** StoriesContext at app level holds list + full story cache.

| Event | Action |
|---|---|
| First visit | Fetch list → cache |
| Tab click (cached) | Serve from cache instantly |
| Tab click (not cached) | Fetch full story → cache |
| Save success | Update cache after API confirms — no optimistic updates |
| Add story | Add to list + cache |
| Delete story | Remove from list + cache |
| Window focus (new tab) | Re-fetch list → compare `updated_at` → invalidate changed stories |
| Page refresh | Full re-fetch |
| Different user login | Clear cache immediately |
| Logout | Clear cache immediately (privacy) |

**Cache tied to user:** `currentUserId` tracked in context. Cache cleared when user changes — prevents data leaking between users on same device.

**Cross-device staleness:** Accepted in Phase 1. Page refresh always fetches fresh data.

**Save behaviour:** Cache only updated after API confirms success. Error toast shown on failure. No silent data loss.
