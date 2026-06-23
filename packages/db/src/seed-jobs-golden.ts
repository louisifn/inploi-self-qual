import type { GeneratedScreening } from "@inploi/shared";

/**
 * Captured golden screenings for the pool jobs, keyed by job id. Real model output captured
 * from the live generate call on each prose JD (see seed-jobs.ts), used as the deterministic
 * fallback when seeding in demo-safe mode or when a live generation fails.
 */
export const POOL_GOLDENS: Record<string, GeneratedScreening> = {
  "job_stack_street_lunch_crew": {
    "jobSummary": {
      "title": "Lunchtime Crew Member",
      "employer": "Stack Street Kitchen",
      "location": "Old Street (EC1)",
      "shiftPattern": "Part-time or full-time, 20 to 40 hours a week, including weekends",
      "payRange": "£12.50 to £13.20 per hour plus tips",
      "startDate": "Immediate (this week)"
    },
    "previewFacts": [
      {
        "label": "Pay rate",
        "value": "£12.50 to £13.20 per hour plus a share of tips.",
        "category": "pay",
        "sourceQuote": "12.50 to 13.20 pounds an hour plus a share of tips"
      },
      {
        "label": "The midday rush",
        "value": "You will be working in a very quick, busy environment, especially from 12:00pm to 2:00pm.",
        "category": "pace",
        "sourceQuote": "the hardest hours are 12 to 2pm every day"
      },
      {
        "label": "Weekend shifts",
        "value": "We are busy seven days a week, so you will need to work most weekends.",
        "category": "hours",
        "sourceQuote": "we need someone who is genuinely fine working most weekends"
      },
      {
        "label": "Physical pace",
        "value": "You will be standing for your entire shift and will help lift heavy stock and bins.",
        "category": "physical",
        "sourceQuote": "You are on your feet the whole shift and there is some lifting of stock and bins"
      },
      {
        "label": "Commute",
        "value": "The kitchen is located just a two-minute walk from Old Street station.",
        "category": "location",
        "sourceQuote": "Two minutes from Old Street station"
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you comfortable and available to work regular weekend shifts?",
        "helpText": "We are open seven days a week and weekends are just as busy as our weekday lunch rushes.",
        "options": [
          "Yes, I can work most weekends",
          "No, I need weekends off"
        ],
        "passValues": [
          "Yes, I can work most weekends"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The kitchen requires team members who are genuinely available to cover busy weekend lunch shifts."
      },
      {
        "type": "start_date",
        "prompt": "Are you able to start working and training with us this week?",
        "helpText": "We are looking for crew members who can jump straight into training from day one.",
        "options": [
          "Yes, I can start this week",
          "No, I need to start later"
        ],
        "passValues": [
          "Yes, I can start this week"
        ],
        "routable": true,
        "dimension": "start_timing",
        "rationale": "The team has an immediate opening and begins practical on-the-floor training right away."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": "We will need to complete a quick right-to-work check before your first training shift.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Legal right to work is a non-negotiable regulatory requirement."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Tell us about a time you handled a busy or fast-paced environment.",
        "helpText": "This does not have to be kitchen experience, it can be retail, customer service, volunteering, or any busy environment where you had to stay calm.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "The JD notes the role is loud, quick, and busy, requiring staff to hold their nerve with lines out the door. Highlighting transferable resilience is a strong predictor of success."
      }
    ],
    "scheduleProfile": {
      "weekends": "required",
      "earliestStart": "daytime",
      "startTiming": "immediate",
      "transport": "accessible"
    },
    "cvFocus": "High-volume customer-facing experience, hospitality, quick-service retail, or physical shift work.",
    "exclusions": [
      "We did not screen for previous fast-food or counter-service kitchen experience, as this can be taught on the job and would unnecessarily filter out capable, resilient candidates from other sectors.",
      "We did not include any educational qualifications or certificates as they do not predict performance for crew member duties."
    ]
  },
  "job_long_table_kitchen_porter": {
    "jobSummary": {
      "title": "Weekday Kitchen Porter",
      "employer": "The Long Table",
      "location": "Clerkenwell (EC1)",
      "shiftPattern": "Monday to Friday, 10:00am to mid afternoon",
      "payRange": "£12.40 an hour",
      "startDate": "Flexible"
    },
    "previewFacts": [
      {
        "label": "No weekends",
        "value": "This is a weekday-only job, with absolutely no shifts on Saturdays or Sundays.",
        "category": "hours",
        "sourceQuote": "This is a weekday-only job, no weekends at all"
      },
      {
        "label": "Shift timings",
        "value": "Shifts start at 10:00am and finish in the mid afternoon, meaning no late nights and no early mornings.",
        "category": "hours",
        "sourceQuote": "Shifts start at 10am to cover prep, then run through the lunch service to mid afternoon"
      },
      {
        "label": "Physical work",
        "value": "You will be on your feet for your whole shift, managing the pot wash, washing down, and lifting heavy stock or bins.",
        "category": "physical",
        "sourceQuote": "you are on the pot wash and washing down through a busy two-hour service, on your feet throughout, with some lifting of stock and bins."
      },
      {
        "label": "Hourly pay",
        "value": "The pay is £12.40 an hour, and your pay will be reviewed after three months.",
        "category": "pay",
        "sourceQuote": "12.40 pounds an hour, reviewed at three months."
      },
      {
        "label": "Easy commute",
        "value": "The kitchen is located just a short walk from Farringdon station.",
        "category": "location",
        "sourceQuote": "We are a five-minute walk from Farringdon station."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work part-time shifts (15 to 30 hours a week) between Monday and Friday?",
        "helpText": "We serve the weekday lunchtime office crowd, so we do not have weekend or evening hours.",
        "options": [
          "Yes, I want weekday daytime hours",
          "No, I need weekend or evening hours"
        ],
        "passValues": [
          "Yes, I want weekday daytime hours"
        ],
        "routable": true,
        "dimension": "other",
        "rationale": "Confirms the candidate is specifically seeking weekday-only, part-time hours."
      },
      {
        "type": "logistics",
        "prompt": "Can you reliably travel to Clerkenwell (EC1) for a 10:00am start on your shift days?",
        "helpText": "We are a five-minute walk from Farringdon station.",
        "options": [
          "Yes, I can easily commute to Clerkenwell by 10:00am",
          "No, this location is difficult for me to reach"
        ],
        "passValues": [
          "Yes, I can easily commute to Clerkenwell by 10:00am"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Ensures the candidate can sustainably commute to the kitchen for the start of prep."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We will need to check your documents before you can start.",
        "options": [
          "Yes, I have the legal right to work in the UK",
          "No, I do not"
        ],
        "passValues": [
          "Yes, I have the legal right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Required legal check for UK employment."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Tell us about a time you worked in a fast-paced environment where you had to stay active or do heavy lifting.",
        "helpText": "This could be in a kitchen, a warehouse, a busy shop, or any other fast-moving role.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Assesses physical stamina and experience with active work environments, avoiding strict exclusion of candidates without formal kitchen experience."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Reliable work history, physical stamina, or experience in fast-paced retail, cleaning, warehousing, or hospitality roles.",
    "exclusions": [
      "Prior Kitchen Porter experience: We did not mandate specific prior KP experience because physical stamina, reliability, and schedule alignment are much stronger predictors of success in this frontline role."
    ]
  },
  "job_northgate_evening_cleaner": {
    "jobSummary": {
      "title": "Evening Cleaner, Northgate Offices",
      "employer": "Northgate Offices",
      "location": "Angel (N1)",
      "shiftPattern": "Monday to Thursday (optional Friday), 6:00pm to 9:30pm",
      "payRange": "£12.20 per hour",
      "startDate": "Flexible"
    },
    "previewFacts": [
      {
        "label": "Evening hours",
        "value": "Shifts run 6:00pm to 9:30pm, which is ideal if you are looking to fit work around daytime commitments.",
        "category": "hours",
        "sourceQuote": "Shifts run 6pm to 9:30pm, so this is ideal if you cannot do early mornings or you are fitting work around the day."
      },
      {
        "label": "No weekend work",
        "value": "The schedule is Monday to Thursday, with an optional Friday shift and no weekend hours.",
        "category": "hours",
        "sourceQuote": "Days are Monday to Thursday with the option of Friday, and there are no weekends."
      },
      {
        "label": "Physical expectations",
        "value": "You will be vacuuming, wiping surfaces, and cleaning kitchens and washrooms across multiple floors, which requires some bending and carrying.",
        "category": "physical",
        "sourceQuote": "The work is steady rather than rushed: vacuuming, surfaces, kitchens and washrooms across a few floors, with some bending and carrying."
      },
      {
        "label": "Part-time hours and pay",
        "value": "You will earn £12.20 per hour for 14 to 18 hours of work per week.",
        "category": "pay",
        "sourceQuote": "12.20 pounds an hour. Part-time, around 14 to 18 hours a week."
      },
      {
        "label": "Easy public transport",
        "value": "The office is located just a two-minute walk from Angel station and is close to several bus routes.",
        "category": "location",
        "sourceQuote": "The building is two minutes from Angel station and on plenty of bus routes."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you able to work the fixed evening schedule of 6:00pm to 9:30pm, Monday to Thursday?",
        "helpText": "These hours are set after the offices empty out and cannot be moved earlier in the day.",
        "options": [
          "Yes, I can work all of these evening shifts",
          "No, I need daytime hours or different days"
        ],
        "passValues": [
          "Yes, I can work all of these evening shifts"
        ],
        "routable": true,
        "dimension": "other",
        "rationale": "The cleaning must be completed post-business hours when the office building is empty."
      },
      {
        "type": "logistics",
        "prompt": "Are you comfortable commuting to Angel (N1) for shifts ending at 9:30pm?",
        "helpText": "Please consider your travel options for getting home safely after 9:30pm.",
        "options": [
          "Yes, that commute works well for me",
          "No, Angel is too difficult to reach or get home from at that time"
        ],
        "passValues": [
          "Yes, that commute works well for me"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Candidates must be able to reliably reach the location and travel home safely during late evening hours."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": null,
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "A mandatory legal requirement for employment."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "What makes this part-time evening schedule a good fit for you right now?",
        "helpText": "For example, are you balancing this with studies, another job, family care, or do you just prefer working in the evening?",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Allows the candidate to explain their schedule alignment and show genuine intent for part-time evening shifts."
      },
      {
        "prompt": "How comfortable are you working independently to complete a checklist of cleaning tasks?",
        "helpText": "This role involves working on your own once the offices are empty.",
        "inputKind": "single_select",
        "options": [
          "I am highly comfortable working alone and following a cleaning checklist",
          "I prefer working closely with a team, but I can manage on my own",
          "I have never worked alone before, but I am willing to learn"
        ],
        "rationale": "Evaluates the candidate's comfort with independent work without demanding years of professional cleaning experience."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "late",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Reliability and self-management, such as any experience working independent shifts, maintaining spaces, stocking, domestic work, or general maintenance.",
    "exclusions": [
      "Did not screen for past commercial cleaning experience or certifications to avoid excluding candidates with transferable domestic or independent working skills.",
      "Did not create a hard physical test for bending and carrying, electing instead to describe these physical tasks honestly in the preview facts."
    ]
  },
  "job_maple_home_stockroom": {
    "jobSummary": {
      "title": "Stockroom Assistant",
      "employer": "Maple Home",
      "location": "Islington (N1)",
      "shiftPattern": "24 to 40 hours per week, daytime shifts roughly 9am to 5pm, weekdays with occasional Saturdays",
      "payRange": "£12.50 per hour",
      "startDate": "Early next month"
    },
    "previewFacts": [
      {
        "label": "Hourly pay",
        "value": "£12.50 per hour, offering part-time or full-time hours",
        "category": "pay",
        "sourceQuote": "12.50 pounds an hour. Part-time and full-time, 24 to 40 hours a week."
      },
      {
        "label": "Daytime shifts",
        "value": "Shifts are daytime, roughly 9am to 5pm, meaning no early morning or late night hours",
        "category": "hours",
        "sourceQuote": "Hours are daytime, roughly 9am to 5pm, so no very early starts."
      },
      {
        "label": "Occasional Saturdays",
        "value": "The role is mainly weekdays, but you will occasionally need to work a Saturday during busy weeks",
        "category": "hours",
        "sourceQuote": "Days are mainly weekdays, with the occasional Saturday during the busiest weeks rather than every weekend."
      },
      {
        "label": "Physical demands",
        "value": "You will spend your day on your feet and lifting heavy boxes",
        "category": "physical",
        "sourceQuote": "You are on your feet and lifting boxes through the day, so a reasonable level of fitness matters."
      },
      {
        "label": "Easy commute",
        "value": "The shop is located in Islington, only a five minute walk from the nearest station",
        "category": "location",
        "sourceQuote": "Five minutes from Highbury and Islington station."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you able to work occasional Saturdays during our busiest weeks?",
        "helpText": "While shifts are mainly Monday to Friday, we do need stockroom support on Saturdays during peak autumn and winter weeks.",
        "options": [
          "Yes, I can work occasional Saturdays",
          "No, I can only work weekdays"
        ],
        "passValues": [
          "Yes, I can work occasional Saturdays"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The role requires occasional Saturday availability during peak business weeks."
      },
      {
        "type": "start_date",
        "prompt": "Are you available to start working early next month?",
        "helpText": "This role is timed specifically for our autumn refit starting next month.",
        "options": [
          "Yes, I can start early next month",
          "No, I need a job that starts immediately",
          "No, I cannot start until later than next month"
        ],
        "passValues": [
          "Yes, I can start early next month"
        ],
        "routable": true,
        "dimension": "start_timing",
        "rationale": "The shop starts its autumn refit next month and needs the candidate ready then, not immediately or much later."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We are required to check your documentation before you start working with us.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have right to work"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Right to work is a legal requirement for UK employment."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Tell us about a time you worked in a physical role or managed organized spaces, such as stockrooms, moving boxes, or keeping a workspace tidy.",
        "helpText": "This could be in retail, warehousing, event setup, or any similar hands-on experience.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Verifies that the candidate understands the physical requirements of stock handling and has some transferable organizational experience."
      }
    ],
    "scheduleProfile": {
      "weekends": "optional",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "hands-on physical roles, stockroom management, logistics, or retail shop floor support",
    "exclusions": [
      "Prior stockroom experience requirements: converted to a transferable-skills question about organized physical spaces to avoid excluding capable candidates.",
      "Physical fitness test: physical demands are handled transparently as a preview fact so candidates can self-select based on their own capabilities without medical discrimination."
    ]
  },
  "job_eastline_weekend_warehouse": {
    "jobSummary": {
      "title": "Weekend Warehouse Operative",
      "employer": "Eastline Distribution",
      "location": "Tottenham (N17)",
      "shiftPattern": "Saturday and Sunday, 8:00am to 4:00pm",
      "payRange": "£13.10 per hour with a weekend uplift",
      "startDate": "As soon as checks clear"
    },
    "previewFacts": [
      {
        "label": "Weekend schedule",
        "value": "You will work both Saturday and Sunday every single week.",
        "category": "hours",
        "sourceQuote": "This is a weekend role: both Saturday and Sunday, every week."
      },
      {
        "label": "Physical lifting",
        "value": "The role is physically demanding with steady lifting and packing throughout the shift.",
        "category": "physical",
        "sourceQuote": "The work is picking, packing and loading, and it is genuinely physical with steady lifting throughout."
      },
      {
        "label": "On your feet",
        "value": "This is an 8-hour shift spent completely on your feet.",
        "category": "physical",
        "sourceQuote": "not an early-morning start but a full day on your feet."
      },
      {
        "label": "Location and transport",
        "value": "The warehouse is off regular bus routes, so you must have your own reliable way to travel.",
        "category": "location",
        "sourceQuote": "The unit sits off the main bus routes, so you will need your own reliable way of getting there, a car, bike or lift, especially for the 8am start."
      },
      {
        "label": "Pay and rate",
        "value": "You earn 13.10 pounds per hour with additional weekend pay.",
        "category": "pay",
        "sourceQuote": "13.10 pounds an hour with a weekend uplift."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work both Saturday and Sunday every week from 8:00am to 4:00pm?",
        "helpText": "This is a dedicated weekend position of 16 hours total.",
        "options": [
          "Yes, I can work both Saturday and Sunday every week",
          "No, I cannot work both days every week"
        ],
        "passValues": [
          "Yes, I can work both Saturday and Sunday every week"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The business model of this distribution center relies on operatives who can cover both weekend days consistently."
      },
      {
        "type": "logistics",
        "prompt": "Do you have a reliable way to get to our Tottenham (N17) site for an 8:00am start on weekends?",
        "helpText": "The unit sits off main public transport routes, so walking, cycling, or having your own car or lift is required.",
        "options": [
          "Yes, I have reliable transport that does not depend on main bus routes",
          "No, I would need to rely on main bus routes"
        ],
        "passValues": [
          "Yes, I have reliable transport that does not depend on main bus routes"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "The site is physically isolated from weekend public transport links, making self-transport critical for punctual 8:00am starts."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We will need to check your documents before you can start.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "This is a strict legal requirement for employment at Eastline Distribution."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "This role involves steady lifting and standing for your entire 8-hour shift. Have you done physical work, active hobbies, or sports before where you were on your feet all day?",
        "helpText": "Please tell us briefly about any experience that makes you comfortable with a physically active day.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Ensures candidates have realistic expectations about the physical nature of warehouse operations, without requiring specific prior warehouse experience."
      }
    ],
    "scheduleProfile": {
      "weekends": "required",
      "earliestStart": "daytime",
      "startTiming": "immediate",
      "transport": "car_or_self"
    },
    "cvFocus": "Physical endurance, reliable attendance in previous shift-based environments, or active hobby consistency.",
    "exclusions": [
      "Excluded any screening based on prior warehouse or logistics experience to keep the role open to candidates with transferrable physical stamina and reliable habits.",
      "Excluded any testing or certificates for picking and packing."
    ]
  },
  "job_corner_co_daytime_retail": {
    "jobSummary": {
      "title": "Daytime Retail Assistant",
      "employer": "Corner and Co",
      "location": "Stoke Newington (N16)",
      "shiftPattern": "9:30am to 5:30pm, Monday to Friday",
      "payRange": "£12.30 per hour",
      "startDate": "Flexible"
    },
    "previewFacts": [
      {
        "label": "Working hours",
        "value": "You will work 9:30am to 5:30pm, Monday to Friday, with no early mornings and no weekend shifts.",
        "category": "hours",
        "sourceQuote": "Hours are 9:30am to 5:30pm, Monday to Friday, so there are no early starts and no weekends at all"
      },
      {
        "label": "Friendly pace",
        "value": "The workload has a comfortable, friendly flow with a mix of quiet times and busy spells throughout the day.",
        "category": "pace",
        "sourceQuote": "The pace is friendly rather than frantic, with quieter and busier spells across the day."
      },
      {
        "label": "Hourly pay",
        "value": "You will earn 12.30 pounds an hour, working anywhere from 20 to 38 hours a week.",
        "category": "pay",
        "sourceQuote": "12.30 pounds an hour. Part-time and full-time, 20 to 38 hours a week."
      },
      {
        "label": "Easy public transport",
        "value": "The shop is located right in the middle of Stoke Newington and is just a short walk from local bus stops.",
        "category": "location",
        "sourceQuote": "Two minutes from the high street bus stops."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work Monday to Friday, between 9:30am and 5:30pm?",
        "helpText": "This role is strictly weekday-only with no weekend or early morning shifts.",
        "options": [
          "Yes, I am available during these weekday hours",
          "No, I have other commitments during these times"
        ],
        "passValues": [
          "Yes, I am available during these weekday hours"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The shop is only open for this role during daytime weekday hours, so candidates must match this schedule."
      },
      {
        "type": "logistics",
        "prompt": "Can you easily travel to Stoke Newington (N16) for a 9:30am start?",
        "helpText": "We are located in central Stoke Newington, close to local bus routes.",
        "options": [
          "Yes, I can reliably travel there for work",
          "No, the commute is too difficult for me"
        ],
        "passValues": [
          "Yes, I can reliably travel there for work"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Ensures the candidate's commute is sustainable and won't lead to attendance issues."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We will need to check your document or share code before your first day.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Standard legal compliance for hiring in the UK."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "What makes you interested in joining a friendly high street shop like Corner and Co?",
        "helpText": "Just a short sentence is fine. We would love to hear what appeals to you about this retail role.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Gauges candidate motivation and interest in a community-facing retail environment."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Customer service experience, a friendly attitude, and reliable attendance in previous work or activities.",
    "exclusions": [
      "Prior formal retail experience requirements, as friendly customer service potential is more predictive of success than previous retail tenure."
    ]
  },
  "job_pulse_late_gym_host": {
    "jobSummary": {
      "title": "Late Shift Gym Host",
      "employer": "Pulse Fitness",
      "location": "Dalston (E8)",
      "shiftPattern": "4:00pm to 10:00pm, 18 to 30 hours a week",
      "payRange": "£12.00 per hour",
      "startDate": "Flexible (within a week or later)"
    },
    "previewFacts": [
      {
        "label": "Late shift hours",
        "value": "Shifts run from 4:00pm to 10:00pm with no early mornings.",
        "category": "hours",
        "sourceQuote": "Shifts are 4pm to 10pm, so there are no early mornings, this is an afternoon and evening role."
      },
      {
        "label": "Flexible days",
        "value": "The rota is built around your availability, so you can work weekends or avoid them.",
        "category": "hours",
        "sourceQuote": "Days are flexible across the week and we build the rota around you, so it works whether you would rather avoid weekends or only do weekends."
      },
      {
        "label": "Hourly rate",
        "value": "The position pays £12.00 per hour for 18 to 30 hours a week.",
        "category": "pay",
        "sourceQuote": "12.00 pounds an hour. Part-time, 18 to 30 hours a week."
      },
      {
        "label": "Front of house pace",
        "value": "It is a calm role focused on reception desk hosting and floor walks, without heavy lifting.",
        "category": "environment",
        "sourceQuote": "It is a calm, front-of-house job: most of it is on the desk and walking the floor, with light tidying rather than heavy lifting."
      },
      {
        "label": "Transit access",
        "value": "The gym is located right next to Dalston Junction station.",
        "category": "location",
        "sourceQuote": "Right by Dalston Junction station."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work late shifts from 4:00pm to 10:00pm?",
        "helpText": "These are the set hours for our late gym host shifts.",
        "options": [
          "Yes, I can work 4:00pm to 10:00pm",
          "No, these hours do not work for me"
        ],
        "passValues": [
          "Yes, I can work 4:00pm to 10:00pm"
        ],
        "routable": true,
        "dimension": "other",
        "rationale": "The role is specifically for late shifts from 4:00pm to 10:00pm."
      },
      {
        "type": "logistics",
        "prompt": "Can you reliably commute to and from Dalston (E8) for a 10:00pm finish?",
        "helpText": "Please ensure you have a safe and reliable way home at 10:00pm.",
        "options": [
          "Yes, I can easily travel home at 10:00pm",
          "No, getting home at that time is difficult"
        ],
        "passValues": [
          "Yes, I can easily travel home at 10:00pm"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "The gym closes at 10:00pm so candidates must have a viable route home at this hour."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We cannot offer visa sponsorship for this part-time position.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Standard compliance and right-to-work legal checks."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "What makes you a great fit to welcome members at Pulse Fitness?",
        "helpText": "Tell us about a time you helped people feel welcome, or why this calm hosting role suits you.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Saves time by letting candidates highlight their natural hospitality style and interest."
      }
    ],
    "scheduleProfile": {
      "weekends": "optional",
      "earliestStart": "late",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "hospitality, retail, front-of-house, or reception experience",
    "exclusions": [
      "Prior fitness-specific experience: excluded because a welcoming personality and reliable evening attendance are the key success drivers rather than gym certificates."
    ]
  },
  "job_bract_flexible_cafe": {
    "jobSummary": {
      "title": "Flexible Cafe Team Member",
      "employer": "Bract Coffee",
      "location": "Highbury (N5)",
      "shiftPattern": "Daytime shifts, 8:00am to 4:00pm. Weekends are optional.",
      "payRange": "£12.70 per hour plus tips",
      "startDate": "Next month"
    },
    "previewFacts": [
      {
        "label": "Competitive starting pay",
        "value": "£12.70 per hour plus tips",
        "category": "pay",
        "sourceQuote": "12.70 pounds an hour plus tips."
      },
      {
        "label": "Daytime shifts",
        "value": "Shifts run from around 8:00am to 4:00pm, meaning no late nights and no extreme early mornings.",
        "category": "hours",
        "sourceQuote": "hours are daytime, around 8am to 4pm, so no extreme early starts."
      },
      {
        "label": "Optional weekends",
        "value": "Weekend shifts are shared across the team, so you can choose to work them or opt out.",
        "category": "hours",
        "sourceQuote": "Weekends are optional here: we share weekend cover across the team and you can opt in or out"
      },
      {
        "label": "On your feet",
        "value": "You will be standing for your shift and handling some stock and deliveries.",
        "category": "physical",
        "sourceQuote": "on your feet with some lifting of stock and deliveries."
      },
      {
        "label": "Opening next month",
        "value": "This is a new cafe opening soon. We need people to start next month with paid training first.",
        "category": "environment",
        "sourceQuote": "we need people who can start from next month rather than this week, with paid training in the run-up."
      }
    ],
    "dealbreakers": [
      {
        "type": "logistics",
        "prompt": "Can you easily commute to Highbury (N5) for shifts starting around 8:00am?",
        "helpText": "We are located five minutes from Highbury and Islington station.",
        "options": [
          "Yes, I can easily commute there for an 8:00am start.",
          "No, that location or commute time does not work for me."
        ],
        "passValues": [
          "Yes, I can easily commute there for an 8:00am start."
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Candidates must be able to reach Highbury reliably by 8:00am for daytime shifts."
      },
      {
        "type": "start_date",
        "prompt": "Are you comfortable starting your role next month rather than immediately?",
        "helpText": "As we prepare to open the cafe, your paid training and shifts will begin next month.",
        "options": [
          "Yes, starting next month works well for me.",
          "No, I need to start a new job immediately this week."
        ],
        "passValues": [
          "Yes, starting next month works well for me."
        ],
        "routable": true,
        "dimension": "start_timing",
        "rationale": "The cafe is not yet open, so candidates needing immediate starts should be routed to active roles."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": "We will need to verify this with a passport or share code during your onboarding.",
        "options": [
          "Yes, I have the right to work in the UK.",
          "No, I do not have the right to work in the UK."
        ],
        "passValues": [
          "Yes, I have the right to work in the UK."
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Right to work is a mandatory legal requirement for employment."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Tell us about a time you worked as part of a busy team, in a job, school project, or volunteering. What did you enjoy about it?",
        "helpText": "We are hiring our founding cafe team, so we want to hear how you collaborate with others.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Surfaces transferable teamwork and collaboration skills in the candidate's own words without enforcing strict cafe experience requirements."
      }
    ],
    "scheduleProfile": {
      "weekends": "optional",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Customer-facing, teamwork, hospitality, or physical work experience",
    "exclusions": [
      "Prior barista or professional cafe experience: excluded because it is a poor predictor of performance and can be trained; we ask a general teamwork question instead.",
      "Physical fitness tests or lifting certifications: excluded to avoid bias, replacing with a realistic preview fact about general stocking and lifting duties."
    ]
  },
  "job_brightspaces_daytime_cleaner": {
    "jobSummary": {
      "title": "Daytime Office Cleaner",
      "employer": "Bright Spaces",
      "location": "Shoreditch (E1)",
      "shiftPattern": "Monday to Friday, 9:00am to 2:00pm",
      "payRange": "12.30 pounds an hour",
      "startDate": "Flexible"
    },
    "previewFacts": [
      {
        "label": "Daytime weekday hours",
        "value": "Work 9:00am to 2:00pm from Monday to Friday with no weekend shifts.",
        "category": "hours",
        "sourceQuote": "Hours are daytime, 9am to 2pm, Monday to Friday, with no weekends at all and no early starts."
      },
      {
        "label": "Steady pace",
        "value": "The workload involves light cleaning and restocking communal areas at a relaxed speed.",
        "category": "pace",
        "sourceQuote": "The pace is steady, not rushed"
      },
      {
        "label": "Central location",
        "value": "The workspace is a very short walk from Shoreditch High Street.",
        "category": "location",
        "sourceQuote": "The building is central and a two-minute walk from Shoreditch High Street"
      },
      {
        "label": "Pay rate",
        "value": "Earn 12.30 pounds an hour working part-time.",
        "category": "pay",
        "sourceQuote": "12.30 pounds an hour."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work 9:00am to 2:00pm, Monday to Friday?",
        "helpText": "This role requires working these exact daytime hours during the week.",
        "options": [
          "Yes, I can work 9:00am to 2:00pm, Monday to Friday",
          "No, I need different hours or weekends"
        ],
        "passValues": [
          "Yes, I can work 9:00am to 2:00pm, Monday to Friday"
        ],
        "routable": true,
        "dimension": "other",
        "rationale": "The client needs consistent cleaning during these specific co-working daytime hours."
      },
      {
        "type": "logistics",
        "prompt": "Can you easily commute to Shoreditch (E1) for a 9:00am start?",
        "helpText": "The office is located near Shoreditch High Street and is highly accessible by bus or train.",
        "options": [
          "Yes, I can easily travel there for 9:00am",
          "No, this location is too difficult for me to reach"
        ],
        "passValues": [
          "Yes, I can easily travel there for 9:00am"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Candidates must be able to reliably reach the Shoreditch building by 9:00am without transport issues."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": "We will need to check your documents before you start.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "This is a legal requirement for employment in the UK."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "What makes a daytime cleaning role at Bright Spaces a good fit for you right now?",
        "helpText": "Tell us briefly why you want this specific job and how it fits into your schedule.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Surfaces genuine intent and schedule alignment in the candidate's own words."
      },
      {
        "prompt": "Tell us about any experience you have keeping a space clean, organized, or tidy.",
        "helpText": "This could be at home, in an office, or anywhere else: no formal experience is needed.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Evaluates transferable organization skills without requiring formal cleaning credentials."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "consistent presence, reliable attendance, or hands-on organizing and tidying experience",
    "exclusions": [
      "Prior professional office cleaning experience was converted to a transferable-skill question to avoid screening out candidates with unpaid or household experience."
    ]
  },
  "job_greenline_deli_assistant": {
    "jobSummary": {
      "title": "Weekday Sandwich Shop Assistant",
      "employer": "Greenline Deli",
      "location": "Holborn (WC1)",
      "shiftPattern": "Monday to Friday, 8:30am to 3:00pm",
      "payRange": "£12.40 an hour plus a share of tips",
      "startDate": "Flexible start date"
    },
    "previewFacts": [
      {
        "label": "Weekday hours only",
        "value": "Work Monday to Friday, 8:30am to 3:00pm, with no weekends and no early morning starts.",
        "category": "hours",
        "sourceQuote": "Hours are Monday to Friday, 8:30am to 3pm, with no weekends and no very early starts."
      },
      {
        "label": "Hourly pay plus tips",
        "value": "Earn £12.40 per hour and receive an extra share of the tips.",
        "category": "pay",
        "sourceQuote": "12.40 pounds an hour plus a share of tips."
      },
      {
        "label": "Active shift environment",
        "value": "You will make sandwiches and salads, serve the regulars, run the till, and clean up.",
        "category": "environment",
        "sourceQuote": "You will make sandwiches and salads, serve customers, run the till and keep things clean and stocked."
      },
      {
        "label": "Accessible central location",
        "value": "The deli is based in Holborn, which is easy to reach by bus or train without needing a car.",
        "category": "location",
        "sourceQuote": "We are central in Holborn, a short walk from the station and easy to reach by bus, so no car is needed."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work Monday to Friday from 8:30am to 3:00pm?",
        "helpText": "These are our set daytime opening hours and we do not have evening or weekend shifts.",
        "options": [
          "Yes, I can work these exact hours",
          "No, I have other commitments during these times"
        ],
        "passValues": [
          "Yes, I can work these exact hours"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The role requires specific weekday daytime availability to cover the lunch rush."
      },
      {
        "type": "logistics",
        "prompt": "Can you reliably commute to our shop in Holborn (WC1) for an 8:30am start?",
        "helpText": "The shop is located central in Holborn, a short walk from the station and easy to reach by bus.",
        "options": [
          "Yes, I can commute to Holborn easily",
          "No, this commute is too difficult for me"
        ],
        "passValues": [
          "Yes, I can commute to Holborn easily"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Ensures the candidate has a comfortable, sustainable daily travel route to the shop."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We will need to check your passport or share code before you can begin working with us.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "This is a standard legal requirement for employment in the United Kingdom."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "What makes you a great fit for a busy, friendly sandwich shop?",
        "helpText": "Tell us about any customer-facing, hospitality, or team-based work you have done, or why you are keen to join us.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Surfaces candidate motivation and transferable customer service experience in a non-exclusionary way."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "friendly, customer-facing, or fast-paced hospitality or retail work",
    "exclusions": [
      "Prior sandwich-making experience or specific food preparation qualifications (removed to focus on trainable customer-service skills and positive attitude)"
    ]
  }
};
