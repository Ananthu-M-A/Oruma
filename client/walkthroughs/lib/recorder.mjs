// Records a scripted walkthrough of the site as a silent video, with a caption
// band, a visible cursor and title cards, and logs when each narration line
// starts so compose.mjs can add the voice at the right moments.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const STAGE_WIDTH = 1280;
const SITE_HEIGHT = 720;
const CAPTION_HEIGHT = 96;
const PORT = 4180;
const SITE_ORIGIN = `http://127.0.0.1:${PORT}`;
const STAGE_URL = `${SITE_ORIGIN}/__walkthrough_stage`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stageHtml = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:${STAGE_WIDTH}px;height:${SITE_HEIGHT + CAPTION_HEIGHT}px;overflow:hidden;background:#064F4B;font-family:Inter,system-ui,sans-serif}
  #site{position:absolute;left:0;top:0;width:${STAGE_WIDTH}px;height:${SITE_HEIGHT}px;border:0;background:#fff}
  #band{position:absolute;left:0;top:${SITE_HEIGHT}px;width:100%;height:${CAPTION_HEIGHT}px;display:flex;align-items:center;gap:20px;padding:0 32px;box-sizing:border-box;color:#fff}
  #step{flex:none;min-width:44px;height:44px;border-radius:999px;background:#B7C8A3;color:#064F4B;font-weight:800;font-size:18px;display:flex;align-items:center;justify-content:center;padding:0 12px;box-sizing:border-box}
  #caption{font-size:22px;font-weight:700;line-height:1.35}
  #brand{margin-left:auto;flex:none;font-size:14px;font-weight:700;opacity:.7;text-align:right}
  #cursor{position:absolute;left:640px;top:360px;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:rgba(255,196,0,.45);border:3px solid #F5A400;box-shadow:0 2px 10px rgba(0,0,0,.3);transition:left .7s ease,top .7s ease;z-index:10;pointer-events:none}
  #cursor.click{animation:click .45s ease}
  @keyframes click{50%{transform:scale(.6);background:rgba(245,164,0,.9)}}
  #ring{position:absolute;border:4px solid #F5A400;border-radius:14px;box-shadow:0 0 0 4px rgba(245,164,0,.25);opacity:0;transition:opacity .3s;z-index:9;pointer-events:none}
  #card{position:absolute;inset:0;z-index:20;background:#064F4B;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:0;transition:opacity .5s;pointer-events:none;padding:0 120px;box-sizing:border-box}
  #card.show{opacity:1}
  #card .kicker{font-size:20px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#B7C8A3}
  #card h1{font-size:56px;margin:18px 0 0;line-height:1.15}
  #card p{font-size:24px;font-weight:500;opacity:.85;margin:22px 0 0;line-height:1.5}
  #card .note{position:absolute;bottom:40px;font-size:16px;opacity:.6}
</style></head>
<body>
  <iframe id="site" src="about:blank"></iframe>
  <div id="band"><div id="step"></div><div id="caption"></div><div id="brand">oruma.me<br>Sample data</div></div>
  <div id="ring"></div>
  <div id="cursor"></div>
  <div id="card"></div>
</body></html>`;

/** Reads a WAV file's duration in milliseconds from its header. */
export function wavDurationMs(file) {
  const buffer = fs.readFileSync(file);
  let byteRate = 0;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "fmt ") byteRate = buffer.readUInt32LE(offset + 16);
    if (id === "data" && byteRate) return Math.round((size / byteRate) * 1000);
    offset += 8 + size + (size % 2);
  }
  throw new Error(`Unreadable WAV file: ${file}`);
}

async function startSite() {
  // Same isolation as the browser tests: a fake API and no analytics.
  process.env.VITE_API_URL = "/api";
  process.env.VITE_GTM_ID = "";
  process.env.VITE_GA_MEASUREMENT_ID = "";
  process.env.VITE_PAYMENT_BYPASS_ENABLED = "false";
  const server = await createServer({
    logLevel: "warn",
    server: {
      host: "127.0.0.1",
      port: PORT,
      strictPort: true,
      watch: { ignored: ["**/walkthroughs/**"] },
    },
  });
  await server.listen();
  return server;
}

/**
 * Runs `script` and records it.
 * @param {object} options
 * @param {string} options.outDir   Folder for the silent video and timeline.
 * @param {(ctx: object) => Promise<void>} options.script
 * @param {(context: import('@playwright/test').BrowserContext) => Promise<void>} options.prepare
 * @param {Record<string, number>} options.durations  Narration length per line id.
 */
export async function record({ outDir, script, prepare, durations }) {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startSite();
  const browser = await chromium.launch({
    channel: process.env.WALKTHROUGH_BROWSER_CHANNEL || undefined,
  });
  const context = await browser.newContext({
    viewport: { width: STAGE_WIDTH, height: SITE_HEIGHT + CAPTION_HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outDir,
      size: { width: STAGE_WIDTH, height: SITE_HEIGHT + CAPTION_HEIGHT },
    },
  });
  await context.route(STAGE_URL, (route) =>
    route.fulfill({ contentType: "text/html", body: stageHtml }),
  );
  await prepare(context);

  const page = await context.newPage();
  const startedAt = Date.now();
  const timeline = [];
  await page.goto(STAGE_URL);
  const frame = page.frameLocator("#site");
  const siteFrame = () =>
    page.frames().find(
      (item) => item !== page.mainFrame() && item.url().startsWith(SITE_ORIGIN),
    );

  const ctx = {
    page,
    frame,
    site: siteFrame,
    sleep,

    /** Loads a site path inside the frame. */
    async open(sitePath) {
      await page.evaluate(
        (src) => (document.getElementById("site").src = src),
        `${SITE_ORIGIN}${sitePath}`,
      );
      await page.waitForFunction(() => {
        try {
          const doc = document.getElementById("site").contentDocument;
          return doc && doc.readyState === "complete" && doc.querySelector("main, #root > *");
        } catch {
          return false;
        }
      });
      await sleep(800);
    },

    async caption(stepLabel, text) {
      await page.evaluate(
        ([label, value]) => {
          document.getElementById("step").textContent = label;
          document.getElementById("step").style.display = label ? "flex" : "none";
          document.getElementById("caption").textContent = value;
        },
        [stepLabel, text],
      );
    },

    async card(html) {
      await page.evaluate((value) => {
        const card = document.getElementById("card");
        if (value) {
          card.innerHTML = value;
          card.classList.add("show");
        } else card.classList.remove("show");
      }, html);
    },

    /** Moves the cursor to an element, rings it, and optionally clicks it. */
    async point(locator, { click = true, ring = true } = {}) {
      await locator.scrollIntoViewIfNeeded();
      await sleep(250);
      const box = await locator.boundingBox();
      if (!box) throw new Error("Element to point at is not visible");
      await page.evaluate(
        ({ x, y, w, h, showRing }) => {
          const cursor = document.getElementById("cursor");
          cursor.style.left = `${x + w / 2}px`;
          cursor.style.top = `${y + h / 2}px`;
          const ringEl = document.getElementById("ring");
          Object.assign(ringEl.style, {
            left: `${x - 8}px`,
            top: `${y - 8}px`,
            width: `${w + 16}px`,
            height: `${h + 16}px`,
            opacity: showRing ? "1" : "0",
          });
        },
        { x: box.x, y: box.y, w: box.width, h: box.height, showRing: ring },
      );
      await sleep(900);
      if (click) {
        await page.evaluate(() => {
          const cursor = document.getElementById("cursor");
          cursor.classList.remove("click");
          void cursor.offsetWidth;
          cursor.classList.add("click");
        });
        await sleep(200);
        await page.evaluate(() => (document.getElementById("ring").style.opacity = "0"));
        await locator.click();
      }
    },

    /** Points at a dropdown, then picks an option by value or label. */
    async choose(locator, option) {
      await ctx.point(locator, { click: false });
      await locator.selectOption(option);
      await sleep(600);
      await ctx.unring();
    },

    async unring() {
      await page.evaluate(() => (document.getElementById("ring").style.opacity = "0"));
    },

    /** Types like a person, with the cursor on the field first. */
    async type(locator, text) {
      await ctx.point(locator, { click: true, ring: false });
      await locator.fill("");
      await locator.pressSequentially(text, { delay: 45 });
    },

    /** Smoothly scrolls the site frame by `pixels`. */
    async scroll(pixels, duration = 1200) {
      const target = siteFrame();
      await target.evaluate(
        ([distance, ms]) =>
          new Promise((resolve) => {
            const start = window.scrollY;
            const began = performance.now();
            const tick = (now) => {
              const t = Math.min(1, (now - began) / ms);
              const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
              window.scrollTo(0, start + distance * eased);
              if (t < 1) requestAnimationFrame(tick);
              else resolve();
            };
            requestAnimationFrame(tick);
          }),
        [pixels, duration],
      );
    },

    /**
     * Speaks one narration line: shows its caption, logs its start time, and
     * runs `action` while the voice plays. Waits for whichever is longer.
     */
    async say(id, { step = "", caption, action, after = 500 } = {}) {
      const duration = durations[id];
      if (duration === undefined) throw new Error(`No narration for line ${id}`);
      await ctx.caption(step, caption);
      timeline.push({ id, at: Date.now() - startedAt });
      await Promise.all([sleep(duration), action ? action() : Promise.resolve()]);
      await sleep(after);
    },
  };

  try {
    await script(ctx);
    await sleep(1200);
  } finally {
    const video = page.video();
    await context.close();
    const videoPath = path.join(outDir, "silent.webm");
    if (video) {
      await video.saveAs(videoPath);
      await video.delete();
    }
    fs.writeFileSync(
      path.join(outDir, "timeline.json"),
      JSON.stringify({ timeline, totalMs: Date.now() - startedAt }, null, 2),
    );
    await browser.close();
    await server.close();
  }
}
