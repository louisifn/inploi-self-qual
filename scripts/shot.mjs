// Headless screenshot helper for self-verifying the UI during the build.
// Usage: node scripts/shot.mjs <path> <outfile.png> [widthxheight] [waitMs]
import puppeteer from "puppeteer-core";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const path = process.argv[2] ?? "/";
const out = process.argv[3] ?? "/tmp/shot.png";
const [w, h] = (process.argv[4] ?? "430x1400").split("x").map(Number);
const waitMs = Number(process.argv[5] ?? 1400);
const base = process.env.BASE ?? "http://localhost:5173";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  userDataDir: mkdtempSync(join(tmpdir(), "shot-")),
  args: ["--no-sandbox", "--hide-scrollbars"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  if (process.env.DEMO_PASSWORD) await page.setExtraHTTPHeaders({ "x-demo-auth": process.env.DEMO_PASSWORD });
  await page.goto(base + path, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, waitMs));
  // Trailing args are button/link texts to click (each followed by a short wait).
  for (const txt of process.argv.slice(6)) {
    await page.evaluate((t) => {
      const el = [...document.querySelectorAll("button, [role=button], a")].find((e) =>
        (e.textContent || "").includes(t),
      );
      if (el) el.click();
    }, txt);
    await new Promise((r) => setTimeout(r, 2000));
  }
  await page.screenshot({ path: out, fullPage: true });
  console.log("shot:", out);
} finally {
  await browser.close();
}
