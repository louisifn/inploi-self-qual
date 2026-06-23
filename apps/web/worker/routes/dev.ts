import { Hono } from "hono";
import { makeDb } from "../db";
import { resetApplications, seedWorld, wipeAll } from "../seed";
import type { AppEnv } from "../types";

/**
 * Dev/demo data controls. Gated behind the access code (the whole /api/* surface is), and the
 * seed (which makes ~10 live model calls) is additionally rate-limited in index.ts.
 */
export const devRoutes = new Hono<AppEnv>();

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
