import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { PreviewFacts, CriteriaConfig, GapNotes, ScheduleProfile } from "@inploi/shared";

/**
 * Cloudflare D1 / SQLite schema.
 *
 * SQLite has no native boolean, JSON, or timestamp types: they are expressed via
 * Drizzle *modes*: booleans as integer({mode:'boolean'}), JSON as text({mode:'json'})
 * typed from shared Zod schemas, timestamps as integer({mode:'timestamp'}). The
 * boolean mode on is_dealbreaker is load-bearing: the whole Act 3 fork keys off it.
 *
 * D1 does not enforce foreign keys by default. references() give typed joins; the
 * seed/reset scripts maintain referential integrity at the application layer.
 *
 * No scoring/ranking columns exist anywhere by design (the anti-score guarantee is structural).
 */

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(), // raw JD
  employer: text("employer"), // fictional brand for the demo
  location: text("location"),
  shiftPattern: text("shift_pattern"),
  payRange: text("pay_range"),
  startDate: text("start_date"),
  // Canonical human-readable role facts double as the realistic-preview header.
  previewFacts: text("preview_facts", { mode: "json" }).$type<PreviewFacts>(),
  // Canonical routable-axis stance (weekends/early-start/start-timing/transport) for dynamic routing.
  scheduleProfile: text("schedule_profile", { mode: "json" }).$type<ScheduleProfile>(),
  status: text("status", { enum: ["draft", "live"] }).notNull().default("draft"),
  // A redirect-target stub role is not independently applied to in the demo.
  isRoutableTarget: integer("is_routable_target", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

/**
 * Seeded adjacency list of better-fit alternatives for the Act 3 redirect.
 * Static data, NOT a scoring/ranking engine. `requiresDay`/`avoidsDealbreaker` let the
 * fork pick alternatives causally from the candidate's failed routable dealbreakers.
 */
export const jobRoutes = sqliteTable(
  "job_routes",
  {
    id: text("id").primaryKey(),
    fromJobId: text("from_job_id").notNull().references(() => jobs.id),
    toJobId: text("to_job_id").notNull().references(() => jobs.id),
    reason: text("reason"), // e.g. "weekday-only pattern fits"
    // Which dealbreaker type this alternative resolves (e.g. "availability", "logistics").
    resolvesDealbreaker: text("resolves_dealbreaker"),
  },
  (t) => [index("job_routes_from_idx").on(t.fromJobId)],
);

export const screeningCriteria = sqliteTable(
  "screening_criteria",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull().references(() => jobs.id),
    type: text("type", {
      enum: ["availability", "logistics", "role_specific", "cv_check"],
    }).notNull(), // 'situational' deliberately omitted: SJT cut from the built flow
    prompt: text("prompt").notNull(), // candidate-facing question
    helpText: text("help_text"), // optional plain-language context
    isDealbreaker: integer("is_dealbreaker", { mode: "boolean" }).notNull().default(false),
    // Zod discriminated union: how to render + the transparent self-report pass rule + routable|terminal.
    config: text("config", { mode: "json" }).$type<CriteriaConfig>(),
    rationale: text("rationale"), // why this matters for THIS role (recruiter-facing)
    displayOrder: integer("display_order").notNull().default(0), // protects the availability-first sequence
  },
  (t) => [index("screening_criteria_job_idx").on(t.jobId, t.displayOrder)],
);

export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull().references(() => jobs.id),
    candidateName: text("candidate_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    cvText: text("cv_text"), // nullable: CV optional (paste-text)
    status: text("status", {
      enum: ["in_progress", "submitted", "self_withdrew", "redirected"],
    })
      .notNull()
      .default("in_progress"), // 'qualified' dropped: it overlapped 'submitted'
    redirectedToJobId: text("redirected_to_job_id").references(() => jobs.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  // Poll target: filter by job + status, order by recency.
  (t) => [index("applications_poll_idx").on(t.jobId, t.status, t.updatedAt)],
);

export const responses = sqliteTable(
  "responses",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id").notNull().references(() => applications.id),
    criteriaId: text("criteria_id").notNull().references(() => screeningCriteria.id),
    answer: text("answer"), // canonical human-readable answer
    answerJson: text("answer_json", { mode: "json" }).$type<string[]>(), // only for multi-select
    fitFlag: text("fit_flag", { enum: ["pass", "fail", "explain"] }), // null until evaluated
    explanation: text("explanation"), // candidate's own words on a gap
  },
  // Upsert key so answer revisions update rather than duplicate.
  (t) => [uniqueIndex("responses_app_criteria_uq").on(t.applicationId, t.criteriaId)],
);

/**
 * Derived 1:1 per-application summary for the recruiter view (denormalized for cheap polls).
 * All signals are categorical and transparent, deliberately NOT an opaque numeric score.
 */
export const applicationSignals = sqliteTable("application_signals", {
  applicationId: text("application_id")
    .primaryKey()
    .references(() => applications.id),
  availabilityFit: text("availability_fit", { enum: ["pass", "fail"] }),
  intentSignal: text("intent_signal", { enum: ["strong", "some", "unclear"] }), // descriptive, never a sort key
  gapNotes: text("gap_notes", { mode: "json" }).$type<GapNotes>(),
  summary: text("summary"), // one-line AI synthesis, generated on submit
});

// Convenience row types inferred from the schema.
export type Job = typeof jobs.$inferSelect;
export type JobInsert = typeof jobs.$inferInsert;
export type JobRoute = typeof jobRoutes.$inferSelect;
export type ScreeningCriterion = typeof screeningCriteria.$inferSelect;
export type ScreeningCriterionInsert = typeof screeningCriteria.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type ApplicationInsert = typeof applications.$inferInsert;
export type ResponseRow = typeof responses.$inferSelect;
export type ApplicationSignal = typeof applicationSignals.$inferSelect;
