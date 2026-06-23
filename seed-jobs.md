# Seed jobs

Raw job descriptions for the initial pool. Each one is fed, as plain prose, through the live `POST /api/jobs/generate` call at seed time so the AI configures every requirement itself. Nothing in this file is structured criteria. There are no dealbreakers, options or pass values here on purpose: the model extracts all of that, exactly as it would for a recruiter pasting a job in Act 1.

Each job is written to the same standard as the live demo role (Maple and Crumb barista): a concrete start-time window, an explicit weekends stance, a real pay range, a transport line, a right-to-work line where relevant, and a short honest section that states the hard truths plainly. That consistency matters, because routing matches one job's failed dimension against another job's stated stance on that same dimension. Vague JDs make the generated criteria inconsistent and break routing coverage.

## How the seed should use this file

Feed only the body text under each `### N.` heading (the job description prose) to the generate call. Ignore this top section. Generate live when a key is present; if generation fails or returns a malformed job, fall back to a captured golden version of that same job so seeding never hangs or half-completes.

## Why these specific roles

The pool is deliberately varied across every routable dimension, so whenever a candidate fails one there is at least one real job that accommodates it. Job 1 is a hard role that fails most people and triggers routing. The rest are built to catch them. The live demo barista role (Maple and Crumb) sits alongside these and is the other hard, weekend-and-early role, so the two hard roles fail people on different axes rather than duplicating each other.

| If a candidate cannot do... | Real roles that accommodate it |
|---|---|
| Weekends | 2 Kitchen Porter, 3 Evening Cleaner, 4 Stockroom, 6 Daytime Retail, 7 Gym Host |
| Early starts | 2 (10am), 3 (6pm), 6 (9:30am), 7 (4pm) |
| Starting this week | 2, 4 (next month), 6, 7, 8 (hiring ahead) |
| Getting there early without transport | 3 (off peak, central), 6 (walkable, daytime), 7 (late) |
| Weekdays (can only do weekends) | 5 Weekend Warehouse |

Jobs 3 and 5 also state right to work explicitly, so the terminal, non routable dimension appears in generation too.

---

### 1. Lunchtime Crew Member, Stack Street Kitchen

Stack Street Kitchen · Old Street (EC1)

About the role
We are a fast counter-service kitchen doing burgers and loaded fries for the Old Street lunch crowd. It is loud, quick and busy, and we need a crew member who can hold their nerve when there is a queue out the door. You would be taking orders, assembling food on the line, running the till and keeping the front clean through service.

The honest version
The job lives and dies on the lunch rush. Most shifts start at 10:30am to prep before the doors get busy, and the hardest hours are 12 to 2pm every day. We are open seven days and weekends are as busy as weekdays, so we need someone who is genuinely fine working most weekends. We need someone to start this week, training happens on the floor from day one. You are on your feet the whole shift and there is some lifting of stock and bins.

What you will do
Take and assemble orders quickly on the line, run the till and card machine, keep the counter and dining area clean, restock through service, help close down at the end of the day.

Who does well here
People who stay calm and fast under pressure and are happy with weekend work. Any fast food, café or bar experience helps but is not essential. No qualifications needed.

Pay and hours
£12.50 to £13.20 an hour plus a share of tips. Part-time and full-time, 20 to 40 hours a week. Two minutes from Old Street station.

You must have the right to work in the UK.

### 2. Weekday Kitchen Porter, The Long Table

The Long Table · Clerkenwell (EC1)

About the role
We are a lunchtime kitchen serving the local office crowd Monday to Friday, and we are after a reliable kitchen porter to keep the back of house running.

The honest version
This is a weekday-only job, no weekends at all, which suits a lot of people who cannot work Saturdays or Sundays. Shifts start at 10am to cover prep, then run through the lunch service to mid afternoon, so there are no early mornings either. The work is physical: you are on the pot wash and washing down through a busy two-hour service, on your feet throughout, with some lifting of stock and bins.

What you will do
Wash down and run the pot wash, help with basic prep, keep the kitchen clean and compliant, take deliveries and put stock away.

Who does well here
Reliable people who work hard and keep a clean station. No experience or qualifications needed, we will show you how we run things.

Pay and hours
£12.40 an hour, reviewed at three months. Part-time, 15 to 30 hours a week. Start date is flexible across the next few weeks. We are a five-minute walk from Farringdon station.

### 3. Evening Cleaner, Northgate Offices

Northgate Offices · Angel (N1)

About the role
Evening cleaning role for a small, tidy office building near Angel. A calm, independent job once the offices empty out.

The honest version
Shifts run 6pm to 9:30pm, so this is ideal if you cannot do early mornings or you are fitting work around the day. Days are Monday to Thursday with the option of Friday, and there are no weekends. The work is steady rather than rushed: vacuuming, surfaces, kitchens and washrooms across a few floors, with some bending and carrying.

What you will do
Clean and reset offices, kitchens and washrooms to a checklist, empty bins, restock supplies, lock up the floor at the end.

Who does well here
Trustworthy, thorough people who are happy working on their own. No experience needed.

Pay and hours
£12.20 an hour. Part-time, around 14 to 18 hours a week. You can start whenever suits, within the next week or further out, we are flexible. The building is two minutes from Angel station and on plenty of bus routes.

You must have the right to work in the UK.

### 4. Stockroom Assistant, Maple Home

Maple Home · Islington (N1)

About the role
Growing homeware shop looking for a stockroom assistant ahead of our autumn refit and the busy season that follows.

The honest version
The start date is from early next month, not right away, so this suits someone who cannot drop everything this week but can commit a little ahead. Hours are daytime, roughly 9am to 5pm, so no very early starts. Days are mainly weekdays, with the occasional Saturday during the busiest weeks rather than every weekend. You are on your feet and lifting boxes through the day, so a reasonable level of fitness matters.

What you will do
Receive and check deliveries, organise and replenish the stockroom, price stock and move it onto the shop floor, help with stock counts.

Who does well here
Organised, practical people who are comfortable with physical work. No experience or qualifications needed.

Pay and hours
£12.50 an hour. Part-time and full-time, 24 to 40 hours a week. Starts early next month. Five minutes from Highbury and Islington station.

### 5. Weekend Warehouse Operative, Eastline Distribution

Eastline Distribution · Tottenham (N17)

About the role
Distribution unit on the edge of town needs weekend operatives for Saturday and Sunday shifts. Great for anyone who works or studies in the week and wants solid weekend hours.

The honest version
This is a weekend role: both Saturday and Sunday, every week. Shifts are daytime, 8am to 4pm, so not an early-morning start but a full day on your feet. The work is picking, packing and loading, and it is genuinely physical with steady lifting throughout. The unit sits off the main bus routes, so you will need your own reliable way of getting there, a car, bike or lift, especially for the 8am start.

What you will do
Pick and pack orders to a list, load and unload, keep the aisles and loading area clear and safe.

Who does well here
Fit, dependable people who want weekend work and can get to a site that is not on a direct bus route. No experience needed, full induction given.

Pay and hours
£13.10 an hour with a weekend uplift. Part-time, 16 hours across the two days. Start as soon as your checks clear.

You must have the right to work in the UK.

### 6. Daytime Retail Assistant, Corner and Co

Corner and Co · Stoke Newington (N16)

About the role
Friendly high street shop after a daytime retail assistant to serve customers and keep the shop looking its best.

The honest version
Hours are 9:30am to 5:30pm, Monday to Friday, so there are no early starts and no weekends at all, which makes this one of the easier roles to fit around life. We are right in the centre of Stoke Newington, a short walk from plenty of homes and easy to reach by bus, so getting here for half nine is straightforward without a car. The pace is friendly rather than frantic, with quieter and busier spells across the day.

What you will do
Serve customers and run the till, keep the shop tidy and well stocked, help with simple displays, handle returns.

Who does well here
Warm, reliable people who enjoy talking to customers. No experience needed.

Pay and hours
£12.30 an hour. Part-time and full-time, 20 to 38 hours a week. Start date is flexible, this week or whenever suits. Two minutes from the high street bus stops.

### 7. Late Shift Gym Host, Pulse Fitness

Pulse Fitness · Dalston (E8)

About the role
Local gym looking for a host to welcome members and keep the place running smoothly on the late shift.

The honest version
Shifts are 4pm to 10pm, so there are no early mornings, this is an afternoon and evening role. Days are flexible across the week and we build the rota around you, so it works whether you would rather avoid weekends or only do weekends. It is a calm, front-of-house job: most of it is on the desk and walking the floor, with light tidying rather than heavy lifting.

What you will do
Welcome and sign in members, answer questions and handle the desk, keep the gym floor tidy and re-rack weights, lock up at the end of the night.

Who does well here
Friendly, calm people who are good with members. A friendly manner matters more than gym experience, and no qualifications are needed.

Pay and hours
£12.00 an hour. Part-time, 18 to 30 hours a week. Happy for you to start whenever you are ready, within a week or later. Right by Dalston Junction station.

### 8. Flexible Cafe Team Member, Bract Coffee

Bract Coffee · Highbury (N5)

About the role
We are opening a new café in a few weeks and hiring the founding team ahead of opening day.

The honest version
Because we have not opened yet, we need people who can start from next month rather than this week, with paid training in the run-up. Once we are open, hours are daytime, around 8am to 4pm, so no extreme early starts. Weekends are optional here: we share weekend cover across the team and you can opt in or out, so it suits people who cannot do weekends as well as those who want them. It is a normal café pace once we settle in, on your feet with some lifting of stock and deliveries.

What you will do
Make espresso drinks (full training given), serve food and run the till, keep the café clean and stocked, help set up and close.

Who does well here
Warm, reliable people who want to be part of building something from the start. No experience required, we train everyone from scratch.

Pay and hours
£12.70 an hour plus tips. Part-time and full-time, 20 to 40 hours a week. Starts from next month. Five minutes from Highbury and Islington station.
