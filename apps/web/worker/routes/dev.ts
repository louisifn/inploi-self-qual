import { Hono } from "hono";
import { generatedScreeningSchema } from "@inploi/shared";
import { POOL_JOBS } from "@inploi/db/seed-jobs";
import { makeDb } from "../db";
import { resetApplications, seedWorld, wipeAll } from "../seed";
import { generateStructured, MODELS } from "../ai/client";
import { GOLDEN_SCREENING, JD_SCREENING_SYSTEM, JD_SCREENING_VERSION, buildJdScreeningPrompt } from "../../prompts/jd-screening";
import type { AppEnv } from "../types";

/** Dev/demo-only data controls. Not mounted in production builds beyond the demo. */
export const devRoutes = new Hono<AppEnv>();

/** One-off: generate every pool prose live and return the screenings (to capture as goldens). */
devRoutes.get("/pool-goldens", async (c) => {
  const jobs = [];
  for (const job of POOL_JOBS) {
    const res = await generateStructured({
      env: c.env,
      model: MODELS.smart,
      schema: generatedScreeningSchema,
      system: JD_SCREENING_SYSTEM,
      prompt: buildJdScreeningPrompt({ jd: job.prose }),
      fallback: GOLDEN_SCREENING,
      promptVersion: JD_SCREENING_VERSION,
      timeoutMs: 25_000,
    });
    jobs.push({ id: job.id, source: res.source, screening: res.data });
  }
  return c.json({ jobs });
});

/** Rebuild the whole demo world from scratch. */
devRoutes.post("/seed", async (c) => {
  await seedWorld(makeDb(c.env.DB), c.env);
  return c.json({ ok: true, action: "seed" });
});

/** Reset between demo runs: clear candidate activity, restore seeded background apps. */
devRoutes.post("/reset", async (c) => {
  await resetApplications(makeDb(c.env.DB));
  return c.json({ ok: true, action: "reset" });
});

/** Empty everything (used by tests / a hard reset). */
devRoutes.post("/wipe", async (c) => {
  await wipeAll(makeDb(c.env.DB));
  return c.json({ ok: true, action: "wipe" });
});
