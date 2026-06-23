import type { GeneratedScreening } from "@inploi/shared";

/**
 * A flat, reorderable editing model for Act 1. Dealbreakers and role questions live in
 * separate arrays in the generated shape; flattening them into one ordered list lets the
 * recruiter reorder freely and toggle "dealbreaker" on any item, which is the human-oversight
 * mechanism: a real edit, re-validated on save, not a read-only preview.
 */
export type GenDealbreakerType = "availability" | "logistics" | "right_to_work" | "start_date";

export type EditCriterion = {
  key: string;
  isDealbreaker: boolean;
  genType: GenDealbreakerType;
  prompt: string;
  helpText: string;
  inputKind: "single_select" | "short_text";
  options: string[];
  passValues: string[];
  routable: boolean;
  // Canonical routing axis, carried through edits (not exposed in the edit UI).
  dimension: GeneratedScreening["dealbreakers"][number]["dimension"];
  rationale: string;
};

export type EditModel = {
  jobSummary: GeneratedScreening["jobSummary"];
  previewFacts: GeneratedScreening["previewFacts"];
  criteria: EditCriterion[];
  // Carried through edits so dynamic routing still works on a recruiter-posted job.
  scheduleProfile: GeneratedScreening["scheduleProfile"];
  cvFocus: string;
  exclusions: string[];
};

let keySeq = 0;
const nextKey = () => `ec_${keySeq++}`;

export function toEditModel(s: GeneratedScreening): EditModel {
  const dealbreakers: EditCriterion[] = s.dealbreakers.map((d) => ({
    key: nextKey(),
    isDealbreaker: true,
    genType: d.type,
    prompt: d.prompt,
    helpText: d.helpText ?? "",
    inputKind: "single_select",
    options: [...d.options],
    passValues: [...d.passValues],
    routable: d.routable,
    dimension: d.dimension,
    rationale: d.rationale,
  }));
  const questions: EditCriterion[] = s.roleQuestions.map((q) => ({
    key: nextKey(),
    isDealbreaker: false,
    genType: "availability",
    prompt: q.prompt,
    helpText: q.helpText ?? "",
    inputKind: q.inputKind,
    options: q.options ? [...q.options] : [],
    passValues: [],
    routable: true,
    dimension: "other",
    rationale: q.rationale,
  }));
  return {
    jobSummary: s.jobSummary,
    previewFacts: s.previewFacts,
    criteria: [...dealbreakers, ...questions],
    scheduleProfile: s.scheduleProfile,
    cvFocus: s.cvFocus,
    exclusions: s.exclusions,
  };
}

export function fromEditModel(m: EditModel): GeneratedScreening {
  const dealbreakers = m.criteria
    .filter((c) => c.isDealbreaker)
    .map((c) => {
      const options = c.options.length ? c.options : ["Yes", "No"];
      const passValues = c.passValues.filter((v) => options.includes(v));
      return {
        type: c.genType,
        prompt: c.prompt,
        helpText: c.helpText.trim() ? c.helpText : null,
        options,
        passValues: passValues.length ? passValues : [options[0]],
        routable: c.routable,
        dimension: c.dimension,
        rationale: c.rationale,
      };
    });
  const roleQuestions = m.criteria
    .filter((c) => !c.isDealbreaker)
    .map((c) => ({
      prompt: c.prompt,
      helpText: c.helpText.trim() ? c.helpText : null,
      inputKind: c.inputKind,
      options: c.inputKind === "single_select" ? (c.options.length ? c.options : null) : null,
      rationale: c.rationale,
    }));
  return {
    jobSummary: m.jobSummary,
    previewFacts: m.previewFacts,
    dealbreakers,
    roleQuestions,
    scheduleProfile: m.scheduleProfile,
    cvFocus: m.cvFocus,
    exclusions: m.exclusions,
  };
}

export function blankCriterion(isDealbreaker: boolean): EditCriterion {
  return {
    key: nextKey(),
    isDealbreaker,
    genType: "availability",
    dimension: "other",
    prompt: "",
    helpText: "",
    inputKind: isDealbreaker ? "single_select" : "short_text",
    options: isDealbreaker ? ["Yes", "No"] : [],
    passValues: isDealbreaker ? ["Yes"] : [],
    routable: true,
    rationale: "Added by the recruiter.",
  };
}
