import { Hono } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import { makeDb, schema } from "../db";
import {
  createApplicationRequestSchema,
  fitRoutingSchema,
  qualifyRequestSchema,
  type ForkOutcome,
  type SuggestedRole,
} from "@inploi/shared";
import { generateStructured, MODELS } from "../ai/client";
import {
  FIT_ROUTING_SYSTEM,
  FIT_ROUTING_VERSION,
  buildFitRoutingPrompt,
  buildTemplatedRouting,
} from "../../prompts/fit-routing";
import { computeDecision, deriveSignals, evaluate, templatedSummary } from "../qualify";
import { buildBoardApplication } from "../board";
import type { AppEnv } from "../types";

export const applicationsRoutes = new Hono<AppEnv>();

/** Recruiter board: submitted applications only, ordered by arrival (newest first). NO ranking. */
applicationsRoutes.get("/", async (c) => {
  const jobId = c.req.query("jobId");
  const db = makeDb(c.env.DB);
  const rows = await db.query.applications.findMany({
    where: jobId
      ? (a, { and: andFn, eq: eqFn }) => andFn(eqFn(a.jobId, jobId), eqFn(a.status, "submitted"))
      : (a, { eq: eqFn }) => eqFn(a.status, "submitted"),
    orderBy: (a, { desc }) => [desc(a.updatedAt)],
    columns: { id: true },
  });
  const board = await Promise.all(rows.map((r) => buildBoardApplication(db, r.id)));
  return c.json(board.filter(Boolean));
});

/** Act 2a: the "before" form creates an in-progress application and stores any pasted CV. */
applicationsRoutes.post("/", async (c) => {
  const parsed = createApplicationRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, 400);
  }

  const db = makeDb(c.env.DB);
  const applicationId = `app_${crypto.randomUUID().slice(0, 10)}`;
  const now = new Date();

  await db.insert(schema.applications).values({
    id: applicationId,
    jobId: parsed.data.jobId,
    candidateName: parsed.data.candidateName,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    cvText: parsed.data.cvText?.trim() ? parsed.data.cvText.trim() : null,
    status: "in_progress",
    createdAt: now,
    updatedAt: now,
  });

  return c.json({ applicationId });
});

/**
 * Act 2b/3: qualify. Persist the candidate's answers, evaluate the dealbreakers
 * deterministically, derive the descriptive recruiter signals, and compute the honest fork.
 * The AI only authors the redirect copy on the self-select-out branch (golden fallback).
 */
applicationsRoutes.post("/:id/qualify", async (c) => {
  const id = c.req.param("id");
  const parsed = qualifyRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, 400);
  }

  const db = makeDb(c.env.DB);
  const app = await db.query.applications.findFirst({ where: eq(schema.applications.id, id) });
  if (!app) return c.json({ error: "Application not found" }, 404);

  const criteria = await db.query.screeningCriteria.findMany({
    where: eq(schema.screeningCriteria.jobId, app.jobId),
    orderBy: (cr, { asc }) => [asc(cr.displayOrder)],
  });

  const answers = new Map(parsed.data.answers.map((a) => [a.criteriaId, a.answer]));
  // Verbatim free text from the "none of these fit" escape hatch, persisted alongside the
  // mapped answer (never an LLM verdict). Feeds the descriptive board, like gap explanations.
  const freeText = new Map(
    parsed.data.answers.filter((a) => a.explanation).map((a) => [a.criteriaId, a.explanation!]),
  );
  const gapExplanations = parsed.data.gapExplanations ?? [];
  const evaluated = evaluate(criteria, answers);
  const decisionInfo = computeDecision(evaluated);
  const signals = deriveSignals(evaluated, gapExplanations);

  // Persist responses (clean upsert: clear then insert).
  await db.delete(schema.responses).where(eq(schema.responses.applicationId, id));
  const responseRows: (typeof schema.responses.$inferInsert)[] = evaluated
    .filter((e) => e.answer != null)
    .map((e) => ({
      id: `${id}__${e.criterion.id}`,
      applicationId: id,
      criteriaId: e.criterion.id,
      answer: e.answer!,
      fitFlag: e.fitFlag,
      explanation: freeText.get(e.criterion.id) ?? null,
    }));
  const cvCheck = criteria.find((x) => x.type === "cv_check");
  if (cvCheck && gapExplanations.length) {
    responseRows.push({
      id: `${id}__${cvCheck.id}`,
      applicationId: id,
      criteriaId: cvCheck.id,
      answer: "reviewed",
      fitFlag: "explain",
      explanation: gapExplanations.map((g) => `${g.requirement}: ${g.text}`).join("\n"),
    });
  }
  if (responseRows.length) await db.insert(schema.responses).values(responseRows);

  // Pre-filter genuinely-eligible alternative roles from the seeded routes.
  let suggestedRoles: SuggestedRole[] = [];
  let routesForAi: { roleId: string; title: string; shiftPattern: string | null; reason: string | null }[] = [];
  if (decisionInfo.decision === "self_select_out") {
    const failedIds = decisionInfo.failedRoutable.map((e) => e.criterion.id);
    if (failedIds.length) {
      const routeRows = await db
        .select({
          toJobId: schema.jobRoutes.toJobId,
          reason: schema.jobRoutes.reason,
          title: schema.jobs.title,
          location: schema.jobs.location,
          shiftPattern: schema.jobs.shiftPattern,
          payRange: schema.jobs.payRange,
        })
        .from(schema.jobRoutes)
        .innerJoin(schema.jobs, eq(schema.jobRoutes.toJobId, schema.jobs.id))
        .where(
          and(
            eq(schema.jobRoutes.fromJobId, app.jobId),
            inArray(schema.jobRoutes.resolvesDealbreaker, failedIds),
          ),
        );
      const seen = new Set<string>();
      for (const r of routeRows) {
        if (seen.has(r.toJobId)) continue;
        seen.add(r.toJobId);
        suggestedRoles.push({
          jobId: r.toJobId,
          title: r.title,
          location: r.location,
          shiftPattern: r.shiftPattern,
          payRange: r.payRange,
          whyItFits: r.reason ?? "Fits what you told us.",
        });
        if (suggestedRoles.length >= 3) break;
      }
      routesForAi = suggestedRoles.map((r) => ({
        roleId: r.jobId,
        title: r.title,
        shiftPattern: r.shiftPattern,
        reason: r.whyItFits,
      }));
    }
  }

  // Author the message.
  const firstName = app.candidateName.split(" ")[0];
  let message = { headline: "", body: "" };
  let source: "live" | "fallback" = "fallback";

  if (decisionInfo.decision === "strong_fit") {
    message = {
      headline: `You're a strong fit, ${firstName}.`,
      body: "You clear everything this role actually needs. Submit with confidence. The team will see you're genuinely available and interested, with the signal already attached.",
    };
    suggestedRoles = [];
  } else if (decisionInfo.decision === "terminal") {
    message = {
      headline: "This one isn't the right fit, and that's an honest no, not a rejection.",
      body: "There's a hard requirement here that a different role couldn't get around, and you've been honest that it isn't a yes for you right now. We'd rather tell you straight than waste your time or pretend otherwise.",
    };
    suggestedRoles = [];
  } else {
    const missedAnswers = decisionInfo.failedRoutable.map((e) => e.answer ?? "");
    const fallback = buildTemplatedRouting(
      missedAnswers,
      routesForAi.map((r) => ({ roleId: r.roleId, reason: r.reason })),
    );
    const res = await generateStructured({
      env: c.env,
      model: MODELS.smart,
      schema: fitRoutingSchema,
      system: FIT_ROUTING_SYSTEM,
      prompt: buildFitRoutingPrompt({
        candidateName: app.candidateName,
        missedDealbreakers: decisionInfo.missedDealbreakers,
        passedDealbreakers: decisionInfo.matchedDealbreakers,
        answers: evaluated
          .filter((e) => e.answer != null)
          .map((e) => ({ question: e.criterion.prompt, answer: e.answer! })),
        alternativeRoles: routesForAi,
      }),
      fallback,
      promptVersion: FIT_ROUTING_VERSION,
      timeoutMs: 12_000,
    });
    source = res.source;
    message = { headline: res.data.headline, body: res.data.body };
    const whyMap = new Map(res.data.suggestedRoles.map((s) => [s.roleId, s.whyItFits]));
    suggestedRoles = suggestedRoles.map((r) => ({ ...r, whyItFits: whyMap.get(r.jobId) ?? r.whyItFits }));
  }

  // Persist the derived signals (descriptive only).
  await db.delete(schema.applicationSignals).where(eq(schema.applicationSignals.applicationId, id));
  await db.insert(schema.applicationSignals).values({
    applicationId: id,
    availabilityFit: signals.availabilityFit,
    intentSignal: signals.intentSignal,
    gapNotes: signals.gapNotes,
    summary: templatedSummary(evaluated, signals),
  });
  await db.update(schema.applications).set({ updatedAt: new Date() }).where(eq(schema.applications.id, id));

  const outcome: ForkOutcome = {
    decision: decisionInfo.decision,
    matchedDealbreakers: decisionInfo.matchedDealbreakers,
    missedDealbreakers: decisionInfo.missedDealbreakers,
    message,
    suggestedRoles,
    source,
  };
  return c.json(outcome);
});

/** Application basics: used by the candidate flow (candidate name, whether a CV was shared). */
applicationsRoutes.get("/:id", async (c) => {
  const db = makeDb(c.env.DB);
  const a = await db.query.applications.findFirst({ where: eq(schema.applications.id, c.req.param("id")) });
  if (!a) return c.json({ error: "Application not found" }, 404);
  return c.json({
    id: a.id,
    jobId: a.jobId,
    candidateName: a.candidateName,
    status: a.status,
    hasCv: Boolean(a.cvText && a.cvText.trim()),
  });
});

/** Act 3 finalize: the candidate's own choice. Never a gate; always their action. */
applicationsRoutes.post("/:id/submit", async (c) => {
  const id = c.req.param("id");
  const db = makeDb(c.env.DB);
  await db
    .update(schema.applications)
    .set({ status: "submitted", updatedAt: new Date() })
    .where(eq(schema.applications.id, id));
  const application = await buildBoardApplication(db, id);
  if (!application) return c.json({ error: "Application not found" }, 404);
  return c.json({ ok: true, status: "submitted", application });
});

applicationsRoutes.post("/:id/redirect", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { toJobId?: string };
  const db = makeDb(c.env.DB);
  await db
    .update(schema.applications)
    .set({ status: "redirected", redirectedToJobId: body?.toJobId ?? null, updatedAt: new Date() })
    .where(eq(schema.applications.id, c.req.param("id")));
  return c.json({ ok: true, status: "redirected" });
});

applicationsRoutes.post("/:id/withdraw", async (c) => {
  const db = makeDb(c.env.DB);
  await db
    .update(schema.applications)
    .set({ status: "self_withdrew", updatedAt: new Date() })
    .where(eq(schema.applications.id, c.req.param("id")));
  return c.json({ ok: true, status: "self_withdrew" });
});
