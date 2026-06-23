import type { AnswerInterpretation } from "@inploi/shared";

/**
 * Prompt: free-text answer interpretation (POST /api/answers/interpret). Haiku.
 * The model MAPS a candidate's words to one of the criterion's existing options (or "unclear").
 * It NEVER decides pass/fail. The fork stays deterministic in qualify.ts, and the candidate
 * must confirm the mapping. No score/verdict is produced anywhere.
 */
export const ANSWER_INTERPRET_VERSION = "answer-interpret@v1";

export const ANSWER_INTERPRET_SYSTEM = `You translate a candidate's free-text answer to a closed availability/logistics question into ONE of the options they were offered. You are a NORMALISER, not a judge.

Strict rules:
- Return EXACTLY one of the provided options, copied verbatim, or the literal string "unclear".
- You do NOT decide whether the candidate passes, qualifies, or is a good fit. You only pick the closest option to what they said. The system decides fit separately, transparently.
- Never invent an option that wasn't offered. Never output a score, percentage, verdict, or judgement of the person.
- If the text is genuinely ambiguous, contradictory, or doesn't clearly fit any option, return "unclear". Do NOT guess. Guessing wrong is worse than "unclear".
- Write with plain, traditional punctuation. NEVER use em dashes or en dashes; use commas, periods, or colons instead, and the word "to" for ranges.
- Always write a short, warm restatement of what you understood, phrased for the candidate to confirm or correct ("Sounds like you can do one weekend day, Saturdays. Is that right?"). For "unclear", the restatement can be empty.`;

export function buildAnswerInterpretPrompt(input: {
  question: string;
  options: string[];
  text: string;
}): string {
  return `Question the candidate was asked:
"${input.question}"

The options they could have picked:
${input.options.map((o) => `- ${o}`).join("\n")}

What the candidate wrote instead, in their own words:
"${input.text}"

Map their words to the single closest option above (verbatim), or "unclear". Then write the one-line restatement.`;
}

/**
 * Deterministic fallback for demo-safe mode / model failure. Handles the common
 * availability/logistics nuances; returns "unclear" when it isn't confident. It never
 * fabricates a passing answer. (Tuned to map the seeded weekends/start/commute questions.)
 */
export function heuristicInterpret(text: string, options: string[]): AnswerInterpretation {
  const t = text.toLowerCase();
  const find = (re: RegExp) => options.find((o) => re.test(o.toLowerCase()));

  // SAFETY RULE: any negation/contrast word forbids mapping to a PASSING value. A wrong
  // "pass" is the one thing this fallback must never do; "unclear" is always the safe default.
  const neg = /\b(no|not|never|n'?t|cannot|can'?t|don'?t|won'?t|without|except|apart from|only|but|unless|hard|tricky|difficult|struggle)\b/.test(t);

  const sat = /\bsat(urday)?s?\b/.test(t);
  const sun = /\bsun(day)?s?\b/.test(t);

  // Weekends
  if (sat || sun || /weekend/.test(t)) {
    // Can't do weekends at all (a non-pass, safe to map even with negation).
    if (/\b(no|can'?t|cannot|never|not)\b[^.!?]{0,15}weekend|weekend[^.!?]{0,12}(off|no|never)/.test(t)) {
      const o = find(/no.*weekend|can.?t do weekend/);
      if (o) return { mappedValue: o, restatement: "Sounds like weekends won't work for you. Is that right?" };
    }
    // Exactly one day, OR both days mentioned alongside a contrast word ("Saturdays but not
    // Sundays") means one weekend day. Non-pass, so safe; this is the key nuance case.
    if ((sat !== sun) || (sat && sun && neg) || /\bone (weekend )?day\b|only one|just the one/.test(t)) {
      const o = find(/one weekend|one day/);
      if (o) {
        const which = sat && !sun ? ", Saturdays" : sun && !sat ? ", Sundays" : "";
        return { mappedValue: o, restatement: `Sounds like you can do one weekend day${which}. Is that right?` };
      }
    }
    // Both days, a PASS, ONLY when there is no negation/contrast anywhere.
    if (!neg && (/\b(both|every|any|all)\b[^.!?]{0,10}(weekend|day|sat|sun)/.test(t) || (sat && sun))) {
      const o = find(/both/);
      if (o) return { mappedValue: o, restatement: "Sounds like you can do both weekend days. Is that right?" };
    }
  }

  // Start date: number-driven (the number is the signal; safe either way).
  const wk = t.match(/(\d+)\s*week/);
  const dy = t.match(/(\d+)\s*day/);
  if (wk || dy) {
    const days = wk ? parseInt(wk[1], 10) * 7 : parseInt(dy![1], 10);
    const span = wk ? `${wk[1]} weeks` : `${dy![1]} days`;
    if (days <= 16) {
      const o = find(/within 2 weeks|2 weeks/) || find(/this week/);
      if (o) return { mappedValue: o, restatement: `Sounds like you could start in about ${span}. Is that right?` };
    } else {
      const o = find(/month or more|a month/);
      if (o) return { mappedValue: o, restatement: `Sounds like you'd need about ${span} before starting. Is that right?` };
    }
  }

  // Commute: the "tricky" non-pass is safe; the passing options require no negation.
  if (/\b(tricky|hard|difficult|struggle|far|miles away|hour away|two buses|no transport)\b/.test(t)) {
    const o = find(/tricky/);
    if (o) return { mappedValue: o, restatement: "Sounds like getting there that early would be tricky. Is that right?" };
  }
  if (!neg && /\b(car|drive|driving|bike|cycle|cycling|moped|scooter|lift|van|motorbike)\b/.test(t)) {
    const o = find(/reliable transport|transport/);
    if (o) return { mappedValue: o, restatement: "Sounds like you've got reliable transport for an early start. Is that right?" };
  }
  if (!neg && /\b(nearby|close by|round the corner|walk|walking|local|minutes away|live near)\b/.test(t)) {
    const o = find(/nearby|walk|cycle/);
    if (o) return { mappedValue: o, restatement: "Sounds like you're close enough to walk or cycle. Is that right?" };
  }

  return { mappedValue: "unclear", restatement: "" };
}
