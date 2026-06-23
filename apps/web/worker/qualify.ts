import type { ScreeningCriterion } from "@inploi/db/schema";
import type { FitFlag, GapNotes, IntentSignal, RoutableDimension, ScheduleProfile } from "@inploi/shared";

/**
 * The honest fork is computed HERE, in code, never by the model. A dealbreaker passes only
 * if the candidate's self-reported answer is in its transparent passValues. This keeps the
 * decision deterministic, auditable, and out of opaque-scoring territory.
 */

export function criterionRoutable(c: ScreeningCriterion): boolean {
  const cfg = c.config;
  if (!cfg) return true;
  if (cfg.kind === "single_select" || cfg.kind === "multi_select" || cfg.kind === "boolean") {
    return cfg.routable ?? true;
  }
  if (cfg.kind === "date") return cfg.routable ?? true;
  return true;
}

export function dealbreakerPasses(c: ScreeningCriterion, answer: string | undefined): boolean {
  if (answer == null) return false;
  const cfg = c.config;
  if (!cfg) return true;
  if (cfg.kind === "single_select" || cfg.kind === "multi_select" || cfg.kind === "boolean") {
    return cfg.passValues.includes(answer);
  }
  return true;
}

export type Evaluated = {
  criterion: ScreeningCriterion;
  answer: string | undefined;
  fitFlag: FitFlag | null;
};

/** Evaluate every answered criterion into a fit flag (dealbreakers gate; questions don't). */
export function evaluate(
  criteria: ScreeningCriterion[],
  answers: Map<string, string>,
): Evaluated[] {
  return criteria.map((criterion) => {
    const answer = answers.get(criterion.id);
    let fitFlag: FitFlag | null = null;
    if (criterion.isDealbreaker) {
      fitFlag = dealbreakerPasses(criterion, answer) ? "pass" : "fail";
    } else if (answer != null && answer.trim()) {
      fitFlag = "pass";
    }
    return { criterion, answer, fitFlag };
  });
}

export type Decision = "strong_fit" | "self_select_out" | "terminal";

export function computeDecision(evaluated: Evaluated[]): {
  decision: Decision;
  failedRoutable: Evaluated[];
  failedTerminal: Evaluated[];
  matchedDealbreakers: string[];
  missedDealbreakers: string[];
} {
  const dealbreakers = evaluated.filter((e) => e.criterion.isDealbreaker);
  const failed = dealbreakers.filter((e) => e.fitFlag === "fail");
  const failedRoutable = failed.filter((e) => criterionRoutable(e.criterion));
  const failedTerminal = failed.filter((e) => !criterionRoutable(e.criterion));

  const decision: Decision =
    failedTerminal.length > 0 ? "terminal" : failedRoutable.length > 0 ? "self_select_out" : "strong_fit";

  return {
    decision,
    failedRoutable,
    failedTerminal,
    matchedDealbreakers: dealbreakers.filter((e) => e.fitFlag === "pass").map((e) => e.criterion.prompt),
    missedDealbreakers: failed.map((e) => e.criterion.prompt),
  };
}

/** Derive the descriptive recruiter signals. Categorical only, never a numeric score. */
export function deriveSignals(
  evaluated: Evaluated[],
  gapExplanations: { requirement: string; text: string }[],
): { availabilityFit: "pass" | "fail"; intentSignal: IntentSignal; gapNotes: GapNotes } {
  const dealbreakers = evaluated.filter((e) => e.criterion.isDealbreaker);
  const availabilityFit = dealbreakers.every((e) => e.fitFlag === "pass") ? "pass" : "fail";

  // Intent from the candidate's own words: role-question answers + gap explanations.
  const freeText = [
    ...evaluated
      .filter((e) => !e.criterion.isDealbreaker && e.criterion.type === "role_specific")
      .map((e) => e.answer ?? ""),
    ...gapExplanations.map((g) => g.text),
  ].filter((t) => t.trim().length > 0);
  const totalChars = freeText.join(" ").trim().length;
  const longest = freeText.reduce((m, t) => Math.max(m, t.trim().length), 0);
  const intentSignal: IntentSignal =
    totalChars > 80 && longest > 30 ? "strong" : totalChars > 0 ? "some" : "unclear";

  const gapNotes: GapNotes = gapExplanations.map((g) => ({
    area: g.requirement,
    status: g.text.trim() ? "explained" : "missing",
    candidateText: g.text.trim() || undefined,
  }));

  return { availabilityFit, intentSignal, gapNotes };
}

/**
 * Dynamic routing helpers. A candidate who fails a routable dealbreaker is matched, in code,
 * against other REAL jobs whose canonical scheduleProfile accommodates that exact axis. The
 * model never selects targets; it only writes copy for the real jobs this code picks.
 */

/** The matchable axes the candidate failed (right_to_work is terminal; 'other' isn't routable). */
export function failedRoutableDimensions(failedRoutable: Evaluated[]): RoutableDimension[] {
  const dims = failedRoutable
    .map((e) => {
      const cfg = e.criterion.config;
      return cfg && "dimension" in cfg ? cfg.dimension : undefined;
    })
    .filter((d): d is RoutableDimension => !!d && d !== "right_to_work" && d !== "other");
  return [...new Set(dims)];
}

/** Does this job's profile genuinely accommodate a candidate who failed the given axis? */
export function dimensionAccommodated(profile: ScheduleProfile, dim: RoutableDimension): boolean {
  switch (dim) {
    case "weekends":
      return profile.weekends === "none" || profile.weekends === "optional";
    case "early_start":
      return profile.earliestStart === "daytime" || profile.earliestStart === "late";
    case "start_timing":
      return profile.startTiming === "flexible";
    case "transport":
      return profile.transport === "accessible";
    default:
      return false; // right_to_work / other: never a routing match
  }
}

/** A job accommodates a candidate only if it clears EVERY axis they failed. */
export function jobAccommodatesAll(profile: ScheduleProfile, dims: RoutableDimension[]): boolean {
  return dims.length > 0 && dims.every((d) => dimensionAccommodated(profile, d));
}

/** A templated, attribute-true "why this fits" line, drawn only from the target's real profile. */
export function whyFromProfile(profile: ScheduleProfile, dims: RoutableDimension[]): string {
  const bits: string[] = [];
  if (dims.includes("weekends") && profile.weekends !== "required") {
    bits.push(profile.weekends === "none" ? "no weekend work" : "optional weekends");
  }
  if (dims.includes("early_start") && profile.earliestStart !== "early") {
    bits.push(profile.earliestStart === "late" ? "a later start" : "a daytime start");
  }
  if (dims.includes("start_timing") && profile.startTiming === "flexible") {
    bits.push("a flexible start date");
  }
  if (dims.includes("transport") && profile.transport === "accessible") {
    bits.push("an easy commute");
  }
  if (!bits.length) return "Fits what you told us.";
  const list = bits.length === 1 ? bits[0] : `${bits.slice(0, -1).join(", ")} and ${bits[bits.length - 1]}`;
  return `Offers ${list}.`;
}

/** A short, neutral, descriptive recruiter line (templated; never a grade). */
export function templatedSummary(
  evaluated: Evaluated[],
  signals: { availabilityFit: "pass" | "fail"; intentSignal: IntentSignal },
): string {
  const availability = signals.availabilityFit === "pass" ? "Clears every shift" : "Misses a shift requirement";
  const explained = evaluated.find(
    (e) => !e.criterion.isDealbreaker && e.criterion.type === "role_specific" && (e.answer ?? "").trim(),
  );
  const intent =
    signals.intentSignal === "strong"
      ? "explained their interest in their own words"
      : signals.intentSignal === "some"
        ? "gave some context"
        : "kept answers brief";
  return `${availability}; ${intent}${explained ? "." : "."}`;
}
