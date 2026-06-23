import type { JobInsert, ScreeningCriterionInsert } from "@inploi/db/schema";
import type { GeneratedScreening, PreviewFacts, CriteriaConfig } from "@inploi/shared";

/** Map a generated dealbreaker type onto the coarser DB type + an availability-first priority. */
const DEALBREAKER_PRIORITY: Record<
  GeneratedScreening["dealbreakers"][number]["type"],
  { dbType: "availability" | "logistics"; priority: number }
> = {
  availability: { dbType: "availability", priority: 0 },
  start_date: { dbType: "availability", priority: 1 },
  logistics: { dbType: "logistics", priority: 2 },
  right_to_work: { dbType: "logistics", priority: 3 },
};

function previewFactsFrom(screening: GeneratedScreening): PreviewFacts {
  return screening.previewFacts.map((f) => ({
    label: f.label,
    value: f.value,
    category: f.category,
    emphasis: f.category === "pay" || f.category === "location",
  }));
}

/**
 * Turn the (recruiter-edited) generated screening into the rows we persist.
 * Ordering is enforced here: availability/schedule first, right-to-work last among
 * dealbreakers, then role questions, then the cv_check, so the candidate sequence is
 * correct regardless of how the model ordered its output.
 */
export function mapScreeningToInserts(
  screening: GeneratedScreening,
  opts: { jobId: string; rawJd: string; now: number; newId: () => string },
): { job: JobInsert; criteria: ScreeningCriterionInsert[] } {
  const { jobId, rawJd, now, newId } = opts;

  const job: JobInsert = {
    id: jobId,
    title: screening.jobSummary.title,
    employer: screening.jobSummary.employer ?? null,
    location: screening.jobSummary.location,
    shiftPattern: screening.jobSummary.shiftPattern,
    payRange: screening.jobSummary.payRange,
    startDate: screening.jobSummary.startDate ?? null,
    description: rawJd,
    previewFacts: previewFactsFrom(screening),
    status: "live",
    isRoutableTarget: false,
    createdAt: new Date(now),
  };

  const criteria: ScreeningCriterionInsert[] = [];

  // Dealbreakers, sorted availability-first.
  const sortedDealbreakers = screening.dealbreakers
    .map((d, i) => ({ d, i, ...DEALBREAKER_PRIORITY[d.type] }))
    .sort((a, b) => a.priority - b.priority || a.i - b.i);

  let order = 0;
  for (const { d, dbType } of sortedDealbreakers) {
    const config: CriteriaConfig = {
      kind: "single_select",
      options: d.options,
      passValues: d.passValues,
      routable: d.routable,
    };
    criteria.push({
      id: newId(),
      jobId,
      type: dbType,
      prompt: d.prompt,
      helpText: d.helpText ?? null,
      isDealbreaker: true,
      config,
      rationale: d.rationale,
      displayOrder: order++,
    });
  }

  // Role questions (never dealbreakers).
  for (const q of screening.roleQuestions) {
    const config: CriteriaConfig =
      q.inputKind === "single_select"
        ? { kind: "single_select", options: q.options ?? [], passValues: [], routable: true }
        : { kind: "short_text" };
    criteria.push({
      id: newId(),
      jobId,
      type: "role_specific",
      prompt: q.prompt,
      helpText: q.helpText ?? null,
      isDealbreaker: false,
      config,
      rationale: q.rationale,
      displayOrder: order++,
    });
  }

  // CV gap-check, always last and optional.
  criteria.push({
    id: newId(),
    jobId,
    type: "cv_check",
    prompt: "We'll take a quick, gentle look at your experience, only if you shared any.",
    helpText: null,
    isDealbreaker: false,
    config: { kind: "cv_check", focus: screening.cvFocus },
    rationale: "Humane gap-explanation, never a score. Skipped entirely if no CV was shared.",
    displayOrder: order++,
  });

  return { job, criteria };
}
