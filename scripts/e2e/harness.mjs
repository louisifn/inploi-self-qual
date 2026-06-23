// Minimal E2E harness: drives the real system Chrome via CDP (puppeteer-core),
// with robust text-based waits, assertions, and screenshot artifacts.
import puppeteer from "puppeteer-core";
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const BASE = process.env.BASE ?? "http://localhost:5173";
export const ART = "/tmp/e2e";
mkdirSync(ART, { recursive: true });

export async function launch() {
  return puppeteer.launch({
    executablePath: CHROME,
    headless: "shell",
    userDataDir: mkdtempSync(join(tmpdir(), "e2e-")),
    args: ["--no-sandbox", "--hide-scrollbars"],
  });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── result tracking ────────────────────────────────────────────────────────────────
const results = [];
export function ok(name) {
  results.push({ name, pass: true });
  console.log(`  \x1b[32m✓\x1b[0m ${name}`);
}
export function fail(name, detail) {
  results.push({ name, pass: false, detail });
  console.log(`  \x1b[31m✗ ${name}\x1b[0m${detail ? `\n      → ${detail}` : ""}`);
}
export function assert(name, cond, detail) {
  if (cond) ok(name);
  else fail(name, detail);
  return cond;
}
export function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}
export function summary() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${"─".repeat(48)}`);
  console.log(`  ${passed}/${results.length} passed${failed.length ? `, \x1b[31m${failed.length} failed\x1b[0m` : ""}`);
  if (failed.length) {
    console.log("\n  Failures:");
    for (const f of failed) console.log(`   - ${f.name}${f.detail ? `: ${f.detail}` : ""}`);
  }
  console.log(`  Artifacts: ${ART}`);
  return failed.length === 0;
}

// ── page helpers ───────────────────────────────────────────────────────────────────
export async function newPage(browser, w = 440, h = 1600) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  // When the deployed demo is gated, carry the access code on every request (incl. the SPA's
  // own /api/* fetches) so the gate lets us straight through.
  if (process.env.DEMO_PASSWORD) await page.setExtraHTTPHeaders({ "x-demo-auth": process.env.DEMO_PASSWORD });
  return page;
}

export async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}

export async function waitForText(page, txt, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const has = await page.evaluate((t) => document.body.innerText.includes(t), txt);
    if (has) return true;
    await sleep(60);
  }
  throw new Error(`timeout waiting for text: "${txt}"`);
}

export async function hasText(page, txt) {
  return page.evaluate((t) => document.body.innerText.includes(t), txt);
}

export async function clickText(page, txt, { exact = false, timeout = 10000 } = {}) {
  await waitForText(page, txt, timeout);
  const clicked = await page.evaluate(
    (t, ex) => {
      const els = [...document.querySelectorAll("button, [role=button], a")];
      const el = els.find((e) => {
        const c = (e.textContent || "").replace(/\s+/g, " ").trim();
        return ex ? c === t : c.includes(t);
      });
      if (el) {
        el.scrollIntoView({ block: "center" });
        el.click();
        return true;
      }
      return false;
    },
    txt,
    exact,
  );
  if (!clicked) throw new Error(`could not click element containing: "${txt}"`);
  await sleep(120);
}

export async function typeSel(page, selector, text) {
  await page.waitForSelector(selector, { timeout: 8000 });
  await page.click(selector);
  await page.type(selector, text);
}

export async function typeByPlaceholder(page, fragment, text) {
  const sel = await page.evaluateHandle((f) => {
    const tas = [...document.querySelectorAll("textarea, input")];
    return tas.find((t) => (t.getAttribute("placeholder") || "").includes(f)) ?? null;
  }, fragment);
  const el = sel.asElement();
  if (!el) throw new Error(`no field with placeholder containing "${fragment}"`);
  await el.click();
  await el.type(text);
}

export async function typeLastTextarea(page, text) {
  const tas = await page.$$("textarea");
  if (!tas.length) throw new Error("no textarea found");
  const last = tas[tas.length - 1];
  await last.click();
  await last.type(text);
}

export async function shot(page, name) {
  await page.screenshot({ path: join(ART, `${name}.png`), fullPage: true });
}

// ── API helpers (run against the same dev server) ─────────────────────────────────────
export async function api(method, path, body) {
  const headers = { "content-type": "application/json" };
  if (process.env.DEMO_PASSWORD) headers["x-demo-auth"] = process.env.DEMO_PASSWORD;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}
