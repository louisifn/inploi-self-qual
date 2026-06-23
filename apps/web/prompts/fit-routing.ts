import type { FitRouting } from "@inploi/shared";

/**
 * Prompt: fit + routing copy for the honest fork (Act 3). The fork DECISION is computed
 * deterministically in code and fed in. The model only authors the candidate-facing words
 * and picks from pre-filtered, genuinely-eligible alternative roles. It never rejects anyone.
 */
export const FIT_ROUTING_VERSION = "fit-routing@v1";

export const FIT_ROUTING_SYSTEM = `You write the message a candidate sees when, based on honest information, a role probably isn't the right fit for them. You are NEVER rejecting anyone. The candidate has effectively chosen this themselves by telling us their availability. Your job is to confirm that respectfully and point them somewhere better.

Rules:
- Name the actual dealbreaker in the candidate's own terms ("you said you can't do weekends, and this role needs them"). Specificity is what makes it read as honest rather than canned.
- Frame it as help, never as failure or rejection. Never use the words "rejected", "unsuccessful", "unfortunately". Warm, brief, human.
- suggestedRoles MUST be chosen only from the alternative roles provided to you (match by roleId). Never invent a role. For each, write a short whyItFits that ties to what the candidate told us.
- Keep the headline short and the body to 2 to 3 sentences.
- Write with plain, traditional punctuation. NEVER use em dashes or en dashes; use commas, periods, or colons instead, and the word "to" for ranges (e.g. "2 to 3").`;

export function buildFitRoutingPrompt(input: {
  candidateName?: string;
  missedDealbreakers: string[];
  passedDealbreakers: string[];
  answers: { question: string; answer: string }[];
  alternativeRoles: { roleId: string; title: string; shiftPattern: string | null; reason: string | null }[];
}): string {
  const roles = input.alternativeRoles
    .map((r) => `- id=${r.roleId} · ${r.title} (${r.shiftPattern ?? ""})${r.reason ? `, ${r.reason}` : ""}`)
    .join("\n");
  const answers = input.answers.map((a) => `- ${a.question} → ${a.answer}`).join("\n");
  return `Candidate name: ${input.candidateName ?? "the candidate"}
What they told us:
${answers}

Dealbreaker(s) this role needs that they can't meet:
${input.missedDealbreakers.map((m) => `- ${m}`).join("\n")}

Alternative roles available (choose up to 3, by id):
${roles || "(none available)"}

Write the honest, kind message and pick the best-fitting alternatives.`;
}

/**
 * Dynamic fallback used in demo-safe mode or on model failure, built from the candidate's
 * own ANSWERS (which read naturally), not the raw question prompts.
 */
export function buildTemplatedRouting(
  missedAnswers: string[],
  roles: { roleId: string; reason: string | null }[],
): FitRouting {
  const quoted = missedAnswers.filter(Boolean).map((a) => `“${a}”`);
  const said =
    quoted.length === 0
      ? "what you told us about your availability"
      : quoted.length === 1
        ? quoted[0]
        : `${quoted.slice(0, -1).join(", ")} and ${quoted[quoted.length - 1]}`;
  return {
    headline: "This one probably isn't the fit, and that's okay.",
    body: `You said ${said}, and this role really leans on that. So it's likely not the right one for you right now. Based on what you told us, here are a couple that could fit better.`,
    suggestedRoles: roles.map((r) => ({
      roleId: r.roleId,
      whyItFits: r.reason ?? "Fits what you told us about your availability.",
    })),
  };
}
