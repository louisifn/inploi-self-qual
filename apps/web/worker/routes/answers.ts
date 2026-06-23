import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { makeDb, schema } from "../db";
import { answerInterpretSchema, interpretAnswerRequestSchema } from "@inploi/shared";
import { generateStructured, MODELS } from "../ai/client";
import {
  ANSWER_INTERPRET_SYSTEM,
  ANSWER_INTERPRET_VERSION,
  buildAnswerInterpretPrompt,
  heuristicInterpret,
} from "../../prompts/answer-interpret";
import type { AppEnv } from "../types";

export const answersRoutes = new Hono<AppEnv>();

/**
 * Free-text escape hatch. The model MAPS the candidate's words to one of the criterion's
 * existing options (or "unclear"); it never decides fit. The candidate confirms the mapping
 * on the client, then the existing deterministic fork in qualify.ts evaluates it unchanged.
 */
answersRoutes.post("/interpret", async (c) => {
  const parsed = interpretAnswerRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, 400);
  }

  const db = makeDb(c.env.DB);
  const app = await db.query.applications.findFirst({
    where: eq(schema.applications.id, parsed.data.applicationId),
  });
  if (!app) return c.json({ error: "Application not found" }, 404);

  const criterion = await db.query.screeningCriteria.findFirst({
    where: eq(schema.screeningCriteria.id, parsed.data.criteriaId),
  });
  if (!criterion || criterion.jobId !== app.jobId) {
    return c.json({ error: "Criterion not found" }, 404);
  }

  // Eligibility: only routable single-select dealbreakers (availability/logistics).
  // Excludes the terminal right-to-work (boolean, routable:false) and non-dealbreaker questions.
  const cfg = criterion.config;
  if (!criterion.isDealbreaker || cfg?.kind !== "single_select" || cfg.routable !== true) {
    return c.json({ error: "This question can't be answered in free text" }, 400);
  }
  const options = cfg.options;

  // Deterministic fallback (demo-safe / on error), never fabricates a pass.
  const fallback = heuristicInterpret(parsed.data.text, options);

  const result = await generateStructured({
    env: c.env,
    model: MODELS.fast,
    schema: answerInterpretSchema,
    system: ANSWER_INTERPRET_SYSTEM,
    prompt: buildAnswerInterpretPrompt({
      question: criterion.prompt,
      options,
      text: parsed.data.text,
    }),
    fallback,
    promptVersion: ANSWER_INTERPRET_VERSION,
    timeoutMs: 8_000,
  });

  // Post-validate: only an EXACT existing option counts; anything else is "unclear".
  // This is the structural guard. The model can never introduce a value the code didn't offer.
  const raw = result.data.mappedValue;
  const mappedValue = options.includes(raw) ? raw : null;

  return c.json({ mappedValue, restatement: result.data.restatement, source: result.source });
});
