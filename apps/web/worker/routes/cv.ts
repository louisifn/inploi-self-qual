import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { makeDb, schema } from "../db";
import { cvAnalyseRequestSchema, cvAnalysisSchema } from "@inploi/shared";
import { generateStructured, MODELS } from "../ai/client";
import {
  CV_ANALYSIS_SYSTEM,
  CV_ANALYSIS_VERSION,
  GOLDEN_CV_ANALYSIS,
  buildCvAnalysisPrompt,
} from "../../prompts/cv-analysis";
import type { AppEnv } from "../types";

export const cvRoutes = new Hono<AppEnv>();

/** Act 2b: gentle CV gap analysis. Generates self-report prompts, never a score. */
cvRoutes.post("/analyse", async (c) => {
  const parsed = cvAnalyseRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, 400);
  }

  const db = makeDb(c.env.DB);
  const app = await db.query.applications.findFirst({
    where: eq(schema.applications.id, parsed.data.applicationId),
  });
  if (!app) return c.json({ error: "Application not found" }, 404);

  // No CV → skip the model entirely and reassure.
  if (!app.cvText || !app.cvText.trim()) {
    return c.json({
      analysis: {
        alignments: [],
        gaps: [],
        noCvSignal: true,
        disclaimer: "This doesn't score or rank you. Plenty of great people start with no CV at all.",
      },
      hasCv: false,
      source: "fallback" as const,
    });
  }

  const criteria = await db.query.screeningCriteria.findMany({
    where: eq(schema.screeningCriteria.jobId, app.jobId),
  });
  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, app.jobId) });
  const cvCheck = criteria.find((x) => x.type === "cv_check");
  const focus = cvCheck?.config?.kind === "cv_check" ? cvCheck.config.focus : "relevant, transferable experience";
  const roleRequirements = `${job?.title ?? "the role"}\nThis role values: ${focus}.\nAsks: ${criteria
    .filter((x) => x.isDealbreaker)
    .map((x) => x.prompt)
    .join("; ")}`;

  const result = await generateStructured({
    env: c.env,
    model: MODELS.fast,
    schema: cvAnalysisSchema,
    system: CV_ANALYSIS_SYSTEM,
    prompt: buildCvAnalysisPrompt({ cvText: app.cvText, roleRequirements }),
    fallback: GOLDEN_CV_ANALYSIS,
    promptVersion: CV_ANALYSIS_VERSION,
    timeoutMs: 8_000,
  });

  return c.json({ analysis: result.data, hasCv: true, source: result.source });
});
