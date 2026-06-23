import type { DB } from "./db";
import { schema } from "./db";
import * as seed from "@inploi/db/seed-data";
import { POOL_JOBS, type PoolJob } from "@inploi/db/seed-jobs";
import { POOL_GOLDENS } from "@inploi/db/seed-jobs-golden";
import { generatedScreeningSchema, type ScheduleProfile } from "@inploi/shared";
import { generateStructured, MODELS } from "./ai/client";
import {
  GOLDEN_SCREENING,
  JD_SCREENING_SYSTEM,
  JD_SCREENING_VERSION,
  buildJdScreeningPrompt,
} from "../prompts/jd-screening";
import { mapScreeningToInserts } from "./screening";
import type { Bindings } from "./types";

// The primary demo role (Maple & Crumb barista) is a hard, weekend-and-early role.
const PRIMARY_SCHEDULE_PROFILE: ScheduleProfile = {
  weekends: "required",
  earliestStart: "early",
  startTiming: "immediate",
  transport: "car_or_self",
};

/** Delete every row, FK-safe order (D1 doesn't enforce FKs, but order anyway). */
export async function wipeAll(db: DB) {
  await db.delete(schema.applicationSignals);
  await db.delete(schema.responses);
  await db.delete(schema.applications);
  await db.delete(schema.jobRoutes);
  await db.delete(schema.screeningCriteria);
  await db.delete(schema.jobs);
}

/** Insert the background applications (and their responses + signals) with staggered timestamps. */
async function insertBackgroundApps(db: DB, now: number) {
  for (const app of seed.BACKGROUND_APPS) {
    const ts = new Date(now - app.minutesAgo * 60_000);
    await db.insert(schema.applications).values({
      id: app.id,
      jobId: seed.PRIMARY_JOB_ID,
      candidateName: app.candidateName,
      email: app.email,
      phone: app.phone ?? null,
      cvText: app.cvText ?? null,
      status: app.status,
      redirectedToJobId: app.redirectedToJobId ?? null,
      createdAt: ts,
      updatedAt: ts,
    });
    await db.insert(schema.responses).values(
      app.responses.map((r, i) => ({
        id: `${app.id}_r${i}`,
        applicationId: app.id,
        criteriaId: r.criteriaId,
        answer: r.answer,
        fitFlag: r.fitFlag,
        explanation: r.explanation ?? null,
      })),
    );
    await db.insert(schema.applicationSignals).values({
      applicationId: app.id,
      availabilityFit: app.signal.availabilityFit,
      intentSignal: app.signal.intentSignal,
      gapNotes: app.signal.gapNotes,
      summary: app.signal.summary,
    });
  }
}

/**
 * Generate one pool job from its prose JD through the SAME live generate call Act 1 uses, so the
 * criteria + scheduleProfile are model-generated, then persist. Falls back to the job's captured
 * golden in demo-safe mode or on any generation failure, so a seed never half-completes.
 */
async function seedPoolJob(db: DB, env: Bindings, job: PoolJob, now: number) {
  const res = await generateStructured({
    env,
    model: MODELS.smart,
    schema: generatedScreeningSchema,
    system: JD_SCREENING_SYSTEM,
    prompt: buildJdScreeningPrompt({ jd: job.prose }),
    fallback: POOL_GOLDENS[job.id] ?? GOLDEN_SCREENING,
    promptVersion: JD_SCREENING_VERSION,
    timeoutMs: 25_000,
  });
  let n = 0;
  const { job: jobRow, criteria } = mapScreeningToInserts(res.data, {
    jobId: job.id,
    rawJd: job.prose,
    now,
    newId: () => `${job.id}__c${n++}`,
  });
  await db.insert(schema.jobs).values(jobRow);
  if (criteria.length) await db.insert(schema.screeningCriteria).values(criteria);
}

/** Build the whole demo world from scratch. Idempotent (wipes first). */
export async function seedWorld(db: DB, env: Bindings, now = Date.now()) {
  await wipeAll(db);

  // The primary demo job (the demo link target): hardcoded + stable, with a schedule profile.
  await db.insert(schema.jobs).values({
    ...seed.PRIMARY_JOB,
    previewFacts: seed.PRIMARY_PREVIEW_FACTS,
    scheduleProfile: PRIMARY_SCHEDULE_PROFILE,
    createdAt: new Date(now),
  });
  await db.insert(schema.screeningCriteria).values(
    seed.PRIMARY_CRITERIA.map((c) => ({
      id: c.id,
      jobId: seed.PRIMARY_JOB_ID,
      type: c.type,
      prompt: c.prompt,
      helpText: c.helpText ?? null,
      isDealbreaker: c.isDealbreaker,
      config: c.config,
      rationale: c.rationale ?? null,
      displayOrder: c.displayOrder,
    })),
  );

  // The varied pool: each real job generated from its prose (live) or its captured golden.
  // These are full, applyable jobs AND the routing targets, so routing has real coverage.
  await Promise.all(POOL_JOBS.map((job) => seedPoolJob(db, env, job, now)));

  await insertBackgroundApps(db, now);
}

/**
 * Reset between demo runs: clear all applications/responses/signals and restore just the
 * seeded background apps, leaving the jobs + criteria intact. Cheap and repeatable.
 */
export async function resetApplications(db: DB, now = Date.now()) {
  await db.delete(schema.applicationSignals);
  await db.delete(schema.responses);
  await db.delete(schema.applications);
  await insertBackgroundApps(db, now);
}

/** Seed lazily if the world is empty (idempotent startup-style seeding). */
export async function ensureSeeded(db: DB, env: Bindings) {
  const existing = await db.query.jobs.findFirst({ columns: { id: true } });
  if (!existing) await seedWorld(db, env);
}
