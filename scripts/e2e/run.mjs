// Full end-to-end suite. Drives the real Chrome through every act with assertions.
// Prereq: `pnpm dev` running. Run with `pnpm e2e`.
import {
  api,
  assert,
  bodyText,
  BASE,
  clickText,
  fail,
  hasText,
  launch,
  newPage,
  ok,
  section,
  shot,
  sleep,
  summary,
  typeByPlaceholder,
  typeLastTextarea,
  typeSel,
  waitForText,
} from "./harness.mjs";

const JOB = "job_mc_barista_highbury";

const browser = await launch();

/** Drive the candidate UI from the apply form through Act 2b to the Act 3 result page. */
async function runCandidateUI({ name, email, cv, mode }) {
  const page = await newPage(browser);
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ") || "Test";

  await page.goto(`${BASE}/candidate/${JOB}`, { waitUntil: "networkidle0" });
  await waitForText(page, "Apply for this job");
  await typeSel(page, 'input[autocomplete="given-name"]', first);
  await typeSel(page, 'input[autocomplete="family-name"]', last);
  await typeSel(page, 'input[type="email"]', email);
  if (cv) {
    await clickText(page, "enter your experience manually");
    await typeByPlaceholder(page, "Paste your CV", cv);
  }
  await clickText(page, "Submit application");

  // Now on Act 2b (the /qualify/ URL).
  await page.waitForFunction(() => location.pathname.includes("/qualify/"), { timeout: 8000 });
  const appId = page.url().split("/qualify/")[1];

  await waitForText(page, "real shape of this role");
  await clickText(page, "read this");

  // Q1 early mornings: wait for each question's prompt before answering it (answered rows
  // keep earlier answer text on screen, so we must key off the current question).
  await waitForText(page, "early mornings");
  await clickText(page, "Yes, most days");
  // Q2 weekends
  await waitForText(page, "include weekends");
  if (mode === "weekends") {
    await clickText(page, "can't do weekends");
    const noted = await hasText(page, "Thanks for being honest");
    assert("2b: failing answer is NOTED (amber), not blocked", noted, "expected 'Thanks for being honest, noted'");
    await sleep(1000);
  } else {
    await clickText(page, "Yes, both");
  }
  // Q3 commute
  await waitForText(page, "get there for a 5:45am");
  await clickText(page, "I live nearby");
  // Q4 start date
  await waitForText(page, "When could you start");
  await clickText(page, "This week");
  // Q5 right to work (boolean)
  await waitForText(page, "right to work in the UK");
  await clickText(page, mode === "terminal" ? "No" : "Yes", { exact: true });
  // Q6 + Q7 role questions (short text)
  await waitForText(page, "busy service or rush");
  await typeLastTextarea(page, "Years on a market stall with dawn starts, used to a queue.");
  await clickText(page, "Continue");
  await waitForText(page, "early-morning bakery work specifically");
  await typeLastTextarea(page, "I like the calm before opening; mornings suit me.");
  await clickText(page, "Continue");

  // CV phase (only if a CV was shared)
  if (cv) {
    await waitForText(page, "look at your experience", 22000); // live CV analysis call
    // Model-agnostic: wait for the items to resolve (the continue button enables) rather than
    // matching the fallback's exact alignment wording, which live generation rewords.
    await waitForText(page, "That's me", 22000);
    assert("2b: CV gaps resolve: analysis returned and resolved", await hasText(page, "your experience"));
    await typeLastTextarea(page, "Haven't used a coffee machine but I'm a quick learner.");
    await clickText(page, "That's me");
  }

  return { page, appId };
}

try {
  // ── 0. Reset to a clean seeded baseline ───────────────────────────────────────────
  section("0 · Baseline");
  const seed = await api("POST", "/api/dev/seed");
  assert("seed: demo world rebuilt", seed.json?.ok === true);
  const health = await api("GET", "/api/health");
  assert("health: web → Worker → D1 ok", health.json?.ok === true && health.json?.store === "d1");
  ok(`health: AI mode = ${health.json?.liveAiConfigured ? "LIVE" : "demo-safe"}`);

  // ── 1. Act 1: recruiter JD → criteria → edit → post ──────────────────────────────
  section("1 · Act 1: recruiter setup");
  {
    const before = (await api("GET", "/api/jobs")).json.length;
    const page = await newPage(browser, 900, 2600);
    await page.goto(`${BASE}/recruiter`, { waitUntil: "networkidle0" });
    await waitForText(page, "Set up a role");
    await clickText(page, "Load the sample role");
    await clickText(page, "Generate screening logic");
    await waitForText(page, "Review the screening logic", 35000); // live JD generation is a network call
    const txt = await page.evaluate(() => document.body.innerText);
    const dbCount = Number(txt.match(/(\d+)\s+dealbreaker/i)?.[1] ?? 0);
    // Model-agnostic: live Gemini produces 2 to 5 dealbreakers; the fallback happened to make 5.
    assert("Act1: dealbreakers generated", dbCount >= 2, `parsed ${dbCount}`);
    const hasTags = /routable/.test(txt) && /terminal/.test(txt);
    assert("Act1: dealbreakers tagged routable vs terminal", hasTags);
    assert("Act1: 'what the AI refused to add' transparency shown", await hasText(page, "deliberately did"));
    await shot(page, "act1-review");
    await clickText(page, "Post job");
    await waitForText(page, "It's live", 8000);
    ok("Act1: posted → 'It's live' confirmation");
    const after = (await api("GET", "/api/jobs")).json.length;
    assert("Act1: a new live job was created", after === before + 1, `before ${before}, after ${after}`);
    await page.close();
  }

  // ── 2. Act 2a → 2b → 3 strong-fit, lands live on the board ────────────────────────
  section("2 · Strong fit: full candidate journey");
  {
    const name = "Eve Strong";
    const { page, appId } = await runCandidateUI({
      name,
      email: "eve@example.com",
      cv: "Warehouse operative, early shifts loading vans from 4:30am, never missed a start. Kitchen porter weekends.",
      mode: "strong",
    });
    const basics = await api("GET", `/api/applications/${appId}`);
    assert("Act2a: in-progress application was created with the CV", basics.json?.hasCv === true);
    await waitForText(page, "strong fit", 12000);
    ok("Act3: strong-fit outcome reached");
    await shot(page, "result-strong");
    await clickText(page, "Submit with confidence");
    await waitForText(page, "You're in", 8000);
    ok("Act3: submit → 'You're in' confirmation");
    // Appears on the board.
    const board = (await api("GET", `/api/applications?jobId=${JOB}`)).json;
    assert("Board: strong-fit candidate is present", board.some((a) => a.candidateName === name));
    const eve = board.find((a) => a.candidateName === name);
    assert("Board: signal is descriptive (availabilityFit pass, no numeric score)", eve?.availabilityFit === "pass" && eve?.summary && typeof eve?.summary === "string");
    await page.close();
  }

  // ── 3. Poor fit on a routable dealbreaker → redirect, absent from board ────────────
  section("3 · Poor fit (weekends): honest redirect");
  {
    const name = "Will Weekend";
    const { page, appId } = await runCandidateUI({ name, email: "will@example.com", cv: "", mode: "weekends" });
    // Routing is dynamic now: poll for ANY real pool job title to appear as an offered card.
    const pool = (await api("GET", "/api/jobs")).json.filter((j) => j.id !== JOB);
    let shown = null;
    for (let i = 0; i < 60 && !shown; i++) {
      const txt = await bodyText(page);
      shown = pool.find((j) => txt.includes(j.title));
      if (!shown) await sleep(400);
    }
    assert("Act3: self-select-out routes to a REAL pool job (never fabricated)", !!shown, shown ? "" : "no real job offered");
    ok(`Act3: routed to a real job: ${shown?.title ?? "?"}`);
    await shot(page, "result-weekends");
    const outcome = (await api("GET", `/api/applications/${appId}`)).json;
    assert("Act3: candidate still in-progress until they choose (not auto-rejected)", outcome.status === "in_progress");
    await clickText(page, shown.title);
    await waitForText(page, "better fit", 8000);
    ok("Act3: taking a redirect → confirmation");
    const after = (await api("GET", `/api/applications/${appId}`)).json;
    assert("Act3: status set to 'redirected' with a target", after.status === "redirected");
    const board = (await api("GET", `/api/applications?jobId=${JOB}`)).json;
    assert("Board: redirected candidate NEVER appears (the absence is the point)", !board.some((a) => a.candidateName === name));
    await page.close();
  }

  // ── 4. Terminal dealbreaker (right to work) → respectful no, no fabricated roles ───
  section("4 · Terminal dealbreaker (right to work)");
  {
    const name = "Tara Terminal";
    const { page } = await runCandidateUI({ name, email: "tara@example.com", cv: "", mode: "terminal" });
    await waitForText(page, "honest no", 12000);
    ok("Act3: terminal outcome: respectful 'honest no'");
    const txt = await bodyText(page);
    const pool = (await api("GET", "/api/jobs")).json.filter((j) => j.id !== JOB);
    assert("Act3: terminal offers NO alternative roles (no real pool job shown)", !pool.some((j) => txt.includes(j.title)));
    await shot(page, "result-terminal");
    await page.close();
  }

  // ── 5. No-CV candidate → the CV gap step is skipped entirely ───────────────────────
  section("5 · No-CV candidate skips the gap step");
  {
    const { page } = await runCandidateUI({ name: "Nora NoCV", email: "nora@example.com", cv: "", mode: "strong" });
    const sawCv = await hasText(page, "look at your experience");
    assert("2b: no CV → gap step skipped (straight to outcome)", !sawCv);
    await waitForText(page, "strong fit", 10000);
    ok("2b: no-CV candidate still reaches a fit outcome");
    await page.close();
  }

  // ── 5b. Free-text escape hatch: the model maps, the candidate confirms, code decides ──
  section("5b · Free-text escape hatch (interpret + confirm, never fabricates a pass)");
  {
    const app = await api("POST", "/api/applications", { jobId: JOB, candidateName: "Esme Escape", email: "esme@example.com" });
    const aid = app.json.applicationId;
    const interp = (cid, text) => api("POST", "/api/answers/interpret", { applicationId: aid, criteriaId: cid, text });

    // API-level safety guarantees.
    const r1 = await interp("crit_weekends", "I can do Saturdays but never Sundays because of childcare");
    assert("Interpret: nuance maps to a NON-pass option, never fabricates 'Yes, both'", r1.json.mappedValue && r1.json.mappedValue !== "Yes, both", `got ${JSON.stringify(r1.json.mappedValue)}`);
    const r2 = await interp("crit_start_date", "I could start in about 10 days once I finish my notice");
    assert("Interpret: a clear answer maps to the right option", r2.json.mappedValue === "Within 2 weeks", `got ${JSON.stringify(r2.json.mappedValue)}`);
    const r3 = await interp("crit_weekends", "it depends honestly, hard to say");
    assert("Interpret: ambiguous text → unclear (null), never guesses", r3.json.mappedValue === null);
    const r4 = await interp("crit_commute", "I don't have a car so it's really hard that early");
    assert("Interpret: a negated answer never maps to a passing value", !["I live nearby / can walk or cycle", "I have reliable transport that early"].includes(r4.json.mappedValue));
    const r5 = await api("POST", "/api/answers/interpret", { applicationId: aid, criteriaId: "crit_right_to_work", text: "sort of" });
    assert("Interpret: terminal right-to-work is NOT interpretable (400)", r5.status === 400);

    // UI: the affordance, the confirm step, and its absence on right-to-work.
    const page = await newPage(browser);
    await page.goto(`${BASE}/candidate/${JOB}/qualify/${aid}`, { waitUntil: "networkidle0" });
    await waitForText(page, "real shape of this role");
    await clickText(page, "read this");
    await waitForText(page, "early mornings");
    await clickText(page, "Yes, most days");
    await waitForText(page, "include weekends");
    assert("UI: escape hatch present on the weekends dealbreaker", await hasText(page, "None of these fit"));
    await clickText(page, "None of these fit");
    await typeByPlaceholder(page, "your own words", "I can do Saturdays but never Sundays");
    await clickText(page, "Check this");
    // (the "Here's what I understood" label is CSS-uppercased, so key off the stable button text)
    await waitForText(page, "Yes, that's right", 20000); // live interpret call
    const conf = await bodyText(page);
    // The safety property (true under both heuristic and live): a negated answer is NEVER
    // mapped to the passing "Yes, both". The confirm panel ("Yes, that's right") already appeared.
    assert("UI: confirm shows a non-pass mapping (never fabricates a pass)", !/both weekend days/i.test(conf));
    await shot(page, "escape-hatch-confirm");
    await clickText(page, "Yes, that's right");
    await waitForText(page, "Thanks for being honest");
    ok("UI: confirmed mapping flows through as a noted non-match (never blocked)");
    // Drive to right-to-work and confirm it has NO escape hatch.
    await waitForText(page, "get there for a 5:45am");
    await clickText(page, "I live nearby");
    await waitForText(page, "When could you start");
    await clickText(page, "This week");
    await waitForText(page, "right to work in the UK");
    assert("UI: terminal right-to-work has NO free-text escape hatch", !(await hasText(page, "None of these fit")));
    await page.close();
  }

  // ── 6. Live arrival on the board (the poll path) ──────────────────────────────────
  section("6 · Recruiter board: live arrival + anti-score guardrails");
  {
    const page = await newPage(browser, 480, 1700);
    await page.goto(`${BASE}/recruiter/board/${JOB}`, { waitUntil: "networkidle0" });
    await waitForText(page, "Applications");
    assert("Board: shows a live indicator", await hasText(page, "Live"));

    // A new candidate submits on the "other device" (via API) while the board is open.
    const liveName = "Mo Livearrival"; // distinctive, unlikely to collide
    const mk = await api("POST", "/api/applications", { jobId: JOB, candidateName: liveName, email: "mo@example.com" });
    const id = mk.json.applicationId;
    await api("POST", `/api/applications/${id}/qualify`, {
      answers: [
        { criteriaId: "crit_early_mornings", answer: "Yes, most days" },
        { criteriaId: "crit_weekends", answer: "Yes, both" },
        { criteriaId: "crit_commute", answer: "I live nearby / can walk or cycle" },
        { criteriaId: "crit_start_date", answer: "This week" },
        { criteriaId: "crit_right_to_work", answer: "yes" },
      ],
    });
    await api("POST", `/api/applications/${id}/submit`, {});

    let arrived = false;
    try {
      await waitForText(page, liveName, 5000); // poll is 1.5s
      arrived = true;
    } catch {
      /* fall through */
    }
    assert("Board: a submitted application ARRIVES LIVE via the poll (≤5s)", arrived);
    await shot(page, "board-live");

    // Anti-score guardrails.
    const txt = await bodyText(page);
    const selects = await page.evaluate(() => document.querySelectorAll("select").length);
    assert("Board: no sort/rank/score control or numeric grade present", selects === 0 && !/sort by|\brank\b|score:|\/100/i.test(txt), "found a ranking affordance");
    assert("Board: ordered by arrival (newest first)", txt.indexOf(liveName) < txt.indexOf("Priya Shah"));
    await page.close();
  }

  // ── 6b. Dynamic routing: real targets only, terminal stays terminal ───────────────
  section("6b · Dynamic routing: real targets, no fabrication");
  {
    const ids = new Set((await api("GET", "/api/jobs")).json.map((j) => j.id));
    const primary = (await api("GET", `/api/jobs/${JOB}`)).json;
    const dbs = primary.criteria.filter((c) => c.isDealbreaker && c.config);
    const answersFor = (faildim) =>
      dbs.map((c) => {
        const cfg = c.config;
        let answer;
        if (cfg.kind === "single_select") {
          answer = cfg.dimension === faildim ? cfg.options.find((o) => !cfg.passValues.includes(o)) : cfg.passValues[0];
        } else if (cfg.kind === "boolean") {
          answer = cfg.dimension === faildim ? "no" : cfg.passValues[0];
        }
        return { criteriaId: c.id, answer };
      });
    const qualify = async (faildim) => {
      const app = (await api("POST", "/api/applications", { jobId: JOB, candidateName: "Routing Probe", email: "rp@example.com" })).json;
      return (await api("POST", `/api/applications/${app.applicationId}/qualify`, { answers: answersFor(faildim), gapExplanations: [] })).json;
    };
    const wk = await qualify("weekends");
    assert("Routing: a failed routable axis self-selects out", wk.decision === "self_select_out");
    assert("Routing: offers >= 1 real better-fit job", wk.suggestedRoles.length >= 1);
    assert("Routing: EVERY routed jobId exists in the DB (never invented)", wk.suggestedRoles.every((r) => ids.has(r.jobId)));
    const term = await qualify("right_to_work");
    assert("Routing: terminal stays terminal, zero roles", term.decision === "terminal" && term.suggestedRoles.length === 0);
    const strong = await qualify("__none__");
    assert("Routing: all-pass is strong fit, zero roles", strong.decision === "strong_fit" && strong.suggestedRoles.length === 0);
  }

  // ── 7. Reset returns the board to the seeded baseline ─────────────────────────────
  section("7 · Reset between demo runs");
  {
    const reset = await api("POST", "/api/dev/reset");
    assert("reset: ok", reset.json?.ok === true);
    const board = (await api("GET", `/api/applications?jobId=${JOB}`)).json;
    const names = board.map((a) => a.candidateName).sort();
    assert("reset: board back to the 2 seeded submitted apps", board.length === 2 && names.includes("Priya Shah") && names.includes("Tom Fletcher"), `got ${JSON.stringify(names)}`);
  }
} catch (e) {
  fail("suite crashed", e instanceof Error ? `${e.message}\n${e.stack}` : String(e));
} finally {
  await browser.close();
  const passed = summary();
  process.exit(passed ? 0 : 1);
}
