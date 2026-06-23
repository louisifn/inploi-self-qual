import type { MiddlewareHandler } from "hono";
import type { AppEnv, Bindings } from "./types";

/**
 * Demo access gate. When DEMO_PASSWORD is set (a wrangler secret in prod), the whole API,
 * and therefore every AI endpoint that spends the Gemini key, requires the access code.
 * When it's unset (local dev), the gate is open so dev + the E2E suite are unaffected.
 *
 * Auth is carried by an HttpOnly cookie holding a SHA-256 token of the password (the raw
 * password never sits in the cookie), or an `x-demo-auth` header (= password) for programmatic
 * / test access. The static assets (the SPA shell) load freely (there are no secrets there)
 * but the client immediately shows the access screen until /api/* is unlocked.
 */

export const AUTH_COOKIE = "inploi_demo";
const EXEMPT = new Set(["/api/auth", "/api/auth/status"]);

export async function deriveToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`inploi-demo:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}

export async function isAuthed(env: Bindings, req: Request): Promise<boolean> {
  const pw = env.DEMO_PASSWORD;
  if (!pw) return true; // gate disabled
  const expected = await deriveToken(pw);
  const hdr = req.headers.get("x-demo-auth");
  if (hdr && (hdr === pw || hdr === expected)) return true;
  return readCookie(req, AUTH_COOKIE) === expected;
}

export function authCookieHeader(token: string): string {
  return `${AUTH_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}

/** Gate middleware for /api/*. Exempts the auth endpoints so you can actually log in. */
export const demoGate: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (!c.env.DEMO_PASSWORD) return next();
  if (EXEMPT.has(new URL(c.req.url).pathname)) return next();
  if (await isAuthed(c.env, c.req.raw)) return next();
  return c.json({ error: "Locked. Enter the access code." }, 401);
};
