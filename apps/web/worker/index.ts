import { Hono } from "hono";
import { count } from "drizzle-orm";
import { makeDb, schema } from "./db";
import { aiKeyConfigured } from "./ai/client";
import { jobsRoutes } from "./routes/jobs";
import { devRoutes } from "./routes/dev";
import { applicationsRoutes } from "./routes/applications";
import { cvRoutes } from "./routes/cv";
import { answersRoutes } from "./routes/answers";
import { authCookieHeader, demoGate, deriveToken, isAuthed } from "./auth";
import { aiRateLimit, rateLimit } from "./rate-limit";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

// Gate the whole API (and the Gemini key) behind the demo access code when DEMO_PASSWORD is set.
app.use("/api/*", demoGate);

// Throttle login attempts so the access code can't be brute-forced (8 tries per IP per minute).
app.use("/api/auth", rateLimit(8));

// Per-IP backstop on the AI endpoints so the key can't be drained even with the access code.
app.use("/api/jobs/generate", aiRateLimit);
app.use("/api/cv/analyse", aiRateLimit);
app.use("/api/answers/interpret", aiRateLimit);
app.use("/api/applications/:id/qualify", aiRateLimit);
// The seed makes ~10 live model calls per request, so cap it hard (3 per IP per minute).
app.use("/api/dev/seed", rateLimit(3));

/** Whether the gate is on, and whether this request is already through it. */
app.get("/api/auth/status", async (c) =>
  c.json({ enabled: Boolean(c.env.DEMO_PASSWORD), authed: await isAuthed(c.env, c.req.raw) }),
);

/** Exchange the access code for a session cookie. */
app.post("/api/auth", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { password?: string };
  if (c.env.DEMO_PASSWORD && body.password === c.env.DEMO_PASSWORD) {
    c.header("Set-Cookie", authCookieHeader(await deriveToken(c.env.DEMO_PASSWORD)));
    return c.json({ ok: true });
  }
  return c.json({ ok: false }, 401);
});

/**
 * Walking-skeleton health check: proves the full web -> Worker -> Drizzle -> D1 path.
 * Returns a real count from the jobs table plus the D1 server time.
 */
app.get("/api/health", async (c) => {
  const db = makeDb(c.env.DB);
  const [{ n }] = await db.select({ n: count() }).from(schema.jobs);
  const result = await c.env.DB.prepare("select datetime('now') as now").all<{ now: string }>();
  const now = result.results[0]?.now ?? "";

  return c.json({
    ok: true,
    service: "inploi-self-qual",
    store: "d1",
    jobs: n,
    demoSafeMode: c.env.DEMO_SAFE_MODE === "true",
    liveAiConfigured: aiKeyConfigured(c.env),
    serverTime: now,
  });
});

app.route("/api/jobs", jobsRoutes);
app.route("/api/applications", applicationsRoutes);
app.route("/api/cv", cvRoutes);
app.route("/api/answers", answersRoutes);
app.route("/api/dev", devRoutes);

export default app;
