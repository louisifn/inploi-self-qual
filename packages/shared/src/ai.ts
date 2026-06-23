import { z } from "zod";

/**
 * Shared Vercel AI SDK I/O schemas. The Worker passes these straight into generateObject
 * so the persisted shape always matches the validated shape. Generation schemas are
 * generation-shaped (what the model emits); the Worker maps them onto the D1 tables.
 *
 * No schema here contains a field that constitutes a CV score or candidate rank. The
 * anti-score guarantee is enforced at the type level.
 */

// ── 1. JD → screening logic (POST /api/jobs/generate) ───────────────────────────────
export const genPreviewFactSchema = z.object({
  label: z.string().describe("a short, plain label, e.g. 'Shifts start early'"),
  value: z.string().describe("the honest, specific fact in plain language"),
  category: z.enum(["hours", "pace", "physical", "pay", "location", "environment"]),
  sourceQuote: z
    .string()
    .describe("a short verbatim span from the JD this fact is drawn from (traceability; no inference)"),
});

export const genDealbreakerSchema = z.object({
  type: z.enum(["availability", "logistics", "right_to_work", "start_date"]),
  prompt: z.string().describe("the candidate-facing question, plain and direct"),
  helpText: z.string().nullable().describe("one line of honest context, or null"),
  options: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe("answer options the candidate picks from"),
  passValues: z
    .array(z.string())
    .min(1)
    .describe("which option(s) clear this dealbreaker (must be a subset of options)"),
  routable: z
    .boolean()
    .describe("true for schedule/location (offer a better-fit role on fail); false for terminal like right-to-work"),
  dimension: z
    .enum(["weekends", "early_start", "start_timing", "transport", "right_to_work", "other"])
    .describe("the canonical schedule axis this dealbreaker is about. Used in code to route a failing candidate to other real jobs that accommodate this exact axis. Use 'right_to_work' for right-to-work (terminal), 'other' only if none fit"),
  rationale: z.string().describe("why this matters for THIS role (recruiter-facing)"),
});

export const genRoleQuestionSchema = z.object({
  prompt: z.string(),
  helpText: z.string().nullable(),
  inputKind: z.enum(["short_text", "single_select"]),
  options: z.array(z.string()).nullable().describe("options when inputKind is single_select, else null"),
  rationale: z.string(),
});

export const generatedScreeningSchema = z.object({
  jobSummary: z.object({
    title: z.string(),
    employer: z.string().nullable(),
    location: z.string(),
    shiftPattern: z.string(),
    payRange: z.string().describe("the pay range, or 'Not stated' if the JD omits it. Never invent"),
    startDate: z.string().nullable(),
  }),
  // Minimums are floors that survive recruiter edits; the prompt asks for richer output.
  previewFacts: z.array(genPreviewFactSchema).min(2).max(8),
  dealbreakers: z.array(genDealbreakerSchema).min(1).max(6),
  roleQuestions: z.array(genRoleQuestionSchema).min(0).max(4),
  scheduleProfile: z
    .object({
      weekends: z.enum(["required", "optional", "none"]).describe("does the role need weekend work? 'none' = weekday-only; 'optional' = weekends shared/opt-in; 'required' = must do weekends"),
      earliestStart: z.enum(["early", "daytime", "late"]).describe("'early' = shifts start before ~7am; 'daytime' = ~8 to 10am; 'late' = afternoon/evening start"),
      startTiming: z.enum(["immediate", "flexible"]).describe("'immediate' = must start within ~a week; 'flexible' = can start later/whenever"),
      transport: z.enum(["car_or_self", "accessible"]).describe("'car_or_self' = needs own transport or is awkward to reach early; 'accessible' = easy by public transport or walkable"),
    })
    .describe("the role's canonical stance on each routable axis, derived from the JD. Used in code to match a candidate who fails one role against other real jobs that accommodate that axis. Be honest and literal to the JD"),
  cvFocus: z
    .string()
    .describe("what a gentle CV gap-check should look for, e.g. 'fast-paced, customer-facing or early-start work'"),
  exclusions: z
    .array(z.string())
    .describe("criteria you deliberately did NOT generate because they'd screen on (or proxy for) a protected characteristic or formal experience: named for transparency"),
});
export type GeneratedScreening = z.infer<typeof generatedScreeningSchema>;

// ── 2. CV gap analysis (POST /api/cv/analyse) ───────────────────────────────────────
// Generates self-report PROMPTS, never a score. Output is invitations to confirm/explain.
export const cvAlignmentSchema = z.object({
  requirement: z.string().describe("what the role values, in plain language"),
  evidenceQuote: z.string().describe("a short verbatim span from the CV (traceable; no inference)"),
  confirmPrompt: z.string().describe("'We saw X. Is that the kind of thing this role needs?'"),
});

export const cvGapSchema = z.object({
  requirement: z.string().describe("something the role values that we did NOT find clear evidence of"),
  explainPrompt: z.string().describe("a warm invitation: 'We didn't see Y. Want to add anything?' (never a rejection)"),
  transferableHint: z.string().nullable().describe("a gentle nudge toward adjacent/transferable experience, or null"),
});

export const cvAnalysisSchema = z.object({
  alignments: z.array(cvAlignmentSchema).max(4),
  gaps: z.array(cvGapSchema).max(3),
  noCvSignal: z.boolean().describe("true when the CV is thin/empty. Render reassurance, not gaps"),
  disclaimer: z.string().describe("candidate-facing: this does not score you; it just lets you add context"),
});
export type CvAnalysis = z.infer<typeof cvAnalysisSchema>;

// ── 4. Free-text answer interpretation (maps to an existing option; NEVER decides fit) ──
// The model translates a candidate's free text into ONE of the criterion's existing options
// (or "unclear"). It does NOT judge pass/fail. The fork stays deterministic in qualify.ts,
// and the candidate must confirm the mapping before it counts. No score/verdict field exists here.
export const answerInterpretSchema = z.object({
  mappedValue: z
    .string()
    .describe("EXACTLY one of the provided options, copied verbatim, or the literal string 'unclear' if you genuinely cannot tell. Never invent an option, never guess."),
  restatement: z
    .string()
    .describe("one short, friendly line restating what you understood, for the candidate to confirm (e.g. 'Sounds like you can do one weekend day, Saturdays. Is that right?')"),
});
export type AnswerInterpretation = z.infer<typeof answerInterpretSchema>;

// ── 3. Fit + routing copy (the AI only writes the words; the fork is computed in code) ──
export const fitRoutingSchema = z.object({
  headline: z.string().describe("honest, kind, specific: names the actual dealbreaker, never says 'rejected'"),
  body: z.string().describe("a short, warm paragraph framed as help, in the candidate's own terms"),
  suggestedRoles: z
    .array(
      z.object({
        roleId: z.string().describe("MUST match an id from the supplied alternative roles, never invent"),
        whyItFits: z.string().describe("ties to what the candidate told us, e.g. 'matches your weekday availability'"),
      }),
    )
    .max(3),
});
export type FitRouting = z.infer<typeof fitRoutingSchema>;
