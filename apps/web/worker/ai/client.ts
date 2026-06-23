import { generateObject } from "ai";
import type { z } from "zod";
import { AI_KEY_ENV, MODELS, createModel } from "./config";

/**
 * One generation wrapper for all four AI calls. Provider + models are configured in ./config.ts
 * (the single place to change them). Every call ALWAYS has a golden fallback, so a flaky model
 * on stage never breaks the flow. AI is decision-support only, never an automated gate.
 */

export { MODELS };

export type GenSource = "live" | "fallback";
export type GenResult<T> = { data: T; source: GenSource; error?: string };

// The env values the AI layer reads. AI_KEY_ENV (a literal) indexes the active provider key,
// and Bindings is structurally assignable to this.
type AiEnv = {
  DEMO_SAFE_MODE?: string;
  GEMINI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
};

/** True once the configured provider key is set (used by the health check). */
export function aiKeyConfigured(env: AiEnv): boolean {
  return Boolean(env[AI_KEY_ENV]);
}

/** Demo-safe when explicitly flagged, or when no API key is configured. */
export function isDemoSafe(env: AiEnv): boolean {
  return env.DEMO_SAFE_MODE === "true" || !aiKeyConfigured(env);
}

export async function generateStructured<S extends z.ZodType>(opts: {
  env: AiEnv;
  model: string;
  schema: S;
  system: string;
  prompt: string;
  fallback: z.infer<S>;
  timeoutMs?: number;
  promptVersion?: string;
}): Promise<GenResult<z.infer<S>>> {
  if (isDemoSafe(opts.env)) {
    return { data: opts.fallback, source: "fallback" };
  }

  const model = createModel(opts.env[AI_KEY_ENV]!, opts.model);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 12_000);

  try {
    const { object } = await generateObject({
      model,
      schema: opts.schema,
      system: opts.system,
      prompt: opts.prompt,
      abortSignal: controller.signal,
      // Gemini doesn't enforce array min/max at generation, so give it a second attempt
      // before degrading to the golden fallback (counts are also reinforced in each prompt).
      maxRetries: 2,
    });
    return { data: object as z.infer<S>, source: "live" };
  } catch (err) {
    // Any failure (timeout, model error, schema mismatch) degrades to the golden fallback.
    return { data: opts.fallback, source: "fallback", error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}
