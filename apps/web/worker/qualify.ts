import type { ScreeningCriterion } from "@inploi/db/schema";
import type { FitFlag, GapNotes, IntentSignal } from "@inploi/shared";

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
