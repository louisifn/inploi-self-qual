# inploi: honest self-qualification layer

A two-sided candidate **self-qualification** layer for high-volume frontline hiring.

A recruiter pastes a job description; AI reads it and drafts the screening logic. A candidate
applies through a familiar Greenhouse-style form, then hits a self-qualification page that shows
the **honest reality** of the role and asks the questions that actually decide fit. Strong fits
submit with confidence. Poor fits are **never rejected**, they self-select out and get routed to
roles that fit what they told us. The recruiter only ever sees genuine, available, interested
applicants, with the fit signal made visible.

> Instead of filtering people out with a CV scan, we show them the truth of the role and let the
> wrong fits choose to walk, then send them somewhere better.

**The absence of an opaque CV-scoring / automated-rejection gate is deliberate**, not an oversight.
It preserves the honesty mechanism that makes self-selection work (Earnest et al. 2011) and keeps
the product out of the EU AI Act high-risk / UK Equality Act / ICO danger zone. Every signal the
recruiter sees is self-reported and descriptive: never a numeric score, never sortable, never a
knockout. (See `research.md` for the evidence base, `inploi-build-plan.md` for the full spec.)

## The three acts

1. **Act 1, Recruiter** (`/recruiter`): paste a JD → AI drafts dealbreakers (availability /
   location / start date / right-to-work), 2 to 3 role questions, and the realistic-preview facts →
   review & edit everything (toggle dealbreakers, set passing answers, reorder, delete) → post.
2. **Act 2a, The "before" form** (`/candidate/:jobId`): a deliberately generic, dull ATS
   application, the contrast baseline. No decision-relevant questions live here.
3. **Act 2b, Self-qualification** (`/candidate/:jobId/qualify/:appId`): the realistic preview
   first, then availability-led questions (a failing answer is *noted*, never blocked), then a
   humane CV gap-explanation step ("we didn't find evidence of X, want to explain?").
4. **Act 3, The honest fork**: strong fit → submit with confidence; poor fit on a routable
   dealbreaker → an honest redirect to better-fit roles; a terminal dealbreaker (right-to-work) →
   a respectful no with no fabricated alternatives. The candidate always keeps agency.
5. **Recruiter board** (`/recruiter/board/:jobId`): qualified applications populate **live**, each
   with its descriptive signal and the candidate's own words. Triage on signal, not CV.

## Stack & architecture

Everything runs on Cloudflare except the model API.

- **Frontend:** React + Vite SPA, Tailwind v4, shadcn-style components, Framer Motion, Zustand.
- **API:** Cloudflare Workers + Hono.
- **Data:** Cloudflare D1 (SQLite) + Drizzle ORM.
- **AI:** Vercel AI SDK (`generateObject`) server-side in the Worker, Google Gemini (`@ai-sdk/google`).
  Provider + models are set in **one place** (`apps/web/worker/ai/config.ts`) so switching model
  (or back to Anthropic / over to Workers AI) is a one-line change.
- **Shared types:** Zod schemas in `@inploi/shared`, used by both client and Worker.

### Monorepo (Turborepo + pnpm workspaces)

```
apps/web          the Cloudflare deployable: React client (web/) + Hono Worker (worker/) + prompts/
packages/shared   @inploi/shared: isomorphic Zod schemas / types (one source of truth)
packages/db       @inploi/db: Drizzle schema, seed data, migrations
```

### Where the AI is used (all server-side, all with golden fallbacks)

| Call | Endpoint | Model | Prompt |
|---|---|---|---|
| JD → screening logic | `POST /api/jobs/generate` | Gemini 3.5 Flash (smart tier) | `apps/web/prompts/jd-screening.ts` |
| CV gap analysis | `POST /api/cv/analyse` | Gemini 3.5 Flash (fast tier) | `apps/web/prompts/cv-analysis.ts` |
| Fit + routing copy | within `POST /api/applications/:id/qualify` | Gemini 3.5 Flash (smart tier) | `apps/web/prompts/fit-routing.ts` |
| Free-text answer interpretation | `POST /api/answers/interpret` | Gemini 3.5 Flash (fast tier) | `apps/web/prompts/answer-interpret.ts` |

Models map to two tiers (`smart`/`fast`) in `apps/web/worker/ai/config.ts`: both start on
`gemini-3.5-flash`; bump the smart tier to a Pro model there in one line.
| Recruiter signal summary | derived on qualify | (templated; signals are deterministic) | n/a |

The honest fork itself is computed **deterministically in code** (`apps/web/worker/qualify.ts`).
The model only ever authors copy and picks from pre-filtered, genuinely-eligible roles.

**Free-text escape hatch.** On availability/logistics dealbreakers, a candidate whose real
situation fits none of the options ("I can do Saturdays but never Sundays") can type it. The model
**maps** that to one of the criterion's existing options (or "unclear") and the candidate **confirms**
the mapping. It never decides pass/fail, never emits a score, and the deterministic fork still
evaluates the confirmed value. The terminal right-to-work question stays a clean binary (no escape
hatch). The fallback heuristic is built to **never fabricate a passing answer**: when a negation is
present or it's unsure, it returns "unclear", which flows safely to the honest fork.

## Run it

Requires Node ≥ 18 and pnpm. (This repo is pinned to Vite 6 / `@cloudflare/vite-plugin` 1.6.0 /
wrangler 4.20.0 to run on Node 23.4.x, which lacks `module.registerHooks`.)

```bash
pnpm install
pnpm db:migrate     # apply the D1 migration to the local (miniflare) database
pnpm dev            # one server: Worker runs in workerd inside Vite, with HMR
```

Open <http://localhost:5173>. The demo world (one bakery job + criteria + redirect roles + a couple
of background applications) seeds itself on first request.

### Demo-safe mode vs live AI

By default the app runs **demo-safe**: every AI endpoint returns a hand-tuned golden fallback, so
the full flow works deterministically with **no API key and no network**, ideal for a live demo.

To show genuinely live generation, add a key and disable the flag:

```bash
echo 'GEMINI_API_KEY=...' > apps/web/.dev.vars   # Google Gemini key; gitignored
# DEMO_SAFE_MODE is already "false" in wrangler.jsonc, then restart pnpm dev
```

With a key present, Act 1 generation and the CV/fork copy are produced live; without one, they fall
back silently. Either way the demo never stalls.

### Reset between demo runs

```bash
pnpm reset    # clears candidate activity, restores the seeded background applications
pnpm seed     # full rebuild of the demo world from scratch
```

(Both POST to dev-only endpoints; the dev server must be running.)

## The demo walkthrough

The most persuasive sequence, two paths back to back:

1. Open the **board** (`/recruiter/board/<jobId>`) on one screen/device. It shows the background
   applications and a live indicator.
2. On another, run a **strong-fit** candidate (`/candidate/<jobId>`): familiar form → the honest
   preview → answer the questions truthfully → "you're a strong fit" → submit. Watch it **arrive
   live** on the board.
3. Run a **poor-fit** candidate and answer "No, I can't do weekends": the same flow ends in an
   honest redirect to weekday roles, and that application **never appears** on the recruiter board.
   The absence is the point.

Helper script (drives the candidate flow headlessly and screenshots each phase):

```bash
node scripts/flow.mjs <jobId> <applicationId> strong|weekends|terminal
node scripts/shot.mjs <path> <out.png> [WxH] [waitMs] [clickText...]
```

## End-to-end tests

A full browser E2E suite drives the real system Chrome (via CDP / puppeteer-core) through every
act with assertions: Act 1 generate→edit→post, the strong / weekends / terminal / no-CV candidate
journeys, the "noted" moment, all three fork outcomes, live board arrival via the poll, the
anti-score guardrails, and reset. It's the repeatable proof that the whole flow works.

```bash
pnpm dev      # in one terminal
pnpm e2e      # in another: ~31 assertions, screenshots written to /tmp/e2e
```

Harness in `scripts/e2e/`. Exits non-zero on any failure (CI-friendly).

## Deliberately out of scope

Opaque CV scoring / candidate ranking · automated rejection or knockout gates · multi-tenant auth ·
real ATS integration · email / notifications · server-push real-time infra (the cross-device board
uses a 1.5s D1 poll; a Durable Object + SSE is the obvious next step). A situational-judgement item
was considered and **cut**. It invites a "so you're scoring the answer?" question that would
undercut the structural anti-score guarantee.
