import type { PreviewFacts, CriteriaConfig, GapNotes } from "@inploi/shared";

/**
 * The seeded demo world. Frontline hourly is the primary demo (availability-led),
 * with a fictional employer. Copy is written to feel real: it renders on every screen.
 *
 * Stable string IDs make seed/reset idempotent and let golden AI fallbacks key off them.
 */

export const EMPLOYER = "Maple & Crumb";

// ── The live primary job ─────────────────────────────────────────────────────────
export const PRIMARY_JOB_ID = "job_mc_barista_highbury";

export const PRIMARY_JOB = {
  id: PRIMARY_JOB_ID,
  title: "Bakery Barista, Team Member",
  employer: EMPLOYER,
  location: "Highbury, London N5",
  shiftPattern: "Early mornings, weekends required · 16 to 40 hrs/week",
  payRange: "£12.60 to £13.85/hr + tronc",
  startDate: "As soon as possible",
  status: "live" as const,
  isRoutableTarget: false,
  description: `Bakery Barista, Team Member
Maple & Crumb · Highbury (N5)

About the role
We're a small, growing London bakery-café and our Highbury shop is our busiest. We bake on site from before dawn, so mornings here are early, warm and fast. You'd be on the coffee machine, on the counter serving a queue of regulars, keeping the cabinets full and the floor clean, and helping the bakers get bread and pastries out for opening.

The honest version
Most shifts start between 5:30am and 7:00am. The shop opens at 6:45 and the first two hours are a rush. You'll be making coffee, serving fast and restocking at the same time. You're on your feet for most of an 8-hour shift, and there's some lifting (trays, stock, bins). Most weeks include at least one weekend day; weekends are our busiest and hardest to cover.

What you'll do
- Make espresso-based drinks on a commercial machine (we'll train you if you're keen)
- Serve customers quickly and warmly through the morning rush
- Keep cabinets, shelves and the coffee station stocked and clean
- Help the bakery team move product out for opening
- Handle card and cash, and close down the station at end of shift

Who does well here
People who are reliable for early starts, calm under a rush, and genuinely fine with weekends. Café, bar, kitchen or fast retail experience helps, but we care more that you can show up at 5:30am and keep your head in a queue. No formal qualifications needed.

Pay & hours
£12.60 to £13.85/hr depending on experience, plus tronc (tips), reviewed at 3 months. Part-time and full-time, 16 to 40 hrs/week. The shop is two minutes from Highbury & Islington station.

You must have the right to work in the UK.`,
} satisfies Record<string, unknown>;

export const PRIMARY_PREVIEW_FACTS: PreviewFacts = [
  {
    label: "Shifts start early",
    value: "Most shifts start 5:30 to 7:00am. The shop opens at 6:45.",
    category: "hours",
    emphasis: true,
  },
  {
    label: "Weekends are part of it",
    value: "Most weeks include at least one weekend day. Weekends are the busiest.",
    category: "hours",
    emphasis: true,
  },
  {
    label: "On your feet, fast",
    value: "~8 hours standing. The first two hours after opening are a real rush.",
    category: "physical",
  },
  {
    label: "Some lifting",
    value: "Trays, stock and bins. Warm room, near the ovens.",
    category: "physical",
  },
  {
    label: "Pay is transparent",
    value: "£12.60 to £13.85/hr + tronc (tips), reviewed at 3 months.",
    category: "pay",
    emphasis: true,
  },
  {
    label: "Where",
    value: "Highbury, N5, 2 minutes from Highbury & Islington station.",
    category: "location",
    emphasis: true,
  },
];

// ── Screening criteria (the generated-then-edited logic, availability-first) ────────
type SeedCriterion = {
  id: string;
  type: "availability" | "logistics" | "role_specific" | "cv_check";
  prompt: string;
  helpText?: string;
  isDealbreaker: boolean;
  config: CriteriaConfig;
  rationale?: string;
  displayOrder: number;
};

export const PRIMARY_CRITERIA: SeedCriterion[] = [
  {
    id: "crit_early_mornings",
    type: "availability",
    prompt: "Can you work early mornings: shifts that start between 5:30am and 7:00am?",
    helpText: "Most shifts here start before the shop opens at 6:45am.",
    isDealbreaker: true,
    rationale: "Early starts are the single biggest reason this role doesn't work out. Asked first.",
    config: {
      kind: "single_select",
      options: ["Yes, most days", "Some days", "No, mornings don't work for me"],
      passValues: ["Yes, most days"],
      routable: true,
    },
    displayOrder: 0,
  },
  {
    id: "crit_weekends",
    type: "availability",
    prompt: "Most shifts include weekends. Can you regularly work Saturdays and Sundays?",
    helpText: "Weekends are our busiest and hardest to cover.",
    isDealbreaker: true,
    rationale: "Weekend cover is the role's hardest constraint.",
    config: {
      kind: "single_select",
      options: ["Yes, both", "One weekend day", "No, I can't do weekends"],
      passValues: ["Yes, both"],
      routable: true,
    },
    displayOrder: 1,
  },
  {
    id: "crit_commute",
    type: "logistics",
    prompt: "The bakery is in Highbury (N5). How would you get there for a 5:45am start?",
    helpText: "Trains are sparse that early. Worth being honest with yourself.",
    isDealbreaker: true,
    rationale: "A 5:45am start is unreachable by public transport from much of London.",
    config: {
      kind: "single_select",
      options: [
        "I live nearby / can walk or cycle",
        "I have reliable transport that early",
        "That's tricky for me at that hour",
      ],
      passValues: ["I live nearby / can walk or cycle", "I have reliable transport that early"],
      routable: true,
    },
    displayOrder: 2,
  },
  {
    id: "crit_start_date",
    type: "availability",
    prompt: "When could you start?",
    isDealbreaker: true,
    rationale: "The shop needs cover soon; a far-off start date is a practical mismatch.",
    config: {
      kind: "single_select",
      options: ["This week", "Within 2 weeks", "In a month or more"],
      passValues: ["This week", "Within 2 weeks"],
      routable: true,
    },
    displayOrder: 3,
  },
  {
    id: "crit_right_to_work",
    type: "logistics",
    prompt: "Do you have the right to work in the UK?",
    helpText: "We'll check documents at offer stage. This is just to confirm.",
    isDealbreaker: true,
    rationale: "A legal requirement and a terminal dealbreaker. There's no alternative role to route to.",
    config: {
      kind: "boolean",
      passValues: ["yes"],
      routable: false, // terminal: no better-fit role can resolve this
    },
    displayOrder: 4,
  },
  {
    id: "crit_busy_service",
    type: "role_specific",
    prompt:
      "Have you worked a busy service or rush before: café, bar, kitchen, retail, or anywhere fast-paced?",
    helpText: "Anywhere counts. Tell us in your own words.",
    isDealbreaker: false,
    rationale: "Transferable rush experience predicts better than a formal CV. Not a gate.",
    config: { kind: "short_text" },
    displayOrder: 5,
  },
  {
    id: "crit_why_mornings",
    type: "role_specific",
    prompt: "What draws you to early-morning bakery work specifically?",
    isDealbreaker: false,
    rationale: "Genuine intent for the early start is the best signal we can ask for honestly.",
    config: { kind: "short_text" },
    displayOrder: 6,
  },
  {
    id: "crit_cv_focus",
    type: "cv_check",
    prompt: "We'll take a quick, gentle look at your experience, only if you shared any.",
    isDealbreaker: false,
    rationale: "Humane gap-explanation, never a score. Skipped entirely if no CV was shared.",
    config: { kind: "cv_check", focus: "fast-paced, customer-facing, or early-start work" },
    displayOrder: 7,
  },
];

// ── Stub redirect-target roles (display-only; static catalogue for Act 3) ───────────
type SeedStubJob = {
  id: string;
  title: string;
  location: string;
  shiftPattern: string;
  payRange: string;
};

export const STUB_ROLES: SeedStubJob[] = [
  {
    id: "job_mc_weekday_kitchen_hoxton",
    title: "Weekday Kitchen Team",
    location: "Hoxton, N1",
    shiftPattern: "Mon to Fri, 8am to 4pm · no weekends",
    payRange: "£12.40 to £13.20/hr",
  },
  {
    id: "job_mc_daytime_cafe_highbury",
    title: "Daytime Café Assistant",
    location: "Highbury, N5",
    shiftPattern: "Weekday daytime, 9am to 3pm · weekends optional",
    payRange: "£12.60 to £13.40/hr + tronc",
  },
  {
    id: "job_mc_evenings_foh_angel",
    title: "Evenings Front of House",
    location: "Angel, N1",
    shiftPattern: "Afternoons & evenings, 3pm to 10pm",
    payRange: "£12.80 to £13.85/hr + tronc",
  },
  {
    id: "job_mc_stockroom_highbury",
    title: "Stockroom & Deliveries",
    location: "Highbury, N5",
    shiftPattern: "Flexible weekday mornings · no customer rush",
    payRange: "£12.50 to £13.20/hr",
  },
];

// fromJob (primary) → toJob (stub). `resolvesDealbreaker` holds the criterion ID this
// alternative resolves, so the Act 3 fork can pick routes causally from the failed dealbreaker.
export const JOB_ROUTES = [
  {
    id: "route_weekends_kitchen",
    toJobId: "job_mc_weekday_kitchen_hoxton",
    reason: "Mon to Fri only, no weekends needed.",
    resolvesDealbreaker: "crit_weekends",
  },
  {
    id: "route_weekends_daytime",
    toJobId: "job_mc_daytime_cafe_highbury",
    reason: "Weekday daytime at the same Highbury site; weekends optional.",
    resolvesDealbreaker: "crit_weekends",
  },
  {
    id: "route_weekends_stockroom",
    toJobId: "job_mc_stockroom_highbury",
    reason: "Weekday mornings, no weekend cover.",
    resolvesDealbreaker: "crit_weekends",
  },
  {
    id: "route_early_evenings",
    toJobId: "job_mc_evenings_foh_angel",
    reason: "Afternoons and evenings, no early start at all.",
    resolvesDealbreaker: "crit_early_mornings",
  },
  {
    id: "route_early_daytime",
    toJobId: "job_mc_daytime_cafe_highbury",
    reason: "Starts at 9am, not before dawn.",
    resolvesDealbreaker: "crit_early_mornings",
  },
  {
    id: "route_commute_daytime",
    toJobId: "job_mc_daytime_cafe_highbury",
    reason: "A 9am start is far easier to reach than 5:45am.",
    resolvesDealbreaker: "crit_commute",
  },
  {
    id: "route_start_stockroom",
    toJobId: "job_mc_stockroom_highbury",
    reason: "Flexible start, can wait for the right person.",
    resolvesDealbreaker: "crit_start_date",
  },
];

// ── Pre-baked background applications (give the recruiter board texture) ─────────────
type SeedBackgroundApp = {
  id: string;
  candidateName: string;
  email: string;
  phone?: string;
  cvText?: string;
  status: "submitted" | "redirected" | "self_withdrew";
  redirectedToJobId?: string;
  minutesAgo: number;
  responses: Array<{ criteriaId: string; answer: string; fitFlag: "pass" | "fail" | "explain"; explanation?: string }>;
  signal: {
    availabilityFit: "pass" | "fail";
    intentSignal: "strong" | "some" | "unclear";
    gapNotes: GapNotes;
    summary: string;
  };
};

export const BACKGROUND_APPS: SeedBackgroundApp[] = [
  {
    id: "app_priya",
    candidateName: "Priya Shah",
    email: "priya.shah@example.com",
    phone: "07700 900142",
    cvText:
      "Barista and team member, Pret a Manger, Angel (2 years). Opened the store on early shifts, ran the coffee bar through the morning rush, trained two new starters. Before that, weekend retail at a garden centre.",
    status: "submitted",
    minutesAgo: 54,
    responses: [
      { criteriaId: "crit_early_mornings", answer: "Yes, most days", fitFlag: "pass" },
      { criteriaId: "crit_weekends", answer: "Yes, both", fitFlag: "pass" },
      { criteriaId: "crit_commute", answer: "I live nearby / can walk or cycle", fitFlag: "pass" },
      { criteriaId: "crit_start_date", answer: "This week", fitFlag: "pass" },
      { criteriaId: "crit_right_to_work", answer: "yes", fitFlag: "pass" },
      {
        criteriaId: "crit_busy_service",
        answer: "Two years at Pret on opening shifts. I'm used to a 6am start and a queue out the door.",
        fitFlag: "pass",
      },
      {
        criteriaId: "crit_why_mornings",
        answer: "Honestly I love the calm before opening and the rhythm of the morning. Early starts suit me.",
        fitFlag: "pass",
      },
    ],
    signal: {
      availabilityFit: "pass",
      intentSignal: "strong",
      gapNotes: [{ area: "Early-start experience", status: "confirmed", candidateText: "2 yrs Pret opening shifts" }],
      summary: "Clears every shift. 2 yrs Pret opening shifts; genuinely likes early starts. Lives local.",
    },
  },
  {
    id: "app_tom",
    candidateName: "Tom Fletcher",
    email: "t.fletcher@example.com",
    phone: "07700 900318",
    cvText:
      "Sales assistant, Argos, Holloway (8 months). Stock and tills. Some weekend shifts. Looking for something closer to home with more hours.",
    status: "submitted",
    minutesAgo: 31,
    responses: [
      { criteriaId: "crit_early_mornings", answer: "Yes, most days", fitFlag: "pass" },
      { criteriaId: "crit_weekends", answer: "Yes, both", fitFlag: "pass" },
      { criteriaId: "crit_commute", answer: "I have reliable transport that early", fitFlag: "pass" },
      { criteriaId: "crit_start_date", answer: "Within 2 weeks", fitFlag: "pass" },
      { criteriaId: "crit_right_to_work", answer: "yes", fitFlag: "pass" },
      {
        criteriaId: "crit_busy_service",
        answer: "Bit of retail at Argos, tills and stock. Not café exactly but I can handle busy.",
        fitFlag: "pass",
      },
      {
        criteriaId: "crit_why_mornings",
        answer: "Mainly I need more hours and it's near me.",
        fitFlag: "pass",
        explanation: "Mainly I need more hours and it's near me.",
      },
    ],
    signal: {
      availabilityFit: "pass",
      intentSignal: "some",
      gapNotes: [
        { area: "Café/coffee experience", status: "explained", candidateText: "Retail, not café, but used to busy" },
      ],
      summary: "Clears every shift. Retail (Argos), not café; keen to learn. Motivation is hours + proximity.",
    },
  },
  {
    id: "app_jordan",
    candidateName: "Jordan Lee",
    email: "jordan.lee@example.com",
    status: "redirected",
    redirectedToJobId: "job_mc_weekday_kitchen_hoxton",
    minutesAgo: 19,
    responses: [
      { criteriaId: "crit_early_mornings", answer: "Yes, most days", fitFlag: "pass" },
      { criteriaId: "crit_weekends", answer: "No, I can't do weekends", fitFlag: "fail" },
      { criteriaId: "crit_commute", answer: "I live nearby / can walk or cycle", fitFlag: "pass" },
      { criteriaId: "crit_start_date", answer: "This week", fitFlag: "pass" },
      { criteriaId: "crit_right_to_work", answer: "yes", fitFlag: "pass" },
    ],
    // Redirected candidates never appear on the recruiter board. Their absence is the demo point.
    signal: {
      availabilityFit: "fail",
      intentSignal: "some",
      gapNotes: [],
      summary: "Self-selected out on weekends; took the weekday kitchen role instead.",
    },
  },
];

/**
 * The canonical demo candidate CV: a deliberate PARTIAL match. Clears most availability
 * questions but has exactly one explainable gap (no obvious café/coffee experience), so the
 * gap-explanation block and the honest fork both have something real to work with.
 */
export const DEMO_CANDIDATE_CV = `Warehouse operative, DPD depot, Tottenham (1 year). Early shifts loading vans from 4:30am, never missed a start. Fast, physical, on my feet all shift.
Before that: kitchen porter at a pub for 6 months (weekends), and helped at my uncle's corner shop on the till.
Reliable, fit, used to early mornings. Looking to move into something more front-of-house and customer-facing.`;

export const DEMO_CANDIDATE = {
  name: "Sam Okafor",
  email: "sam.okafor@example.com",
  phone: "07700 900245",
  cvText: DEMO_CANDIDATE_CV,
};
