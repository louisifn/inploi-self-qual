import type { CvAnalysis } from "@inploi/shared";

/**
 * Prompt: CV gap analysis (POST /api/cv/analyse). Haiku: fast, on the candidate's path.
 * Generates self-report PROMPTS, never a score. The signature "gaps resolving" moment runs on this.
 */
export const CV_ANALYSIS_VERSION = "cv-analysis@v1";

export const CV_ANALYSIS_SYSTEM = `You help a candidate add context a CV can't show. You do NOT score, rank, pass or fail anyone. That is forbidden. Your only job is to surface (a) where their experience clearly lines up with the role, so they can confirm it, and (b) where you didn't find clear evidence of something the role values, framed as a warm invitation to explain, never as a rejection.

Rules:
- Every alignment MUST cite a short verbatim evidenceQuote taken straight from the CV text. Never claim "we saw X" unless those words are really there.
- Gaps are invitations, not failures. Phrase explainPrompt warmly ("We didn't see much about Y. Want to add anything?"). Where you can, add a transferableHint pointing at adjacent experience they already mentioned ("kitchen or till work both count here").
- Return at most 4 alignments and at most 3 gaps. This is a humane step, not an interrogation. Keep everything short and plain.
- If the CV is thin or basically empty, set noCvSignal=true and return NO gaps. Reassure instead. Many great frontline candidates have little CV; that is fine and never counts against them.
- The disclaimer must make explicit, in the candidate's favour, that this does not score them.
- Write with plain, traditional punctuation. NEVER use em dashes or en dashes; use commas, periods, or colons instead, and the word "to" for any range (e.g. "6am to 7am").`;

export function buildCvAnalysisPrompt(input: { cvText: string; roleRequirements: string }): string {
  return `ROLE, what it actually values:\n${input.roleRequirements}\n\nCANDIDATE CV / EXPERIENCE (their own words):\n${input.cvText}\n\nSurface the alignments (with verbatim quotes) and at most three gentle gaps.`;
}

/** Golden fallback keyed to the seeded demo candidate (Sam Okafor, a deliberate partial match). */
export const GOLDEN_CV_ANALYSIS: CvAnalysis = {
  alignments: [
    {
      requirement: "Reliable for very early starts",
      evidenceQuote: "Early shifts loading vans from 4:30am, never missed a start",
      confirmPrompt: "We saw you're used to 4:30am starts. That's exactly the kind of early this role needs. Is that right?",
    },
    {
      requirement: "Comfortable on your feet, fast and physical",
      evidenceQuote: "Fast, physical, on my feet all shift",
      confirmPrompt: "Sounds like you're used to being on your feet all shift. Fair to say?",
    },
    {
      requirement: "Some food / hospitality exposure",
      evidenceQuote: "kitchen porter at a pub for 6 months (weekends)",
      confirmPrompt: "You've done kitchen work at weekends before. Does serving customers appeal too?",
    },
  ],
  gaps: [
    {
      requirement: "Coffee / barista or café-counter experience",
      explainPrompt: "We didn't see café or coffee work specifically. Want to tell us anything, even if it's just that you're keen to learn the machine?",
      transferableHint: "Your till work at the corner shop and kitchen experience both count here.",
    },
  ],
  noCvSignal: false,
  disclaimer: "This doesn't score or rank you. It just lets you add context a CV can't show.",
};
