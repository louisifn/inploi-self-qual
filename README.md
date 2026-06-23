# inploi self-qualification layer

A two-sided candidate self-qualification layer for high-volume frontline hiring, built as a work sample for inploi.

## The problem, and why I chose this direction

inploi's world is high-volume frontline hiring: thousands of applicants for hourly hospitality, retail, grocery and warehouse roles, where a bad match costs both sides and turnover is brutal. The market instinct is to automate the recruiter's side: scan CVs, score and rank candidates, knock the weak ones out. I deliberately did not build that.

For frontline work the evidence is clear that prior experience and credentials barely predict performance or retention (Van Iddekinge et al. 2019 put experience at roughly .06 for performance and .00 for turnover). So CV scoring automates the weakest-evidence, highest-risk lever. It carries the worst combined exposure to false negatives, disparate impact, and regulation (EU AI Act high-risk, UK Equality Act s.19, ICO 2024).

The under-served, cleanest-evidence lever is the candidate's own side: honest self-selection. A realistic preview of the role raises perceived employer honesty, which is the one mechanism that survives the research on why previews work (Earnest et al. 2011). Show people the unspun truth of a role and a few decision-relevant questions on the axes that genuinely predict frontline fit (availability, schedule, location, start date, intent), and the wrong fits walk by their own choice, then get routed somewhere better. The recruiter only ever sees genuine, available, interested applicants, with the fit signal made visible. The full evidence base is in `research.md`.

## The central design decision: the model never decides fit

The fit decision is computed deterministically in code (`apps/web/worker/qualify.ts`), never by the model. A dealbreaker passes only if the candidate's self-reported answer is in its transparent `passValues`; the three-way fork (strong fit, self-select out, terminal) is plain code. The model never scores, ranks, or adjudicates a candidate.

This is the deliberate judgment call at the heart of the build, for two reasons. First, risk: an opaque model score over candidates is exactly the bias-and-regulation hazard above, whereas a self-reported, descriptive signal is not. Second, mechanism: self-selection only works if the candidate is genuinely choosing. The moment a hidden model is grading them, it stops being honest self-qualification and becomes the knockout gate I set out to avoid. The absence of the scoring gate is the product, not an omission, and I made it structural: no field in any schema can become a score or a sort key.

## How the AI is used: the model maps, the code decides

Four model calls, all server-side in the Worker, all through the Vercel AI SDK's `generateObject` against a shared Zod schema, all versioned, all with a golden fallback. The boundary is the same on every one: the model generates, writes copy, or maps free text, but never adjudicates.

| Call | Endpoint | The model's job, and its limit |
|---|---|---|
| JD to screening logic | `POST /api/jobs/generate` | Reads any pasted JD and drafts the dealbreakers, the honest-preview facts, role questions, and a schedule profile. The recruiter reviews and edits all of it before it goes live. It must not screen on experience or any protected characteristic. |
| CV gap analysis | `POST /api/cv/analyse` | Turns a pasted CV into self-report prompts ("we did not see X, want to explain?"). It never passes, fails, scores, or ranks. |
| Fit and routing copy | inside `POST /api/applications/:id/qualify` | Only writes the warm redirect copy and the per-card "why this fits" line, drawn from real target jobs the code already chose. The fork is computed before the model is called. |
| Free-text interpretation | `POST /api/answers/interpret` | Maps a candidate's free text to one of the criterion's existing options, or to "unclear". The candidate confirms the mapping, then the deterministic fork evaluates the confirmed value. |

The fork (`qualify.ts`) and the routing target selection (the schedule-profile matcher in the same file) run entirely in code. Prompts are versioned and live in `apps/web/prompts`; every model output is Zod-validated; any failure (timeout, wrong shape, no key) degrades silently to a hand-tuned golden fallback, so the demo never stalls.

The free-text escape hatch is the most safety-sensitive surface, so it is the most constrained. A candidate whose real situation fits none of the options ("I can do Saturdays but never Sundays") types it, the model maps it to an existing option, and the candidate confirms before it counts. The model never decides pass or fail. The fallback heuristic is built to never fabricate a passing answer: on any negation or uncertainty it returns "unclear", which flows safely to the honest fork. The terminal right-to-work question has no escape hatch.

## What I deliberately left out, and why

- No CV scoring, ranking, or automated rejection gate. This is the whole point, above. The recruiter signal is self-reported and descriptive, never a number, never sortable, never a knockout.
- Routing only ever points to real jobs in the database. When a candidate self-selects out, the code matches their failing axis against the schedule profiles of other real, live jobs and offers up to three; if none fit, it gives an honest no-match close. The model writes the copy but never invents a role.
- A situational-judgement question was considered and cut, because it invites a "so you are scoring the answer?" question that would undercut the structural anti-score guarantee.

## Honest caveats

- The typeface is Hanken Grotesk, a free, warm grotesque chosen as the closest open match to inploi's licensed Innovator Grotesk. The brand colour and feel are matched; the exact licensed face is not.
- The deployed demo is gated behind an access code, purely to stop the public from draining the live Gemini key. A per-IP rate limit on the AI endpoints is the backstop. There is no gate locally.
- This is a work sample, not a product: single-tenant, no auth beyond the demo gate, no real ATS integration or notifications, and the cross-device live board uses a short D1 poll rather than true server push.

## The stack, mapped to the brief

| Required | Used here |
|---|---|
| TypeScript | End to end, with one shared Zod source of truth in `@inploi/shared` |
| React | React 19 + Vite SPA (`web/`), Tailwind v4, shadcn-style components, Framer Motion, Zustand |
| Cloudflare Workers | Hono Worker (`worker/`), D1 (SQLite) + Drizzle ORM, deployed to Workers |
| Vercel AI SDK | `generateObject` server-side in the Worker. Provider and models live in one file (`worker/ai/config.ts`), currently Google Gemini via `@ai-sdk/google` |

Monorepo (Turborepo + pnpm workspaces):

```
apps/web          React client (web/) + Hono Worker (worker/) + versioned prompts (prompts/)
packages/shared   @inploi/shared: isomorphic Zod schemas and types (one source of truth)
packages/db       @inploi/db: Drizzle schema, migrations, the seeded prose job pool
```

## Run it cold, no key needed

Requires Node and pnpm. The repo is pinned to Vite 6, `@cloudflare/vite-plugin` 1.6.0 and wrangler 4.20.0 to run on Node 23.4.x.

```bash
pnpm install
pnpm db:migrate     # apply the D1 migrations to the local miniflare database
pnpm dev            # one server: the Worker runs in workerd inside Vite, with HMR
```

Open <http://localhost:5173>. The demo world (a varied pool of frontline jobs plus a couple of background applications) seeds itself on first request. By default it runs **demo-safe**: every AI call returns a golden fallback, so the whole flow works with no key and no network.

To see live generation, add a Gemini key and restart:

```bash
echo 'GEMINI_API_KEY=...' > apps/web/.dev.vars   # gitignored
pnpm dev
```

With a key, Act 1 generation, the CV and routing copy, and the free-text mapping are produced live; without one they fall back silently. The seed even generates the job pool live from prose when a key is present, so those criteria are model-generated rather than hardcoded.

Between demo runs: `pnpm reset` clears candidate activity, `pnpm seed` rebuilds the world.

## The deployed demo

Live at <https://inploi.louisifnewman.com> (backup: <https://inploi-self-qual.lifnewman.workers.dev>). The demo is gated by a short access code that stops the public from draining the live key; the code is shared with reviewers rather than committed here.

## End-to-end tests

A browser suite drives the real Chrome through every act: Act 1 generate, edit and post; the strong, weekends, terminal and no-CV journeys; the noted (never blocked) moment; all three fork outcomes; dynamic routing to real pool jobs with the no-fabrication and terminal-stays-terminal checks; the escape hatch never fabricating a pass; live board arrival; and the anti-score guardrails. It is model-agnostic, so it stays green on golden fallbacks or live.

```bash
pnpm dev      # one terminal
pnpm e2e      # another: 46 assertions, screenshots written to /tmp/e2e
```

The harness is in `scripts/e2e/`. It exits non-zero on any failure.

## A short architecture tour

- `apps/web/worker/qualify.ts`: the deterministic fork and the routing matcher. Start here. This is where fit is decided, in code.
- `apps/web/worker/ai/config.ts`: provider and models in one place.
- `apps/web/worker/ai/client.ts`: the one generation wrapper (Zod-validated, golden fallback, demo-safe aware).
- `apps/web/prompts/*`: the four versioned prompts and their golden fallbacks.
- `packages/shared/src`: the Zod schemas that are the single source of truth for AI I/O and the D1 columns.
- `packages/db/src`: the schema, the seeded prose job pool, and the captured goldens.
