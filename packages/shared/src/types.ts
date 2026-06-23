import { z } from "zod";

/**
 * Shared domain types: the single source of truth for the JSON columns in D1 and
 * for the client. SQLite stores these as TEXT; Drizzle (de)serializes them and we
 * validate with Zod at the Worker write boundary so a blob is never untyped.
 */

// ── Enums (mirror the Drizzle text-enum columns) ────────────────────────────────
export const criteriaTypeSchema = z.enum([
  "availability",
  "logistics",
  "role_specific",
  "cv_check",
]);
export type CriteriaType = z.infer<typeof criteriaTypeSchema>;

export const applicationStatusSchema = z.enum([
  "in_progress",
  "submitted",
  "self_withdrew",
  "redirected",
]);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const fitFlagSchema = z.enum(["pass", "fail", "explain"]);
export type FitFlag = z.infer<typeof fitFlagSchema>;

export const availabilityFitSchema = z.enum(["pass", "fail"]);
export type AvailabilityFit = z.infer<typeof availabilityFitSchema>;

// Descriptive only. NEVER a numeric grade or a sort key. (Anti-score guardrail.)
export const intentSignalSchema = z.enum(["strong", "some", "unclear"]);
export type IntentSignal = z.infer<typeof intentSignalSchema>;

// ── jobs.preview_facts ──────────────────────────────────────────────────────────
export const previewFactSchema = z.object({
  label: z.string(), // e.g. "Shift start"
  value: z.string(), // e.g. "6:00am, weekends required"
  category: z.enum(["hours", "pace", "physical", "pay", "location", "environment"]),
  emphasis: z.boolean().optional(), // pay/location get visual weight
});
export type PreviewFact = z.infer<typeof previewFactSchema>;

export const previewFactsSchema = z.array(previewFactSchema);
export type PreviewFacts = z.infer<typeof previewFactsSchema>;

// ── screening_criteria.config (discriminated union keyed on `kind`) ───────────────
// Carries both how the candidate UI renders the control AND the transparent,
// candidate-visible self-report pass rule. `routable` distinguishes schedule/location
// dealbreakers (offer better-fit roles) from terminal ones like right-to-work.
export const criteriaConfigSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("single_select"),
    options: z.array(z.string()),
    passValues: z.array(z.string()), // answers that clear the dealbreaker
    routable: z.boolean().default(true),
  }),
  z.object({
    kind: z.literal("multi_select"),
    options: z.array(z.string()),
    passValues: z.array(z.string()),
    routable: z.boolean().default(true),
  }),
  z.object({
    kind: z.literal("boolean"),
    passValues: z.array(z.string()), // typically ["yes"]
    routable: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal("date"),
    passBeforeIso: z.string().optional(), // e.g. must be able to start before this date
    routable: z.boolean().default(true),
  }),
  z.object({
    kind: z.literal("short_text"),
  }),
  z.object({
    kind: z.literal("cv_check"),
    focus: z.string(), // what the CV step looks for
  }),
]);
export type CriteriaConfig = z.infer<typeof criteriaConfigSchema>;

// ── application_signals.gap_notes ─────────────────────────────────────────────────
export const gapNoteSchema = z.object({
  area: z.string(),
  status: z.enum(["confirmed", "explained", "missing"]),
  candidateText: z.string().optional(), // the candidate's own words, shown verbatim
});
export type GapNote = z.infer<typeof gapNoteSchema>;

export const gapNotesSchema = z.array(gapNoteSchema);
export type GapNotes = z.infer<typeof gapNotesSchema>;
