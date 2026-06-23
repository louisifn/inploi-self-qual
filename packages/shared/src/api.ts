import { z } from "zod";
import {
  applicationStatusSchema,
  availabilityFitSchema,
  criteriaConfigSchema,
  criteriaTypeSchema,
  fitFlagSchema,
  gapNotesSchema,
  intentSignalSchema,
  previewFactsSchema,
} from "./types";
import { cvAnalysisSchema, generatedScreeningSchema } from "./ai";

/** Demo access gate status. */
export const authStatusSchema = z.object({
  enabled: z.boolean(), // is the gate switched on (DEMO_PASSWORD set)?
  authed: z.boolean(), // is this session already through it?
});
export type AuthStatus = z.infer<typeof authStatusSchema>;

/** Health check: used by the walking skeleton to prove the web -> Worker -> D1 path. */
export const healthSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  store: z.string(),
  jobs: z.number(),
  demoSafeMode: z.boolean(),
  liveAiConfigured: z.boolean(),
  serverTime: z.string(),
});
export type Health = z.infer<typeof healthSchema>;

// ── Job detail (Act 2 reads this to render the form + self-qualification) ────────────
export const clientCriterionSchema = z.object({
  id: z.string(),
  type: criteriaTypeSchema,
  prompt: z.string(),
  helpText: z.string().nullable(),
  isDealbreaker: z.boolean(),
  config: criteriaConfigSchema.nullable(),
  rationale: z.string().nullable(),
  displayOrder: z.number(),
});
export type ClientCriterion = z.infer<typeof clientCriterionSchema>;

export const clientJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  employer: z.string().nullable(),
  location: z.string().nullable(),
  shiftPattern: z.string().nullable(),
  payRange: z.string().nullable(),
  startDate: z.string().nullable(),
  status: z.enum(["draft", "live"]),
  description: z.string().nullable(),
  previewFacts: previewFactsSchema.nullable(),
});
export type ClientJob = z.infer<typeof clientJobSchema>;

export const jobDetailSchema = z.object({
  job: clientJobSchema,
  criteria: z.array(clientCriterionSchema),
});
export type JobDetail = z.infer<typeof jobDetailSchema>;

/** Summary row for listing live jobs (e.g. the candidate entry / demo launcher). */
export const jobSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  employer: z.string().nullable(),
  location: z.string().nullable(),
  shiftPattern: z.string().nullable(),
  payRange: z.string().nullable(),
});
export type JobSummary = z.infer<typeof jobSummarySchema>;

// ── Act 1: generate screening logic from a JD, then post the (edited) job ─────────────
export const generateJobRequestSchema = z.object({
  jd: z.string().min(20, "Paste a fuller job description (at least a couple of lines)."),
  title: z.string().optional(),
  employer: z.string().optional(),
});
export type GenerateJobRequest = z.infer<typeof generateJobRequestSchema>;

export const generateJobResponseSchema = z.object({
  screening: generatedScreeningSchema,
  source: z.enum(["live", "fallback"]),
});
export type GenerateJobResponse = z.infer<typeof generateJobResponseSchema>;

/** The recruiter posts the (possibly edited) screening. The raw JD is kept for transparency. */
export const postJobRequestSchema = z.object({
  jd: z.string(),
  screening: generatedScreeningSchema,
});
export type PostJobRequest = z.infer<typeof postJobRequestSchema>;

export const postJobResponseSchema = z.object({
  jobId: z.string(),
});
export type PostJobResponse = z.infer<typeof postJobResponseSchema>;

// ── Act 2a: the Greenhouse "before" form creates an in-progress application ────────────
export const createApplicationRequestSchema = z.object({
  jobId: z.string(),
  candidateName: z.string().min(1, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().optional(),
  cvText: z.string().optional(),
});
export type CreateApplicationRequest = z.infer<typeof createApplicationRequestSchema>;

export const createApplicationResponseSchema = z.object({
  applicationId: z.string(),
});
export type CreateApplicationResponse = z.infer<typeof createApplicationResponseSchema>;

export const applicationBasicsSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  candidateName: z.string(),
  status: applicationStatusSchema,
  hasCv: z.boolean(),
});
export type ApplicationBasics = z.infer<typeof applicationBasicsSchema>;

// ── Act 2b: CV gap analysis ───────────────────────────────────────────────────────────
export const cvAnalyseRequestSchema = z.object({ applicationId: z.string() });
export type CvAnalyseRequest = z.infer<typeof cvAnalyseRequestSchema>;

export const cvAnalyseResponseSchema = z.object({
  analysis: cvAnalysisSchema,
  hasCv: z.boolean(),
  source: z.enum(["live", "fallback"]),
});
export type CvAnalyseResponse = z.infer<typeof cvAnalyseResponseSchema>;

// ── Act 2b/3: qualify: persist answers, derive signals, compute the honest fork ───────
export const qualifyRequestSchema = z.object({
  answers: z.array(
    z.object({
      criteriaId: z.string(),
      answer: z.string(),
      // Verbatim free text when the answer came via the "none of these fit" escape hatch.
      explanation: z.string().optional(),
    }),
  ),
  gapExplanations: z
    .array(z.object({ requirement: z.string(), text: z.string() }))
    .optional(),
});
export type QualifyRequest = z.infer<typeof qualifyRequestSchema>;

// ── Act 2b: free-text escape hatch: interpret-and-confirm (the model maps, code decides) ──
export const interpretAnswerRequestSchema = z.object({
  applicationId: z.string(),
  criteriaId: z.string(),
  text: z.string().min(1),
});
export type InterpretAnswerRequest = z.infer<typeof interpretAnswerRequestSchema>;

export const interpretAnswerResponseSchema = z.object({
  // The existing option this maps to, or null when unclear (never a verdict/score).
  mappedValue: z.string().nullable(),
  restatement: z.string(),
  source: z.enum(["live", "fallback"]),
});
export type InterpretAnswerResponse = z.infer<typeof interpretAnswerResponseSchema>;

export const suggestedRoleSchema = z.object({
  jobId: z.string(),
  title: z.string(),
  location: z.string().nullable(),
  shiftPattern: z.string().nullable(),
  payRange: z.string().nullable(),
  whyItFits: z.string(),
});
export type SuggestedRole = z.infer<typeof suggestedRoleSchema>;

export const forkOutcomeSchema = z.object({
  decision: z.enum(["strong_fit", "self_select_out", "terminal"]),
  matchedDealbreakers: z.array(z.string()),
  missedDealbreakers: z.array(z.string()),
  message: z.object({ headline: z.string(), body: z.string() }),
  suggestedRoles: z.array(suggestedRoleSchema),
  source: z.enum(["live", "fallback"]),
});
export type ForkOutcome = z.infer<typeof forkOutcomeSchema>;

// ── Recruiter board: descriptive signal only, ordered by arrival, never ranked ────────
export const boardResponseSchema = z.object({
  prompt: z.string(),
  type: criteriaTypeSchema,
  isDealbreaker: z.boolean(),
  answer: z.string().nullable(),
  fitFlag: fitFlagSchema.nullable(),
  explanation: z.string().nullable(),
});
export type BoardResponse = z.infer<typeof boardResponseSchema>;

export const boardApplicationSchema = z.object({
  id: z.string(),
  candidateName: z.string(),
  status: applicationStatusSchema,
  availabilityFit: availabilityFitSchema.nullable(),
  intentSignal: intentSignalSchema.nullable(),
  summary: z.string().nullable(),
  gapNotes: gapNotesSchema,
  responses: z.array(boardResponseSchema),
  submittedAt: z.number(), // epoch ms, for ordering by arrival
});
export type BoardApplication = z.infer<typeof boardApplicationSchema>;

export const submitResponseSchema = z.object({
  ok: z.boolean(),
  status: z.string(),
  application: boardApplicationSchema,
});
export type SubmitResponse = z.infer<typeof submitResponseSchema>;
