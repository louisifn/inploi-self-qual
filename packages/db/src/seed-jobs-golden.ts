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
      "shiftPattern": "Part-time or full-time, 20 to 40 hours a week",
      "payRange": "£12.50 to £13.20 per hour plus a share of tips",
      "startDate": "This week"
    },
    "previewFacts": [
      {
        "label": "Intense lunch rush",
        "value": "The lunch rush from 12:00pm to 2:00pm is very fast, loud, and constantly busy.",
        "category": "pace",
        "sourceQuote": "It is loud, quick and busy, and we need a crew member who can hold their nerve when there is a queue out the door."
      },
      {
        "label": "Shift times and weekends",
        "value": "Most shifts start at 10:30am, and you will need to work most weekends.",
        "category": "hours",
        "sourceQuote": "Most shifts start at 10:30am to prep before the doors get busy, and the hardest hours are 12 to 2pm every day. We are open seven days and weekends are as busy as weekdays, so we need someone who is genuinely fine working most weekends."
      },
      {
        "label": "Physical demands",
        "value": "You will be standing for your entire shift and doing some lifting of heavy items.",
        "category": "physical",
        "sourceQuote": "You are on your feet the whole shift and there is some lifting of stock and bins."
      },
      {
        "label": "Great central location",
        "value": "The kitchen is located just a short walk from Old Street station.",
        "category": "location",
        "sourceQuote": "Two minutes from Old Street station."
      },
      {
        "label": "Pay and tips",
        "value": "Earn £12.50 to £13.20 per hour, boosted by a share of the team tips.",
        "category": "pay",
        "sourceQuote": "12.50 to 13.20 pounds an hour plus a share of tips."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you comfortable working on weekends?",
        "helpText": "We are open seven days a week and weekends are some of our busiest times.",
        "options": [
          "Yes, I can work weekends",
          "No, I need weekends off"
        ],
        "passValues": [
          "Yes, I can work weekends"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The role requires weekend availability as weekends are as busy as weekdays."
      },
      {
        "type": "logistics",
        "prompt": "Can you reliably commute to Old Street (EC1) for a 10:30am shift start?",
        "helpText": "We need our team on site on time to prepare the kitchen for the lunch rush.",
        "options": [
          "Yes, I can make that commute easily",
          "No, that commute is too difficult for me"
        ],
        "passValues": [
          "Yes, I can make that commute easily"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Candidates need to be able to commute to EC1 for the pre-lunch preparation shift."
      },
      {
        "type": "start_date",
        "prompt": "Can you start working this week?",
        "helpText": "We are looking for immediate starters who are ready to jump into training.",
        "options": [
          "Yes, I am ready to start immediately",
          "No, I need to give more notice"
        ],
        "passValues": [
          "Yes, I am ready to start immediately"
        ],
        "routable": true,
        "dimension": "start_timing",
        "rationale": "The kitchen has an urgent hiring need and expects training to start from day one this week."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": "We are unable to sponsor working visas for this role.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Right to work in the UK is a strict legal requirement for employment."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Tell us about a time you had to stay calm when things got busy, either at work, in school, or in daily life.",
        "helpText": "Describe what was happening and how you handled the pressure.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "This assesses the candidate's capacity to handle a busy environment and 'hold their nerve' without filtering out those without direct restaurant experience."
      }
    ],
    "scheduleProfile": {
      "weekends": "required",
      "earliestStart": "daytime",
      "startTiming": "immediate",
      "transport": "accessible"
    },
    "cvFocus": "Look for candidates with experience in fast-paced retail, hospitality, or other busy customer-facing roles, or those who demonstrate reliable, high-energy work histories.",
    "exclusions": [
      "Prior experience as a kitchen hand or line cook was excluded as a hard requirement because composure under pressure and reliability are the main drivers of success for this entry-level counter role."
    ]
  },
  "job_long_table_kitchen_porter": {
    "jobSummary": {
      "title": "Weekday Kitchen Porter",
      "employer": "The Long Table",
      "location": "Clerkenwell (EC1)",
      "shiftPattern": "Monday to Friday, 10:00am start to mid afternoon",
      "payRange": "£12.40 per hour",
      "startDate": "Flexible across the next few weeks"
    },
    "previewFacts": [
      {
        "label": "Weekday only shifts",
        "value": "This role is Monday to Friday only with absolutely no weekend shifts.",
        "category": "hours",
        "sourceQuote": "This is a weekday-only job, no weekends at all"
      },
      {
        "label": "Physical pot wash work",
        "value": "You will be on your feet, running the pot wash, and lifting stock and bins.",
        "category": "physical",
        "sourceQuote": "The work is physical: you are on the pot wash and washing down through a busy two-hour service, on your feet throughout, with some lifting of stock and bins."
      },
      {
        "label": "Hourly starting rate",
        "value": "The job pays £12.40 per hour, which is reviewed after three months.",
        "category": "pay",
        "sourceQuote": "12.40 pounds an hour, reviewed at three months."
      },
      {
        "label": "No early mornings",
        "value": "Shifts start at 10:00am, meaning you avoid early morning travel.",
        "category": "hours",
        "sourceQuote": "Shifts start at 10am to cover prep, then run through the lunch service to mid afternoon, so there are no early mornings either."
      },
      {
        "label": "Central location",
        "value": "The kitchen is situated a five minute walk from Farringdon station.",
        "category": "location",
        "sourceQuote": "We are a five-minute walk from Farringdon station."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you comfortable with a role that only offers weekday shifts with no weekend hours?",
        "helpText": "This role runs Monday to Friday to serve the local weekday office crowd.",
        "options": [
          "Yes, weekday only shifts suit me perfectly",
          "No, I need a job that offers weekend shifts"
        ],
        "passValues": [
          "Yes, weekday only shifts suit me perfectly"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The kitchen only operates on weekdays, so it cannot accommodate candidates seeking weekend work."
      },
      {
        "type": "logistics",
        "prompt": "Can you reliably travel to Clerkenwell (EC1) for a 10:00am start?",
        "helpText": "The kitchen is located a five minute walk from Farringdon station.",
        "options": [
          "Yes, I can reliably travel to this location",
          "No, the commute is too difficult for me"
        ],
        "passValues": [
          "Yes, I can reliably travel to this location"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Ensures the candidate has a comfortable, sustainable daily commute to Farringdon."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": "We will need to check your documents before you can start.",
        "options": [
          "Yes, I have the legal right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the legal right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Standard compliance requirement for all UK employment."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "This role involves physical, active work like running the pot wash and lifting stock. Tell us about any busy, physical work you have done before.",
        "helpText": "This does not have to be kitchen work: warehouse, cleaning, retail, or manual labor experience all count.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Allows candidates to showcase transferable physical stamina and sets realistic expectations for back of house work."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "stamina, reliability, and physical work experience like kitchen work, cleaning, warehousing, or retail stocking",
    "exclusions": [
      "We did not screen on prior kitchen porter experience or food hygiene certificates, as physical stamina and weekday availability are the true performance drivers here."
    ]
  },
  "job_northgate_evening_cleaner": {
    "jobSummary": {
      "title": "Evening Cleaner, Northgate Offices",
      "employer": "Northgate Offices",
      "location": "Angel, London (N1)",
      "shiftPattern": "Monday to Thursday (with optional Friday), 6:00pm to 9:30pm",
      "payRange": "£12.20 per hour",
      "startDate": "Flexible"
    },
    "previewFacts": [
      {
        "label": "Hourly pay",
        "value": "£12.20 per hour",
        "category": "pay",
        "sourceQuote": "12.20 pounds an hour."
      },
      {
        "label": "Evening shifts",
        "value": "Shifts run 6:00pm to 9:30pm, Monday to Thursday (with optional Friday). No weekends.",
        "category": "hours",
        "sourceQuote": "Shifts run 6pm to 9:30pm"
      },
      {
        "label": "Weekly hours",
        "value": "Part-time hours, around 14 to 18 hours per week.",
        "category": "hours",
        "sourceQuote": "Part-time, around 14 to 18 hours a week."
      },
      {
        "label": "Very accessible location",
        "value": "Located in Angel, just a short walk from the station and major bus lines.",
        "category": "location",
        "sourceQuote": "The building is two minutes from Angel station and on plenty of bus routes."
      },
      {
        "label": "Quiet work environment",
        "value": "You will work mostly independently once the office staff have gone home.",
        "category": "environment",
        "sourceQuote": "A calm, independent job once the offices empty out."
      },
      {
        "label": "Physical tasks",
        "value": "Cleaning tasks require moving between multiple floors, bending, and carrying supplies.",
        "category": "physical",
        "sourceQuote": "vacuuming, surfaces, kitchens and washrooms across a few floors, with some bending and carrying."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you able to work from 6:00pm to 9:30pm, Monday to Thursday?",
        "helpText": "These shifts run in the evening when the offices are empty.",
        "options": [
          "Yes, these evening hours work well for me",
          "No, I need daytime or weekend hours"
        ],
        "passValues": [
          "Yes, these evening hours work well for me"
        ],
        "routable": true,
        "dimension": "early_start",
        "rationale": "The role operates strictly in the evening after office hours."
      },
      {
        "type": "logistics",
        "prompt": "Can you reliably commute to Angel (N1) for a 6:00pm start?",
        "helpText": "The office building is located in the Angel area.",
        "options": [
          "Yes, I can reliably travel there for 6:00pm",
          "No, that location is too difficult for me to reach"
        ],
        "passValues": [
          "Yes, I can reliably travel there for 6:00pm"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Candidates must be able to reach the Angel location on time for the evening shift start."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": "We are required to check your right to work documents before you can start.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Right to work is a mandatory legal requirement."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Are you comfortable working independently in a quiet office building?",
        "helpText": "Most of your shift will be completed on your own once the office workers have left.",
        "inputKind": "single_select",
        "options": [
          "Yes, I enjoy working independently and can manage my own pace",
          "No, I prefer working closely with a team"
        ],
        "rationale": "The role requires high autonomy and the ability to work alone calmly without constant supervision."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "late",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "reliable, independent or evening-shift work history, showing attention to detail",
    "exclusions": [
      "Prior professional cleaning experience requirement (not a strong predictor, converted to a preference/readiness check for working independently)"
    ]
  },
  "job_maple_home_stockroom": {
    "jobSummary": {
      "title": "Stockroom Assistant",
      "employer": "Maple Home",
      "location": "Islington (N1)",
      "shiftPattern": "Daytime, roughly 9am to 5pm, weekdays with occasional Saturdays, 24 to 40 hours a week",
      "payRange": "£12.50 per hour",
      "startDate": "Early next month"
    },
    "previewFacts": [
      {
        "label": "Hourly pay",
        "value": "£12.50 per hour",
        "category": "pay",
        "sourceQuote": "12.50 pounds an hour."
      },
      {
        "label": "Daytime hours",
        "value": "Work 24 to 40 hours a week, starting roughly 9am to 5pm",
        "category": "hours",
        "sourceQuote": "Hours are daytime, roughly 9am to 5pm, so no very early starts. Days are mainly weekdays, with the occasional Saturday during the busiest weeks"
      },
      {
        "label": "Physical demands",
        "value": "Active role spent lifting boxes and standing throughout the day",
        "category": "physical",
        "sourceQuote": "You are on your feet and lifting boxes through the day"
      },
      {
        "label": "Commute location",
        "value": "Located in Islington, just 5 minutes from the station",
        "category": "location",
        "sourceQuote": "Five minutes from Highbury and Islington station."
      },
      {
        "label": "Start timing",
        "value": "Position begins early next month, not immediately",
        "category": "hours",
        "sourceQuote": "The start date is from early next month, not right away"
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you comfortable working an occasional Saturday during busy peak weeks?",
        "helpText": "While shifts are mainly on weekdays, the store needs extra support on some Saturdays during peak season.",
        "options": [
          "Yes, I can work occasional Saturdays",
          "No, I can only work Monday to Friday"
        ],
        "passValues": [
          "Yes, I can work occasional Saturdays"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The employer requires peak weekend flexibility for key retail periods."
      },
      {
        "type": "start_date",
        "prompt": "Are you able to start work from early next month?",
        "helpText": "This role is timed for our upcoming autumn refit and does not begin immediately.",
        "options": [
          "Yes, early next month works for me",
          "No, I need to start a role immediately"
        ],
        "passValues": [
          "Yes, early next month works for me"
        ],
        "routable": true,
        "dimension": "start_timing",
        "rationale": "Candidates looking for immediate cash flow may be a poor fit for a role starting next month."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We must verify your right to work documents before you can start.",
        "options": [
          "Yes, I have the right to work in the UK",
          "No, I do not"
        ],
        "passValues": [
          "Yes, I have the right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Standard legal compliance for hiring."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Tell us about any experience you have with physical, hands-on tasks, or why you are interested in a stockroom role.",
        "helpText": "This could be stocking shelves, warehousing, event setup, or any other role where you were on your feet.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Surfaces transferable active work habits and genuine interest in a stockroom role."
      }
    ],
    "scheduleProfile": {
      "weekends": "optional",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Active, physical or stock handling experience in retail, warehouses, or hands-on hospitality.",
    "exclusions": [
      "Physical fitness requirement: Screened out direct question about fitness to avoid discrimination or proxying for disability. We address this via clear, transparent tasks in the role preview facts and a voluntary transferable experience question."
    ]
  },
  "job_eastline_weekend_warehouse": {
    "jobSummary": {
      "title": "Weekend Warehouse Operative",
      "employer": "Eastline Distribution",
      "location": "Tottenham (N17)",
      "shiftPattern": "Saturday and Sunday, 8:00am to 4:00pm",
      "payRange": "£13.10 an hour",
      "startDate": "Immediate"
    },
    "previewFacts": [
      {
        "label": "Weekend hours",
        "value": "You will work 16 hours across Saturday and Sunday every weekend.",
        "category": "hours",
        "sourceQuote": "This is a weekend role: both Saturday and Sunday, every week."
      },
      {
        "label": "Physical lifting",
        "value": "The role involves active picking, packing, and loading, which requires steady lifting throughout.",
        "category": "physical",
        "sourceQuote": "The work is picking, packing and loading, and it is genuinely physical with steady lifting throughout."
      },
      {
        "label": "Getting to the warehouse",
        "value": "The distribution unit is off main bus routes, so you will need your own reliable transport.",
        "category": "location",
        "sourceQuote": "The unit sits off the main bus routes, so you will need your own reliable way of getting there"
      },
      {
        "label": "Hourly pay",
        "value": "You will earn £13.10 per hour with an additional weekend uplift.",
        "category": "pay",
        "sourceQuote": "13.10 pounds an hour with a weekend uplift."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you able to work from 8:00am to 4:00pm on both Saturday and Sunday, every single week?",
        "helpText": "This role requires consistent weekend attendance to help keep our distribution running.",
        "options": [
          "Yes, I can commit to both Saturday and Sunday shifts weekly",
          "No, I can only work weekdays or one of the weekend days"
        ],
        "passValues": [
          "Yes, I can commit to both Saturday and Sunday shifts weekly"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "The role is specifically designed to cover weekend shifts on both days."
      },
      {
        "type": "logistics",
        "prompt": "How will you travel to the Tottenham distribution unit for an 8:00am start?",
        "helpText": "The warehouse is located off the main bus routes, meaning public transport is not a viable option for these shift times.",
        "options": [
          "I have my own reliable transport, like a car, bike, or motorcycle",
          "I have a reliable carpool or private lift arranged",
          "I would need to rely on the local bus network"
        ],
        "passValues": [
          "I have my own reliable transport, like a car, bike, or motorcycle",
          "I have a reliable carpool or private lift arranged"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "The JD states the unit is off main bus routes and requires candidates to have a reliable way of getting there."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
        "helpText": "We must verify your right to work documents before you can begin your shifts.",
        "options": [
          "Yes, I have the legal right to work in the UK",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the legal right to work in the UK"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "UK right to work is a strict legal requirement for employment."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "How do you feel about working a highly physical role that involves continuous walking and heavy lifting?",
        "helpText": "You will be on your feet for the full 8 hours picking, packing, and loading goods.",
        "inputKind": "single_select",
        "options": [
          "I enjoy physical tasks and feel comfortable with continuous lifting",
          "I can manage moderate physical work but prefer lighter duties",
          "I am not comfortable with regular heavy lifting"
        ],
        "rationale": "Surfaces candidate comfort with physical labor without using formal experience as an automatic gate."
      },
      {
        "prompt": "What makes this weekend schedule a good fit for your current routine?",
        "helpText": "For example, are you balancing this with weekday studies, another part-time job, or personal commitments?",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Helps understand candidate intent, motivation, and potential retention for weekend-only shifts."
      }
    ],
    "scheduleProfile": {
      "weekends": "required",
      "earliestStart": "daytime",
      "startTiming": "immediate",
      "transport": "car_or_self"
    },
    "cvFocus": "Reliability in active, physical, or outdoor settings, including general work history, busy shifts, or hands-on tasks.",
    "exclusions": [
      "Prior warehouse experience or picking certifications, which we excluded in favor of questions about transport and physical comfort."
    ]
  },
  "job_corner_co_daytime_retail": {
    "jobSummary": {
      "title": "Daytime Retail Assistant",
      "employer": "Corner and Co",
      "location": "Stoke Newington (N16)",
      "shiftPattern": "Monday to Friday, 9:30am to 5:30pm",
      "payRange": "£12.30 an hour",
      "startDate": "Flexible"
    },
    "previewFacts": [
      {
        "label": "Shift hours",
        "value": "Shifts run from 9:30am to 5:30pm, Monday to Friday. There are no early mornings or weekend shifts.",
        "category": "hours",
        "sourceQuote": "Hours are 9:30am to 5:30pm, Monday to Friday, so there are no early starts and no weekends at all"
      },
      {
        "label": "Hourly pay rate",
        "value": "The starting wage is £12.30 per hour.",
        "category": "pay",
        "sourceQuote": "12.30 pounds an hour."
      },
      {
        "label": "Shop location",
        "value": "The shop is central, easy to reach by bus, and does not require a car commute.",
        "category": "location",
        "sourceQuote": "We are right in the centre of Stoke Newington, a short walk from plenty of homes and easy to reach by bus"
      },
      {
        "label": "Work pace",
        "value": "The environment is friendly and features a mix of quiet hours and busier rushes.",
        "category": "pace",
        "sourceQuote": "The pace is friendly rather than frantic, with quieter and busier spells across the day."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work shifts scheduled between 9:30am and 5:30pm, Monday to Friday?",
        "helpText": "This shop operates entirely during these weekday hours.",
        "options": [
          "Yes, I can work these daytime hours",
          "No, I need weekend or evening work"
        ],
        "passValues": [
          "Yes, I can work these daytime hours"
        ],
        "routable": true,
        "dimension": "weekends",
        "rationale": "Ensures the candidate matches the shop's set daytime weekday hours."
      },
      {
        "type": "logistics",
        "prompt": "Can you reliably commute to central Stoke Newington (N16) for a 9:30am start?",
        "helpText": "The shop is located just two minutes from the high street bus stops.",
        "options": [
          "Yes, I can commute there easily",
          "No, this location is too difficult for me to reach"
        ],
        "passValues": [
          "Yes, I can commute there easily"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Confirms the candidate's commute is practical since there is no customer or staff parking."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": null,
        "options": [
          "Yes, I have right to work",
          "No, I do not have right to work"
        ],
        "passValues": [
          "Yes, I have right to work"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Verifies standard employment eligibility requirements."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "What makes you a great fit for a friendly, customer-facing shop?",
        "helpText": "Tell us about any customer-facing experience you have had, or why you enjoy helping people. No retail experience is required.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Surfaces the candidate's customer service mindset and soft skills in their own words."
      }
    ],
    "scheduleProfile": {
      "weekends": "none",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Customer service, friendly hospitality, or local retail work.",
    "exclusions": [
      "Prior retail experience (excluded because the role prioritizes friendly customer communication and offers simple daytime shifts that can be trained on the job)"
    ]
  },
  "job_pulse_late_gym_host": {
    "jobSummary": {
      "title": "Late Shift Gym Host",
      "employer": "Pulse Fitness",
      "location": "Dalston (E8)",
      "shiftPattern": "Shifts 4pm to 10pm, part-time 18 to 30 hours a week",
      "payRange": "12.00 pounds an hour",
      "startDate": "Flexible start date"
    },
    "previewFacts": [
      {
        "label": "Hourly pay",
        "value": "12.00 pounds an hour",
        "category": "pay",
        "sourceQuote": "12.00 pounds an hour."
      },
      {
        "label": "Weekly hours",
        "value": "Part-time, 18 to 30 hours a week",
        "category": "hours",
        "sourceQuote": "Part-time, 18 to 30 hours a week."
      },
      {
        "label": "Late shift pattern",
        "value": "Shifts are 4pm to 10pm, so there are no early mornings",
        "category": "hours",
        "sourceQuote": "Shifts are 4pm to 10pm, so there are no early mornings, this is an afternoon and evening role."
      },
      {
        "label": "Work duties",
        "value": "Focuses on desk duties and walking the floor with light tidying",
        "category": "physical",
        "sourceQuote": "most of it is on the desk and walking the floor, with light tidying rather than heavy lifting."
      },
      {
        "label": "Gym location",
        "value": "Conveniently located right by Dalston Junction station",
        "category": "location",
        "sourceQuote": "Right by Dalston Junction station."
      }
    ],
    "dealbreakers": [
      {
        "type": "availability",
        "prompt": "Are you available to work shift patterns from 4:00pm to 10:00pm?",
        "helpText": "These late afternoon and evening shifts are the standard hours for this gym host role.",
        "options": [
          "Yes, I can work 4:00pm to 10:00pm shifts",
          "No, I need earlier shifts"
        ],
        "passValues": [
          "Yes, I can work 4:00pm to 10:00pm shifts"
        ],
        "routable": true,
        "dimension": "early_start",
        "rationale": "The role is strictly for late-shift hosting starting in the late afternoon."
      },
      {
        "type": "logistics",
        "prompt": "Can you easily commute to Dalston (E8) for late evening shifts?",
        "helpText": "The gym is right by Dalston Junction station, making it very accessible.",
        "options": [
          "Yes, I can easily travel to Dalston",
          "No, this location is difficult for me to reach late at night"
        ],
        "passValues": [
          "Yes, I can easily travel to Dalston"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Candidates need a reliable commute to complete late shifts ending at 10:00pm."
      },
      {
        "type": "start_date",
        "prompt": "When are you available to start this gym host role?",
        "helpText": "We are flexible and can accommodate an immediate start or a later date.",
        "options": [
          "I can start within the next week",
          "I can start in 2 to 4 weeks",
          "I need more than 4 weeks"
        ],
        "passValues": [
          "I can start within the next week",
          "I can start in 2 to 4 weeks"
        ],
        "routable": true,
        "dimension": "start_timing",
        "rationale": "Confirms candidate availability aligns with a reasonable startup window."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the right to work in the UK?",
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
        "rationale": "Standard legal requirement for employment in the UK."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "What makes you interested in being the face of Pulse Fitness during the late shifts?",
        "helpText": "Tell us in your own words what draws you to this gym host role.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Assesses genuine interest and motivation for front of house hosting."
      },
      {
        "prompt": "Which of these best describes your approach to welcoming members and keeping things tidy?",
        "helpText": "This role involves both welcoming people at the desk and walking the floor.",
        "inputKind": "single_select",
        "options": [
          "I enjoy being at the front desk and chatting with visitors",
          "I like keeping active on the floor and making sure spaces look tidy",
          "I am happy doing both greeting people and keeping the space organized"
        ],
        "rationale": "Surfaces the candidate's preference for the mixed nature of host duties."
      }
    ],
    "scheduleProfile": {
      "weekends": "optional",
      "earliestStart": "late",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Customer-facing, hospitality, retail, or leisure environment work",
    "exclusions": [
      "Prior fitness-related certifications or gym employment requirements: we focus entirely on customer-facing hospitality skills rather than fitness experience."
    ]
  },
  "job_bract_flexible_cafe": {
    "jobSummary": {
      "title": "Flexible Cafe Team Member",
      "employer": "Bract Coffee",
      "location": "Highbury (N5)",
      "shiftPattern": "Daytime shifts, 20 to 40 hours per week",
      "payRange": "£12.70 per hour plus tips",
      "startDate": "Next month"
    },
    "previewFacts": [
      {
        "label": "Work hours",
        "value": "Daytime shifts from around 8am to 4pm with optional weekend work.",
        "category": "hours",
        "sourceQuote": "Once we are open, hours are daytime, around 8am to 4pm, so no extreme early starts. Weekends are optional here"
      },
      {
        "label": "Hourly pay",
        "value": "Earn £12.70 per hour plus tips, with full-time or part-time options from 20 to 40 hours.",
        "category": "pay",
        "sourceQuote": "12.70 pounds an hour plus tips. Part-time and full-time, 20 to 40 hours a week."
      },
      {
        "label": "Physical pace",
        "value": "You will be on your feet during shifts and helping to lift stock and deliveries.",
        "category": "physical",
        "sourceQuote": "It is a normal cafe pace once we settle in, on your feet with some lifting of stock and deliveries."
      },
      {
        "label": "Cafe location",
        "value": "Conveniently located just a five minute walk from Highbury and Islington station.",
        "category": "location",
        "sourceQuote": "Five minutes from Highbury and Islington station."
      },
      {
        "label": "Training and start",
        "value": "Paid training begins next month ahead of opening day.",
        "category": "environment",
        "sourceQuote": "we need people who can start from next month rather than this week, with paid training in the run-up."
      }
    ],
    "dealbreakers": [
      {
        "type": "start_date",
        "prompt": "Are you able to start this role next month, including attending paid training?",
        "helpText": "Because this is a brand new cafe opening, work starts next month rather than immediately.",
        "options": [
          "Yes, starting next month works perfectly for me",
          "No, I need a job that starts immediately this week"
        ],
        "passValues": [
          "Yes, starting next month works perfectly for me"
        ],
        "routable": true,
        "dimension": "start_timing",
        "rationale": "Candidates looking for an immediate start this week will not match the opening timeline of a brand new cafe."
      },
      {
        "type": "logistics",
        "prompt": "Can you easily commute to Highbury for shifts starting at 8:00am?",
        "helpText": "The cafe is located five minutes from Highbury and Islington station.",
        "options": [
          "Yes, I can reliably commute to Highbury for an 8:00am start",
          "No, that commute or start time is too difficult for me"
        ],
        "passValues": [
          "Yes, I can reliably commute to Highbury for an 8:00am start"
        ],
        "routable": true,
        "dimension": "transport",
        "rationale": "Ensures candidates are realistic about the morning commute time and location before applying."
      },
      {
        "type": "right_to_work",
        "prompt": "Do you have the legal right to work in the UK?",
        "helpText": "We will ask to check your right to work documents before you start.",
        "options": [
          "Yes, I have the permanent right to work in the UK",
          "Yes, I have a visa with working hours restrictions",
          "No, I do not have the right to work in the UK"
        ],
        "passValues": [
          "Yes, I have the permanent right to work in the UK",
          "Yes, I have a visa with working hours restrictions"
        ],
        "routable": false,
        "dimension": "right_to_work",
        "rationale": "Legal right to work check is mandatory for hiring compliance."
      }
    ],
    "roleQuestions": [
      {
        "prompt": "Why are you interested in joining a brand new cafe as part of our founding team?",
        "helpText": "Tell us what excites you about helping us set up and open Bract Coffee.",
        "inputKind": "short_text",
        "options": null,
        "rationale": "Measures candidate intent and motivation for joining a startup cafe environment."
      }
    ],
    "scheduleProfile": {
      "weekends": "optional",
      "earliestStart": "daytime",
      "startTiming": "flexible",
      "transport": "accessible"
    },
    "cvFocus": "Reliable, customer-friendly candidates who are comfortable with light physical duties and standard daytime shifts.",
    "exclusions": [
      "Prior barista experience was excluded as a hard requirement to ensure we capture candidates with strong transferable communication and team skills."
    ]
  }
};
