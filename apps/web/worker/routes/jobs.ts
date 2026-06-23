import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { makeDb, schema } from "../db";
import { ensureSeeded } from "../seed";
import {
  generateJobRequestSchema,
  generatedScreeningSchema,
  jobDetailSchema,
  jobSummarySchema,
  postJobRequestSchema,
  type JobDetail,
} from "@inploi/shared";
import { generateStructured, MODELS } from "../ai/client";
import {
  GOLDEN_SCREENING,
  JD_SCREENING_SYSTEM,
  JD_SCREENING_VERSION,
  buildJdScreeningPrompt,
} from "../../prompts/jd-screening";
import { mapScreeningToInserts } from "../screening";
import type { AppEnv } from "../types";

export const jobsRoutes = new Hono<AppEnv>();

/** Act 1: read a JD and generate the screening logic (AI SDK, Sonnet, golden fallback). */
jobsRoutes.post("/generate", async (c) => {
  const parsed = generateJobRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, 400);
  }

  const result = await generateStructured({
    env: c.env,
    model: MODELS.smart,
    schema: generatedScreeningSchema,
    system: JD_SCREENING_SYSTEM,
    prompt: buildJdScreeningPrompt(parsed.data),
    fallback: GOLDEN_SCREENING,
    promptVersion: JD_SCREENING_VERSION,
    timeoutMs: 20_000,
  });

  return c.json({ screening: result.data, source: result.source });
});

/** Act 1: post the (recruiter-edited) screening as a live job + its criteria. */
jobsRoutes.post("/", async (c) => {
  const parsed = postJobRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, 400);
  }

  const db = makeDb(c.env.DB);
  const jobId = `job_${crypto.randomUUID().slice(0, 8)}`;
  const { job, criteria } = mapScreeningToInserts(parsed.data.screening, {
    jobId,
    rawJd: parsed.data.jd,
    now: Date.now(),
    newId: () => `crit_${crypto.randomUUID().slice(0, 8)}`,
  });

  await db.insert(schema.jobs).values(job);
  if (criteria.length) await db.insert(schema.screeningCriteria).values(criteria);

  return c.json({ jobId });
});

/** List live, applyable jobs (excludes routable-target stubs). */
jobsRoutes.get("/", async (c) => {
  const db = makeDb(c.env.DB);
  await ensureSeeded(db);
  const rows = await db
    .select({
      id: schema.jobs.id,
      title: schema.jobs.title,
      employer: schema.jobs.employer,
      location: schema.jobs.location,
      shiftPattern: schema.jobs.shiftPattern,
      payRange: schema.jobs.payRange,
    })
    .from(schema.jobs)
    .where(and(eq(schema.jobs.status, "live"), eq(schema.jobs.isRoutableTarget, false)));
  return c.json(rows.map((r) => jobSummarySchema.parse(r)));
});

/** Job detail + ordered screening criteria, Zod-validated. */
jobsRoutes.get("/:id", async (c) => {
  const db = makeDb(c.env.DB);
  await ensureSeeded(db);
  const id = c.req.param("id");

  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, id) });
  if (!job) return c.json({ error: "Job not found" }, 404);

  const criteria = await db.query.screeningCriteria.findMany({
    where: eq(schema.screeningCriteria.jobId, id),
    orderBy: (cr, { asc: ascFn }) => [ascFn(cr.displayOrder)],
  });

  const detail: JobDetail = jobDetailSchema.parse({
    job: {
      id: job.id,
      title: job.title,
      employer: job.employer,
      location: job.location,
      shiftPattern: job.shiftPattern,
      payRange: job.payRange,
      startDate: job.startDate,
      status: job.status,
      description: job.description,
      previewFacts: job.previewFacts ?? null,
    },
    criteria: criteria.map((cr) => ({
      id: cr.id,
      type: cr.type,
      prompt: cr.prompt,
      helpText: cr.helpText ?? null,
      isDealbreaker: cr.isDealbreaker,
      config: cr.config ?? null,
      rationale: cr.rationale ?? null,
      displayOrder: cr.displayOrder,
    })),
  });

  return c.json(detail);
});
