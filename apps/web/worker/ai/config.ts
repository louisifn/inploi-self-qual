import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
// To switch back to Anthropic, uncomment the next line and the createModel body below.
// import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * ───────────────────────────────────────────────────────────────────────────────────
 *  THE single place to change the AI provider + every model.
 *  - To change a model everywhere: edit MODELS below.
 *  - To switch provider: change createModel() + AI_KEY_ENV (one function, one constant).
 * ───────────────────────────────────────────────────────────────────────────────────
 */

/**
 * Model tiers used across all four AI calls.
 *   smart → JD → screening logic, and the Act 3 fit/routing copy
 *   fast  → CV gap analysis, and free-text answer interpretation
 * Starting on Gemini 3.5 Flash for both. To upgrade the smart tier to Pro, change one line, e.g.
 *   smart: "gemini-3.1-pro-preview"   // or "gemini-2.5-pro" for a guaranteed-stable Pro
 */
export const MODELS = {
  smart: "gemini-3.5-flash",
  fast: "gemini-3.5-flash",
} as const;

/**
 * The env binding (in apps/web/.dev.vars locally; a `wrangler secret` in production) that
 * holds the provider's API key. We pass it explicitly to the provider (Workers has no
 * process.env), so this name is ours to choose. Anthropic would be "ANTHROPIC_API_KEY".
 */
export const AI_KEY_ENV = "GEMINI_API_KEY" as const;

/** Build a LanguageModel for the given id from the configured provider + explicit key. */
export function createModel(apiKey: string, modelId: string): LanguageModel {
  return createGoogleGenerativeAI({ apiKey })(modelId);
  // Anthropic equivalent:
  // return createAnthropic({ apiKey })(modelId);
}
