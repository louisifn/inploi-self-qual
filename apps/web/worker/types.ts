export type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  // The active AI provider key: see worker/ai/config.ts (AI_KEY_ENV). Both kept optional
  // so swapping providers is a one-line config change with no type churn here.
  GEMINI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEMO_SAFE_MODE?: string;
  // When set (a wrangler secret in prod), gates the whole API behind this access code.
  // Unset (local dev) ⇒ gate is open.
  DEMO_PASSWORD?: string;
};

export type AppEnv = { Bindings: Bindings };
