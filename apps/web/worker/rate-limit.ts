import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "./types";

/**
 * Best-effort per-IP limiter. It is per-isolate (an in-memory Map), so a soft cap rather than a
 * hard global one: it is a backstop, never the primary control (the access gate is). Skipped
 * locally (no client IP). Build one limiter per concern so each gets its own independent budget.
 */
export function rateLimit(limit: number, windowMs = 60_000): MiddlewareHandler<AppEnv> {
  const hits = new Map<string, number[]>();
  return async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "";
    if (!ip) return next(); // no client IP (e.g. local dev) -> don't limit
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      return c.json({ error: "You're going a bit fast. Give it a minute." }, 429);
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear(); // crude unbounded-growth guard for a demo
    return next();
  };
}

// 20 calls per IP per minute, shared across the candidate-facing AI endpoints.
export const aiRateLimit = rateLimit(20);
