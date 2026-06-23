import type { DB } from "./db";
import { schema } from "./db";
import * as seed from "@inploi/db/seed-data";

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

/** Build the whole demo world from scratch. Idempotent (wipes first). */
export async function seedWorld(db: DB, now = Date.now()) {
  await wipeAll(db);

  // The live primary job.
  await db.insert(schema.jobs).values({
    ...seed.PRIMARY_JOB,
    previewFacts: seed.PRIMARY_PREVIEW_FACTS,
    createdAt: new Date(now),
  });

  // Stub redirect-target roles (display-only catalogue for Act 3).
  await db.insert(schema.jobs).values(
    seed.STUB_ROLES.map((r) => ({
      id: r.id,
      title: r.title,
      employer: seed.EMPLOYER,
      location: r.location,
      shiftPattern: r.shiftPattern,
      payRange: r.payRange,
      description: `${r.title} at ${seed.EMPLOYER}, ${r.location}. ${r.shiftPattern}.`,
      status: "live" as const,
      isRoutableTarget: true,
      createdAt: new Date(now),
    })),
  );

  // Screening criteria (the generated-then-edited logic).
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

  // Routing adjacency list.
  await db.insert(schema.jobRoutes).values(
    seed.JOB_ROUTES.map((r) => ({
      id: r.id,
      fromJobId: seed.PRIMARY_JOB_ID,
      toJobId: r.toJobId,
      reason: r.reason,
      resolvesDealbreaker: r.resolvesDealbreaker,
    })),
  );

  await insertBackgroundApps(db, now);
}

/**
 * Reset between demo runs: clear all applications/responses/signals and restore just the
 * seeded background apps, leaving the job + criteria + routes intact. Cheap and repeatable.
 */
export async function resetApplications(db: DB, now = Date.now()) {
  await db.delete(schema.applicationSignals);
  await db.delete(schema.responses);
  await db.delete(schema.applications);
  await insertBackgroundApps(db, now);
}

/** Seed lazily if the world is empty (idempotent startup-style seeding). */
export async function ensureSeeded(db: DB) {
  const existing = await db.query.jobs.findFirst({ columns: { id: true } });
  if (!existing) await seedWorld(db);
}
