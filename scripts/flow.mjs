// Drives the candidate self-qualification flow and screenshots each phase.
// Usage: node scripts/flow.mjs <jobId> <appId> <mode: strong|weekends>
import puppeteer from "puppeteer-core";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [jobId, appId, mode = "strong"] = process.argv.slice(2);
const base = process.env.BASE ?? "http://localhost:5173";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  userDataDir: mkdtempSync(join(tmpdir(), "flow-")),
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 440, height: 1600, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(txt, exact = false) {
  const ok = await page.evaluate(
    (t, ex) => {
      const els = [...document.querySelectorAll("button, [role=button], a")];
      const el = els.find((e) => {
        const c = (e.textContent || "").trim();
        return ex ? c === t : c.includes(t);
      });
      if (el) {
        el.click();
        return true;
      }
      return false;
    },
    txt,
    exact,
  );
  return ok;
}
async function typeLastTextarea(text) {
  const tas = await page.$$("textarea");
  if (tas.length) {
    await tas[tas.length - 1].click();
    await tas[tas.length - 1].type(text);
  }
}
async function shot(name) {
  await page.screenshot({ path: `/tmp/2b-${mode}-${name}.png`, fullPage: true });
  console.log("shot:", `/tmp/2b-${mode}-${name}.png`);
}

await page.goto(`${base}/candidate/${jobId}/qualify/${appId}`, { waitUntil: "networkidle0" });
await wait(1500);
await clickText("read this");
await wait(900);
await shot("questions-1");

// Q1 early mornings
await clickText("Yes, most days");
await wait(1100);
// Q2 weekends
if (mode === "weekends") {
  await clickText("can't do weekends");
  await wait(380);
  await shot("noted");
  await wait(900);
} else {
  await clickText("Yes, both");
  await wait(1100);
}
// Q3 commute
await clickText("I live nearby");
await wait(1100);
await shot("questions-2");
// Q4 start date
await clickText("This week");
await wait(1100);
// Q5 right to work (boolean)
await clickText(mode === "terminal" ? "No" : "Yes", true);
await wait(1100);
// Q6 busy service (short text)
await typeLastTextarea("Two years at Pret on the opening shift: used to a 6am queue.");
await clickText("Continue");
await wait(900);
// Q7 why mornings (short text)
await typeLastTextarea("I genuinely like the calm before opening and the rhythm of the morning.");
await clickText("Continue");
await wait(1800);
// CV phase. Let gaps resolve
await wait(3200);
await shot("cv");
await typeLastTextarea("I haven't used a coffee machine but I'm a quick learner and keen.");
await wait(300);
await clickText("That's me");
await wait(2600);
await shot("result");

// Finalize → the "done" state.
if (mode === "strong") {
  await clickText("Submit with confidence");
  await wait(1500);
  await shot("done");
} else if (mode === "weekends") {
  await clickText("Weekday Kitchen");
  await wait(1500);
  await shot("done");
}

await browser.close();
