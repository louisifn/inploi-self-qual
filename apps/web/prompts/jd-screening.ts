import type { GeneratedScreening } from "@inploi/shared";

/**
 * Prompt: JD -> screening logic (POST /api/jobs/generate).
 * Versioned + reviewable so "strategic prompting, not autocomplete" is demonstrable live.
 * The GOLDEN fallback is tied to this version and powers demo-safe mode.
 */
export const JD_SCREENING_VERSION = "jd-screening@v1";

export const JD_SCREENING_SYSTEM = `You are a hiring-design assistant for HIGH-VOLUME FRONTLINE roles (hospitality, retail, grocery, warehousing). You turn a raw job description into honest, candidate-facing self-qualification logic. You are decision SUPPORT, never an automated gate. A recruiter reviews and edits everything you produce before it goes live.

What the evidence says, and how it must shape your output:
- For frontline work, prior EXPERIENCE and formal qualifications are weak predictors of performance and retention. NEVER generate a dealbreaker or question that screens on years of experience, specific employers, or credentials. If experience seems relevant, ask about TRANSFERABLE behaviour ("worked a busy rush before, anywhere") as a non-dealbreaker question only.
- What actually decides frontline fit is AVAILABILITY, SCHEDULE, LOCATION/COMMUTE, START DATE and genuine INTENT. Lead with these. Order dealbreakers availability/schedule first, then logistics/location, then start date, then right-to-work.
- Honesty is the mechanism. Produce 4 to 7 realistic-preview facts: the unspun truth of the role (early starts, weekends, hours on your feet, pace, pay, location). Every preview fact MUST include a short verbatim sourceQuote drawn from the JD. Never invent a fact. If the JD omits pay or location, set the value to "Not stated" rather than guessing.

Hard rules:
- Generate 2 to 5 DEALBREAKERS, each a plain candidate-facing question with 2 to 4 answer options and a clear passValues subset. Mark routable=true for schedule/location/start (a better-fit role could resolve a "no"); mark routable=false for terminal ones like right-to-work.
- Tag EVERY dealbreaker with its canonical "dimension" (weekends, early_start, start_timing, transport, right_to_work, or other), and fill "scheduleProfile" with this role's honest stance on each axis. These are used in CODE to route a poor-fit candidate to other real jobs that accommodate the exact axis they failed, so be literal to the JD: a weekday-only role is weekends:none, a 10am start is earliestStart:daytime, a "start whenever" role is startTiming:flexible, a walkable/central role is transport:accessible.
- Generate 1 to 3 ROLE QUESTIONS (not dealbreakers) that surface transferable skill or genuine intent in the candidate's own words.
- NEVER screen on, or proxy for, a protected characteristic (age, sex, race, disability, religion, etc.). If the JD implies anything like that, refuse it and name the refusal in "exclusions".
- Populate "exclusions" with the criteria you deliberately did NOT generate and why (e.g. an experience requirement you converted to a transferable-skill question). This is a transparency artefact for the recruiter.
- Keep it short: the candidate flow must stay under ~5 minutes. Plain, warm, direct language. No scoring, no ranking, no rejection.
- Write with plain, traditional punctuation. NEVER use em dashes or en dashes; use commas, periods, or colons to separate clauses, and the word "to" for ranges (e.g. "5:30am to 7:00am", "£12.60 to £13.85").`;

export function buildJdScreeningPrompt(input: {
  jd: string;
  title?: string;
  employer?: string;
}): string {
  const header = [
    input.title ? `Job title (if given): ${input.title}` : null,
    input.employer ? `Employer (if given): ${input.employer}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return `${header ? header + "\n\n" : ""}Here is the raw job description. Read it and produce the structured self-qualification logic.\n\n----- JOB DESCRIPTION -----\n${input.jd}\n----- END -----`;
}

/**
 * Golden fallback for demo-safe mode / model failure: the Maple & Crumb barista role.
 * Mirrors the seeded criteria so Act 1 always produces strong, editable output on stage.
 */
export const GOLDEN_SCREENING: GeneratedScreening = {
  jobSummary: {
    title: "Bakery Barista, Team Member",
    employer: "Maple & Crumb",
    location: "Highbury, London N5",
    shiftPattern: "Early mornings, weekends required · 16 to 40 hrs/week",
    payRange: "£12.60 to £13.85/hr + tronc",
    startDate: "As soon as possible",
  },
  previewFacts: [
    {
      label: "Shifts start early",
      value: "Most shifts start 5:30 to 7:00am. The shop opens at 6:45.",
      category: "hours",
      sourceQuote: "Most shifts start between 5:30am and 7:00am.",
    },
    {
      label: "Weekends are part of it",
      value: "Most weeks include at least one weekend day. Weekends are the busiest.",
      category: "hours",
      sourceQuote: "Most weeks include at least one weekend day; weekends are our busiest",
    },
    {
      label: "On your feet, fast",
      value: "~8 hours standing. The first two hours after opening are a real rush.",
      category: "physical",
      sourceQuote: "You're on your feet for most of an 8-hour shift",
    },
    {
      label: "Some lifting",
      value: "Trays, stock and bins. Warm room, near the ovens.",
      category: "physical",
      sourceQuote: "there's some lifting (trays, stock, bins)",
    },
    {
      label: "Pay is transparent",
      value: "£12.60 to £13.85/hr + tronc (tips), reviewed at 3 months.",
      category: "pay",
      sourceQuote: "£12.60 to £13.85/hr depending on experience, plus tronc (tips)",
    },
    {
      label: "Where",
      value: "Highbury, N5, 2 minutes from Highbury & Islington station.",
      category: "location",
      sourceQuote: "The shop is two minutes from Highbury & Islington station.",
    },
  ],
  dealbreakers: [
    {
      type: "availability",
      prompt: "Can you work early mornings: shifts that start between 5:30am and 7:00am?",
      helpText: "Most shifts here start before the shop opens at 6:45am.",
      options: ["Yes, most days", "Some days", "No, mornings don't work for me"],
      passValues: ["Yes, most days"],
      routable: true,
      dimension: "early_start",
      rationale: "Early starts are the single biggest reason this role doesn't work out.",
    },
    {
      type: "availability",
      prompt: "Most shifts include weekends. Can you regularly work Saturdays and Sundays?",
      helpText: "Weekends are our busiest and hardest to cover.",
      options: ["Yes, both", "One weekend day", "No, I can't do weekends"],
      passValues: ["Yes, both"],
      routable: true,
      dimension: "weekends",
      rationale: "Weekend cover is the role's hardest constraint.",
    },
    {
      type: "logistics",
      prompt: "The bakery is in Highbury (N5). How would you get there for a 5:45am start?",
      helpText: "Trains are sparse that early, worth being honest with yourself.",
      options: [
        "I live nearby / can walk or cycle",
        "I have reliable transport that early",
        "That's tricky for me at that hour",
      ],
      passValues: ["I live nearby / can walk or cycle", "I have reliable transport that early"],
      routable: true,
      dimension: "transport",
      rationale: "A 5:45am start is unreachable by public transport from much of London.",
    },
    {
      type: "start_date",
      prompt: "When could you start?",
      helpText: null,
      options: ["This week", "Within 2 weeks", "In a month or more"],
      passValues: ["This week", "Within 2 weeks"],
      routable: true,
      dimension: "start_timing",
      rationale: "The shop needs cover soon; a far-off start date is a practical mismatch.",
    },
    {
      type: "right_to_work",
      prompt: "Do you have the right to work in the UK?",
      helpText: "We'll check documents at offer stage. This is just to confirm.",
      options: ["Yes, I do", "Not yet"],
      passValues: ["Yes, I do"],
      routable: false,
      dimension: "right_to_work",
      rationale: "A legal requirement and a terminal dealbreaker. No alternative role resolves it.",
    },
  ],
  roleQuestions: [
    {
      prompt:
        "Have you worked a busy service or rush before: café, bar, kitchen, retail, or anywhere fast-paced?",
      helpText: "Anywhere counts. Tell us in your own words.",
      inputKind: "short_text",
      options: null,
      rationale: "Transferable rush experience predicts better than a formal CV. Not a gate.",
    },
    {
      prompt: "What draws you to early-morning bakery work specifically?",
      helpText: null,
      inputKind: "short_text",
      options: null,
      rationale: "Genuine intent for the early start is the best signal we can ask for honestly.",
    },
  ],
  scheduleProfile: {
    weekends: "required",
    earliestStart: "early",
    startTiming: "immediate",
    transport: "car_or_self",
  },
  cvFocus: "fast-paced, customer-facing, or early-start work",
  exclusions: [
    "A minimum-years-of-barista-experience requirement: experience is a weak predictor of frontline performance, so we ask about transferable rush experience as a non-dealbreaker instead.",
    "Any age, gender, or other protected-characteristic criterion.",
    "Formal qualifications: none are needed for this role.",
  ],
};
