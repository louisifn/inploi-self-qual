import { asc, eq } from "drizzle-orm";
import type { DB } from "./db";
import { schema } from "./db";
import type { BoardApplication } from "@inploi/shared";

/**
 * Build the recruiter-facing board row for one application: the descriptive, self-reported
 * signal plus the candidate's own answers and gap explanations. No score, no rank, by design.
 */
export async function buildBoardApplication(
  db: DB,
  appId: string,
): Promise<BoardApplication | null> {
  const app = await db.query.applications.findFirst({
    where: eq(schema.applications.id, appId),
  });
  if (!app) return null;

  const signal = await db.query.applicationSignals.findFirst({
    where: eq(schema.applicationSignals.applicationId, appId),
  });

  const responseRows = await db
    .select({
      prompt: schema.screeningCriteria.prompt,
      type: schema.screeningCriteria.type,
      isDealbreaker: schema.screeningCriteria.isDealbreaker,
      answer: schema.responses.answer,
      fitFlag: schema.responses.fitFlag,
      explanation: schema.responses.explanation,
      displayOrder: schema.screeningCriteria.displayOrder,
    })
    .from(schema.responses)
    .innerJoin(schema.screeningCriteria, eq(schema.responses.criteriaId, schema.screeningCriteria.id))
    .where(eq(schema.responses.applicationId, appId))
    .orderBy(asc(schema.screeningCriteria.displayOrder));

  return {
    id: app.id,
    candidateName: app.candidateName,
    status: app.status,
    availabilityFit: signal?.availabilityFit ?? null,
    intentSignal: signal?.intentSignal ?? null,
    summary: signal?.summary ?? null,
    gapNotes: signal?.gapNotes ?? [],
    responses: responseRows.map((r) => ({
      prompt: r.prompt,
      type: r.type,
      isDealbreaker: r.isDealbreaker,
      answer: r.answer,
      fitFlag: r.fitFlag,
      explanation: r.explanation,
    })),
    submittedAt: (app.updatedAt ?? app.createdAt ?? new Date()).getTime(),
  };
}
