import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "./types";

/**
 * Best-effort per-IP limiter for the AI endpoints. A backstop so a single client can't drain
 * the Gemini key even with the access code. It's per-isolate (not globally exact); the access
 * gate is the primary control. Skipped locally (no client IP). Fails open on any oddity.
 */
const WINDOW_MS = 60_000;
const LIMIT = 20; // AI calls per IP per minute
const hits = new Map<string, number[]>();

export const aiRateLimit: MiddlewareHandler<AppEnv> = async (c, next) => {
  const ip = c.req.header("cf-connecting-ip") ?? "";
  if (!ip) return next(); // no client IP (e.g. local dev) → don't limit
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    return c.json({ error: "You're going a bit fast. Give it a minute." }, 429);
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude unbounded-growth guard for a demo
  return next();
};
