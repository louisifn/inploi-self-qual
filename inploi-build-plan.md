# inploi Self-Qualification Layer — Build Plan

> Working spec for the inploi practical exercise. Drop this into the repo root as `PLAN.md` and build from it in Claude Code.

---

## 1. What we are building

A two-sided self-qualification layer for high-volume frontline hiring. A recruiter posts a role; the system reads the job description and generates the screening logic from it. A candidate applies through a familiar form, then hits a self-qualification page that shows them the honest reality of the role and asks the questions that actually decide fit. Strong fits submit with confidence. Poor fits are not rejected; they self-select out and get routed to roles that fit what they told us. The recruiter only ever sees genuine, available, interested applicants, each with the signal behind the fit made visible.

**One-liner:** Instead of filtering people out with a CV scan, we show them the truth of the role and let the wrong fits choose to walk, then send them somewhere better.

---

## 2. The thesis (why this, not "AI reads your CV")

inploi's customers are GAIL's, PureGym, Wagamama, Superdrug: frontline hourly roles drawing thousands of applications. The brief names three failure modes: not qualified, not available, not interested. The evidence is blunt that for frontline work these are not equal:

- Prior experience / formal qualification is the **weakest** predictor of frontline performance and retention (Van Iddekinge et al. 2019: experience correlates ~.06 with performance, ~.00 with turnover). Many of these candidates have no meaningful CV.
- What actually decides whether a match survives is **availability, schedule fit, location, and genuine intent** (Groh et al. 2015: 83% of carefully qualification-matched candidates still rejected or quit, over non-wage attributes).
- The cleanest causal lever for reducing wasted effort on both sides is **honest self-selection**: showing candidates the real role raises perceived employer honesty and lets poor fits withdraw themselves (Earnest, Allen & Landis 2011, k=52).

So we build the half the market under-serves: a candidate-side self-selection layer led by availability and intent, with the CV used only for a humane gap-explanation step, never as an automated gate.

**What we deliberately do NOT do:** opaque CV scoring, algorithmic knockout, automated rejection. Those carry the worst combined risk of false negatives, disparate impact, and regulatory exposure (EU AI Act high-risk, UK Equality Act indirect discrimination, ICO guidance on solely-automated decisions), and they destroy the honesty mechanism that makes self-selection work.

---

## 3. North star vs demo scope

### North star
inploi becomes the honest engagement layer that turns hiring into a genuine two-sided match. Every candidate sees the truth of a role before applying, self-selects, and is routed to where they actually fit. Recruiters only ever spend time on genuine, available, interested people. Over time this builds a preference-and-availability graph across an employer's whole estate: a candidate who is wrong for one GAIL's site but right for another three miles away is routed automatically. The moat is the honest two-sided data (real availability, real intent, real dealbreakers) that CV-centric ATSs never capture, because they only ever ask about the past, not about fit.

### Demo scope (this build)
- One job, set up from a real job description.
- The full candidate flow: familiar form, realistic preview, availability-led self-qualification, CV gap-explanation, the honest fork with redirect.
- The recruiter view: applications populating live with the fit signal made visible, triageable on signal not CV.
- Single session. Enough to prove the mechanism and the two-sided value, and to tell the story.

---

## 4. How it works (the three acts)

### Act 1 — Recruiter sets up the job
1. Recruiter pastes or uploads a job description.
2. The AI SDK reads it and generates the screening logic as structured data:
   - **Dealbreakers** (availability / shift pattern, location / commute, start date, right to work).
   - **2 to 3 role-specific questions** drawn from the JD.
   - **Optional situational scenario** (gets at conscientiousness / disposition, which predicts frontline performance far better than experience).
   - **Realistic-preview facts** extracted from the JD (true hours, pace, physical demands, pay range, location).
3. Recruiter reviews and edits the generated criteria, then posts.

This is the "AI does the work" moment and where strategic prompting shows.

### Act 2 — Candidate applies
1. **The familiar form (the "before").** A deliberately Greenhouse-style application: details, optional CV upload, a couple of questions, submit. This sets up the contrast.
2. **The self-qualification page (the product).**
   - **Realistic preview first.** Show the real role: the 6am start, weekends required, eight hours on your feet, the pay range, the location. Pay transparency alone is one of the highest-yield levers (SHRM: ~70% more applicants, ~66% higher quality).
   - **Availability and logistics questions next**, not CV. Can you work these shifts, can you reach this location, available from when, right to work. Most predictive axis for frontline, and instantly legible to a recruiter.
   - **CV gap-explanation (only if a CV was given).** AI does light alignment: "We saw X, can you confirm this is where it fits?" and "We didn't find evidence of Y, want to explain?" This is a humane counter to the false-negative problem: people surface transferable skills instead of being silently filtered.

### Act 3 — The honest fork
- **Strong fit** → submit with confidence; lands in the recruiter view with the signal attached.
- **Poor fit on a dealbreaker** → not a rejection. "This role needs weekend availability and you've said you can't do weekends, so it's probably not the one, but these two fit what you told us." Self-selection plus routing, framed as help.

### The recruiter view (the payoff)
Applications populate live. Each shows self-reported availability, fit flags, the candidate's own explanations of gaps, and a one-line AI signal summary. The recruiter triages on real signal, not by re-reading CVs. Watching qualified applications appear while mismatches self-select out is the memorable moment and the thing that makes the two-sided value visible.

---

## 5. Architecture

The mental shift from Convex: it was doing four jobs in one box (persistence, server logic, typed access, reactivity). Split them apart and three nearly vanish for a demo.

```
┌─────────────────────────── Cloudflare ───────────────────────────┐
│                                                                   │
│  React SPA (Vite, served as Worker static assets)                 │
│   • Recruiter panel + Candidate panel                             │
│   • Zustand store  ── shared in-session = "live" for free ──┐     │
│   • Tailwind + shadcn/ui + Framer Motion (the craft)        │     │
│            │  fetch /api/*                                   │     │
│            ▼                                                 │     │
│  Worker (Hono router)                                        │     │
│   • POST /api/jobs/generate   → AI SDK: JD → criteria        │     │
│   • POST /api/cv/analyse      → AI SDK: CV vs requirements   │     │
│   • POST /api/applications    → persist + derive signals     │     │
│   • GET  /api/applications    → recruiter list (poll target) │     │
│            │                                                 │     │
│            ▼                                                 │     │
│  D1 (SQLite) via Drizzle ORM  ◄── poll here for cross-window │     │
│                                    liveness (upgrade path)   │     │
│                                                             ─┘     │
│  [stretch] Durable Object + SSE for true multi-device push        │
└───────────────────────────────────────────────────────────────────┘
                         │ (only off-stack call)
                         ▼
              Model provider via Vercel AI SDK
        (Workers AI on-stack, or Gemini / Anthropic for quality)
```

### Reactivity, the only thing we are replacing
- **Default (demo walkthrough):** recruiter and candidate panels live in the same app and share one Zustand store. A candidate qualifying updates the recruiter view instantly, no backend round-trip. This reproduces the Convex "live" feel for free and is the fastest path.
- **Upgrade (two windows / two devices):** poll `GET /api/applications` every 1 to 2 seconds against D1. Looks live, trivial to build.
- **Stretch (true push):** a Durable Object holding the recruiter session, streaming via SSE. Only if multi-device live sync becomes part of the story. This is the plumbing that eats craft time, so treat as optional.

### Why this stack answers the brief
- TypeScript, React, Cloudflare Workers: required, all present.
- Vercel AI SDK: required, used server-side in the Worker.
- Everything on Cloudflare except the model API (unavoidable, expected), so the "I scoped to your stack" story is clean.
- Effort goes to UI craft and AI logic (both graded), not to rebuilding real-time sync.

---

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | Required; end-to-end types |
| Frontend | React + Vite | Direct match to "React + TS"; leaner than Next for a demo this size |
| Styling | Tailwind CSS | Fast, consistent |
| Components | shadcn/ui (Radix) | Accessible, polished primitives without building from zero |
| Motion | Framer Motion | The transitions that make it feel considered (craft is graded) |
| Client routing | React Router or TanStack Router | Two-sided app needs clean routes |
| Client state | Zustand | Replaces Convex client reactivity in-session; small and typed |
| API / server | Cloudflare Workers + Hono | Thin router; AI SDK calls live here |
| Database | Cloudflare D1 + Drizzle ORM | Edge SQLite; keeps the typed-data-access feel of Convex |
| AI | Vercel AI SDK | Required; provider-agnostic |
| Model provider | Workers AI (on-stack) OR Gemini / Anthropic | One-line swap; Workers AI keeps everything on Cloudflare, Gemini/Anthropic for generation quality |
| Validation / shared types | Zod | One schema shared by client and Worker |
| Deploy | Wrangler | Cloudflare Workers (static assets + API) |

**Next.js note:** Next via `@opennextjs/cloudflare` (OpenNext) deploys cleanly on Workers if preferred, but for this demo it adds an adapter layer without buying much. Vite SPA is the recommendation. Decide once, do not relitigate mid-build.

---

## 7. Data model

```
jobs
  id            text pk
  title         text
  description   text            -- raw JD
  location      text
  shift_pattern text
  pay_range     text
  start_date    text
  preview_facts json            -- extracted realistic-preview points
  status        text            -- draft | live
  created_at    int

screening_criteria               -- generated from the JD
  id            text pk
  job_id        text fk
  type          text            -- availability | logistics | role_specific | situational | cv_check
  prompt        text
  is_dealbreaker bool
  config        json            -- options, expected answer shape

applications
  id            text pk
  job_id        text fk
  candidate_name text
  email         text
  cv_text       text null
  status        text            -- in_progress | qualified | self_withdrew | redirected | submitted
  created_at    int

responses
  id            text pk
  application_id text fk
  criteria_id   text fk
  answer        text
  fit_flag      text            -- pass | fail | explain
  explanation   text null       -- candidate's own words on a gap

application_signals              -- derived, for the recruiter view
  application_id text pk fk
  availability_fit text          -- pass | fail
  intent_signal  text            -- soft signal from explanation quality
  gap_notes      json
  summary        text            -- one-line AI synthesis for triage
```

This maps directly onto the three axes: availability/logistics, role-specific/situational (intent and disposition), cv_check (qualification, used only to prompt explanation).

---

## 8. Where the AI SDK is used

All server-side in the Worker. AI is decision-support and self-selection, never an automated rejection gate. Keep every generation transparent to the candidate.

1. **JD → screening logic** (`/api/jobs/generate`). Input: raw JD. Output: Zod-validated structured criteria (dealbreakers, role questions, optional scenario) plus extracted preview facts. The strategic-prompting showcase.
2. **CV gap analysis** (`/api/cv/analyse`). Input: CV text + role requirements. Output: where the CV aligns ("confirm this fits?") and where evidence is missing ("want to explain?"). Generates the self-qualification prompts.
3. **Fit + routing** (candidate-facing, Act 3). Based on responses, determine fit on dealbreakers; if poor fit, generate the honest "probably not this one, but here are better fits" message. Transparent, candidate chooses to act on it.
4. **Recruiter signal summary** (recruiter view). Synthesise each application's signals into a glanceable one-liner for triage.

Prompts should be versioned in `/prompts` so they are reviewable and so "strategic prompting not autocomplete" is demonstrable in the session.

---

## 9. Build sequence

No dependencies skipped; each step leaves something runnable.

1. **Scaffold.** Vite + React + TS + Tailwind + shadcn. Worker + Hono. D1 + Drizzle + Wrangler config. Shared Zod schemas in `/shared`.
2. **Data layer.** Migrations, Drizzle models, seed one realistic frontline job (e.g. a barista or store-team role).
3. **Act 1.** Recruiter JD paste/upload → `/api/jobs/generate` → review/edit criteria → post job (status live).
4. **Act 2a.** Greenhouse-style application form (the "before"), persisting an in-progress application.
5. **Act 2b.** Self-qualification page: realistic preview block, availability-led questions, CV gap-explanation via `/api/cv/analyse`.
6. **Act 3.** Honest fork: qualified → submit; poor fit → redirect view with better-fit roles. Set application status accordingly.
7. **Recruiter view.** Live application list with fit signals and triage. Wire liveness (shared Zustand for single-screen; polling for two windows).
8. **Polish pass.** Motion, empty/loading states, microcopy, the contrast moment. Pull the frontend-design skill here and treat the interface as the deliverable.
9. **Seed + rehearse.** Pre-load demo data, script the walkthrough, prepare for the live-extension task.

---

## 10. Out of scope (state this; it is judgment they grade)

- Opaque CV scoring or candidate ranking.
- Automated rejection / knockout gate (self-selection only).
- Multi-tenant auth and accounts.
- Real ATS / Greenhouse integration (the form is a visual homage, not an integration).
- Multi-device real-time infra (unless stretch).
- Email, notifications, scheduling.

---

## 11. Decisions to defend in the session

- **Why this stack over Convex:** scoped to the Cloudflare requirement; reactivity replaced by shared in-session state (and polling for cross-window). Convex would have meant an off-stack data layer for a benefit a demo does not need.
- **Why availability-led, not CV-led:** the predictors of frontline fit are availability, schedule, intent, and disposition, not experience.
- **Why self-selection, not knockout:** preserves the perceived-honesty mechanism that makes the intervention work, and stays out of the bias / regulatory danger zone.
- **Why AI is support, not decision-maker:** EU AI Act high-risk classification, UK Equality Act indirect-discrimination and solely-automated-decision rules. Human oversight by design.

---

## 12. Success metrics (two-sided, from the research)

**Recruiter side**
- Qualified-applicant yield (share of reviewed applications that are genuinely fit).
- Recruiter review time saved.
- Signal per application (availability + intent + gap notes present).

**Candidate side**
- Completion rate (keep the core flow short; long flows collapse completion).
- Time to clarity (how fast a candidate learns whether this role fits).
- Redirect acceptance (poor fits who take a better-fit suggestion).
- Wasted applications avoided.

**Fairness guardrails**
- No screening on protected characteristics.
- Self-report and transparency throughout.
- Adverse-impact awareness at any gate (four-fifths thinking), even though we avoid hard gates.

---

## 13. Repo layout (starting point)

```
/shared        Zod schemas, shared types
/worker        Hono routes, AI SDK calls, D1 access (Drizzle)
/prompts       versioned AI prompts
/web           React app (Vite)
  /candidate   form, preview, self-qualification, fork
  /recruiter   setup, live application view
  /components  shadcn-based UI
  /store       Zustand
/db            Drizzle schema + migrations + seed
wrangler.toml
```
