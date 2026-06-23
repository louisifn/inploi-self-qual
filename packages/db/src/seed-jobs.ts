/**
 * The varied frontline pool. Each entry is a raw prose JD (no structured criteria here on
 * purpose): at seed time the Worker feeds the prose through the SAME live generate call a
 * recruiter uses in Act 1, so every criterion, preview fact and scheduleProfile is
 * model-generated, not hardcoded. A captured golden per job (seed-jobs-golden.ts) is the
 * fallback for demo-safe mode / generation failure, so seeding never half-completes.
 *
 * The pool is deliberately varied across every routable axis, so that whichever axis a
 * candidate fails, at least one real job in the pool accommodates it (see seed-jobs.md).
 */

export type PoolJob = { id: string; prose: string };

export const POOL_JOBS: PoolJob[] = [
  {
    id: "job_stack_street_lunch_crew",
    prose: `Lunchtime Crew Member, Stack Street Kitchen
Stack Street Kitchen, Old Street (EC1)

About the role
We are a fast counter-service kitchen doing burgers and loaded fries for the Old Street lunch crowd. It is loud, quick and busy, and we need a crew member who can hold their nerve when there is a queue out the door. You would be taking orders, assembling food on the line, running the till and keeping the front clean through service.

The honest version
The job lives and dies on the lunch rush. Most shifts start at 10:30am to prep before the doors get busy, and the hardest hours are 12 to 2pm every day. We are open seven days and weekends are as busy as weekdays, so we need someone who is genuinely fine working most weekends. We need someone to start this week, training happens on the floor from day one. You are on your feet the whole shift and there is some lifting of stock and bins.

Pay and hours
12.50 to 13.20 pounds an hour plus a share of tips. Part-time and full-time, 20 to 40 hours a week. Two minutes from Old Street station. You must have the right to work in the UK.`,
  },
  {
    id: "job_long_table_kitchen_porter",
    prose: `Weekday Kitchen Porter, The Long Table
The Long Table, Clerkenwell (EC1)

About the role
We are a lunchtime kitchen serving the local office crowd Monday to Friday, and we are after a reliable kitchen porter to keep the back of house running.

The honest version
This is a weekday-only job, no weekends at all, which suits a lot of people who cannot work Saturdays or Sundays. Shifts start at 10am to cover prep, then run through the lunch service to mid afternoon, so there are no early mornings either. The work is physical: you are on the pot wash and washing down through a busy two-hour service, on your feet throughout, with some lifting of stock and bins.

Pay and hours
12.40 pounds an hour, reviewed at three months. Part-time, 15 to 30 hours a week. Start date is flexible across the next few weeks. We are a five-minute walk from Farringdon station.`,
  },
  {
    id: "job_northgate_evening_cleaner",
    prose: `Evening Cleaner, Northgate Offices
Northgate Offices, Angel (N1)

About the role
Evening cleaning role for a small, tidy office building near Angel. A calm, independent job once the offices empty out.

The honest version
Shifts run 6pm to 9:30pm, so this is ideal if you cannot do early mornings or you are fitting work around the day. Days are Monday to Thursday with the option of Friday, and there are no weekends. The work is steady rather than rushed: vacuuming, surfaces, kitchens and washrooms across a few floors, with some bending and carrying.

Pay and hours
12.20 pounds an hour. Part-time, around 14 to 18 hours a week. You can start whenever suits, within the next week or further out, we are flexible. The building is two minutes from Angel station and on plenty of bus routes. You must have the right to work in the UK.`,
  },
  {
    id: "job_maple_home_stockroom",
    prose: `Stockroom Assistant, Maple Home
Maple Home, Islington (N1)

About the role
Growing homeware shop looking for a stockroom assistant ahead of our autumn refit and the busy season that follows.

The honest version
The start date is from early next month, not right away, so this suits someone who cannot drop everything this week but can commit a little ahead. Hours are daytime, roughly 9am to 5pm, so no very early starts. Days are mainly weekdays, with the occasional Saturday during the busiest weeks rather than every weekend. You are on your feet and lifting boxes through the day, so a reasonable level of fitness matters.

Pay and hours
12.50 pounds an hour. Part-time and full-time, 24 to 40 hours a week. Starts early next month. Five minutes from Highbury and Islington station.`,
  },
  {
    id: "job_eastline_weekend_warehouse",
    prose: `Weekend Warehouse Operative, Eastline Distribution
Eastline Distribution, Tottenham (N17)

About the role
Distribution unit on the edge of town needs weekend operatives for Saturday and Sunday shifts. Great for anyone who works or studies in the week and wants solid weekend hours.

The honest version
This is a weekend role: both Saturday and Sunday, every week. Shifts are daytime, 8am to 4pm, so not an early-morning start but a full day on your feet. The work is picking, packing and loading, and it is genuinely physical with steady lifting throughout. The unit sits off the main bus routes, so you will need your own reliable way of getting there, a car, bike or lift, especially for the 8am start.

Pay and hours
13.10 pounds an hour with a weekend uplift. Part-time, 16 hours across the two days. Start as soon as your checks clear. You must have the right to work in the UK.`,
  },
  {
    id: "job_corner_co_daytime_retail",
    prose: `Daytime Retail Assistant, Corner and Co
Corner and Co, Stoke Newington (N16)

About the role
Friendly high street shop after a daytime retail assistant to serve customers and keep the shop looking its best.

The honest version
Hours are 9:30am to 5:30pm, Monday to Friday, so there are no early starts and no weekends at all, which makes this one of the easier roles to fit around life. We are right in the centre of Stoke Newington, a short walk from plenty of homes and easy to reach by bus, so getting here for half nine is straightforward without a car. The pace is friendly rather than frantic, with quieter and busier spells across the day.

Pay and hours
12.30 pounds an hour. Part-time and full-time, 20 to 38 hours a week. Start date is flexible, this week or whenever suits. Two minutes from the high street bus stops.`,
  },
  {
    id: "job_pulse_late_gym_host",
    prose: `Late Shift Gym Host, Pulse Fitness
Pulse Fitness, Dalston (E8)

About the role
Local gym looking for a host to welcome members and keep the place running smoothly on the late shift.

The honest version
Shifts are 4pm to 10pm, so there are no early mornings, this is an afternoon and evening role. Days are flexible across the week and we build the rota around you, so it works whether you would rather avoid weekends or only do weekends. It is a calm, front-of-house job: most of it is on the desk and walking the floor, with light tidying rather than heavy lifting.

Pay and hours
12.00 pounds an hour. Part-time, 18 to 30 hours a week. Happy for you to start whenever you are ready, within a week or later. Right by Dalston Junction station.`,
  },
  {
    id: "job_bract_flexible_cafe",
    prose: `Flexible Cafe Team Member, Bract Coffee
Bract Coffee, Highbury (N5)

About the role
We are opening a new cafe in a few weeks and hiring the founding team ahead of opening day.

The honest version
Because we have not opened yet, we need people who can start from next month rather than this week, with paid training in the run-up. Once we are open, hours are daytime, around 8am to 4pm, so no extreme early starts. Weekends are optional here: we share weekend cover across the team and you can opt in or out, so it suits people who cannot do weekends as well as those who want them. It is a normal cafe pace once we settle in, on your feet with some lifting of stock and deliveries.

Pay and hours
12.70 pounds an hour plus tips. Part-time and full-time, 20 to 40 hours a week. Starts from next month. Five minutes from Highbury and Islington station.`,
  },
  {
    id: "job_brightspaces_daytime_cleaner",
    prose: `Daytime Office Cleaner, Bright Spaces
Bright Spaces, Shoreditch (E1)

About the role
A relaxed daytime cleaning role keeping a friendly co-working building fresh and tidy.

The honest version
This is an easy role to fit around life. Hours are daytime, 9am to 2pm, Monday to Friday, with no weekends at all and no early starts. The pace is steady, not rushed: surfaces, kitchens, washrooms and communal areas, with light tidying and restocking. You can start whenever suits you, this week or later, we are flexible. The building is central and a two-minute walk from Shoreditch High Street, easy to reach by bus or on foot without a car.

Pay and hours
12.30 pounds an hour. Part-time, 18 to 25 hours a week. Start date is flexible.`,
  },
  {
    id: "job_greenline_deli_assistant",
    prose: `Weekday Sandwich Shop Assistant, Greenline Deli
Greenline Deli, Holborn (WC1)

About the role
Friendly lunch deli looking for a weekday assistant to make sandwiches and serve the regulars.

The honest version
A simple, sociable daytime job with no hard requirements beyond turning up ready to help. Hours are Monday to Friday, 8:30am to 3pm, with no weekends and no very early starts. You will make sandwiches and salads, serve customers, run the till and keep things clean and stocked. The start date is flexible, this week or whenever suits. We are central in Holborn, a short walk from the station and easy to reach by bus, so no car is needed.

Pay and hours
12.40 pounds an hour plus a share of tips. Part-time and full-time, 20 to 38 hours a week. Flexible start.`,
  },
];
