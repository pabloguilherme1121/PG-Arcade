// Opt-in performance sampling. Do not equate Chromium CPU throttling with a physical device.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const options = new Map(process.argv.slice(2).filter(s => s.startsWith("--")).map(arg => {
  const pos = arg.indexOf("=");
  return [arg.slice(2, pos < 0 ? undefined : pos), pos < 0 ? "true" : arg.slice(pos + 1)];
}));
const option = (key, fallback) => options.get(key) ?? fallback;
const positiveInteger = (key, fallback, maximum) => {
  const value = Number(option(key, fallback));
  if (!Number.isInteger(value) || value < 1 || value > maximum) throw new Error("Invalid --" + key);
  return value;
};
const samples = positiveInteger("samples", "3", 30);
const frameCount = positiveInteger("frames", "120", 600);
const width = positiveInteger("width", "390", 2560);
const height = positiveInteger("height", "844", 2560);
const cpu = positiveInteger("cpu", "4", 20);
const root = new URL(option("base-url", "http://127.0.0.1:5173/"));
root.hash = "";
const output = option("output", "artifacts/arcade-performance.json");
const defaults = ["snake", "2048", "memoria", "xadrez", "corrida", "futebol"];
const referenceFields = {
  snake: ".snake-board", "2048": ".board2048", memoria: ".memory-board",
  xadrez: "[data-chess-board]", corrida: ".race-board", futebol: ".football-pitch",
};

function percentile(numbers, percentage) {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  return sorted[Math.ceil(percentage * sorted.length) - 1];
}
const rounded = number => Number(number.toFixed(1));
const stats = values => {
  const nums = values.filter(Number.isFinite);
  return { p50: nums.length ? rounded(percentile(nums, .5)) : null,
    p95: nums.length ? rounded(percentile(nums, .95)) : null, max: nums.length ? rounded(Math.max(...nums)) : null };
};
async function sample(browser, id) {
  // A new isolated context avoids accidentally comparing warm and cold caches.
  const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: "block" });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.__arcadeLongTasks = [];
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__arcadeLongTasks.push(entry.duration);
      });
      observer.observe({ type: "longtask", buffered: true });
    } catch { /* The browser may not expose long tasks. */ }
  });
  try {
    if (cpu !== 1) {
      const devtools = await context.newCDPSession(page);
      await devtools.send("Emulation.setCPUThrottlingRate", { rate: cpu });
    }
    const address = new URL(root);
    address.hash = "/jogar/" + id;
    await page.goto(address.href, { waitUntil: "domcontentloaded", timeout: 30000 });
    const arena = page.locator(`[data-arcade-arena][data-game-id="${id}"]`);
    await arena.waitFor({ state: "visible", timeout: 30000 });
    if (referenceFields[id]) await arena.locator(referenceFields[id]).waitFor({ state: "visible", timeout: 15000 });
    await page.waitForFunction(() => !!document.querySelector("[data-arcade-arena] button, [data-arcade-arena] canvas, [data-arcade-arena] input, [data-arcade-arena] [role='gridcell']"), null, { timeout: 15000 });
    const data = await page.evaluate(() => {
      const entries = performance.getEntriesByType("resource");
      const assets = entries.filter(item => /\.(js|css)(\?|$)/.test(item.name));
      const navigation = performance.getEntriesByType("navigation")[0];
      return {
        routeReadyMs: performance.now(),
        domNodes: document.getElementsByTagName("*").length,
        svgNodes: document.querySelectorAll("svg").length,
        resources: entries.length,
        jsCssTransferBytes: assets.reduce((total, resource) => total + (resource.transferSize || 0), 0),
        longTaskCount: (window.__arcadeLongTasks || []).length,
        longTaskTotalMs: (window.__arcadeLongTasks || []).reduce((total, n) => total + n, 0),
        domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
        jsHeapBytes: performance.memory?.usedJSHeapSize ?? null,
        overflowX: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    // Exercise a named, repeatable scenario instead of reporting idle frames as gameplay.
    if (id === "snake") await arena.getByRole("button", { name: "Jogar", exact: true }).click();
    else if (id === "corrida") await arena.getByRole("button", { name: "Largar", exact: true }).click();
    else if (id === "futebol") await arena.locator("[data-football-shoot]").click();
    else if (id === "2048") for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"]) await arena.locator(".board2048").press(key);
    else if (id === "memoria") { await arena.locator(".memory-card").nth(0).click(); await arena.locator(".memory-card").nth(1).click(); }
    else if (id === "xadrez") { await arena.getByRole("gridcell").nth(52).click(); await arena.getByRole("gridcell").nth(36).click(); }
    const frameSample = await page.evaluate(count => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Frame sample timed out")), 30000);
      const deltas = []; let last = performance.now();
      const tick = now => {
        deltas.push(now - last); last = now;
        if (deltas.length < count) requestAnimationFrame(tick);
        else { clearTimeout(timeout); resolve(deltas); }
      };
      requestAnimationFrame(tick);
    }), frameCount);
    data.frameIntervalMs = stats(frameSample);
    data.frameP95Ms = data.frameIntervalMs.p95;
    data.framesOver50ms = frameSample.filter(ms => ms > 50).length;
    data.scenario = defaults.includes(id) ? "reference-action-then-frame-sample" : "idle-frame-sample";
    if (pageErrors.length) throw new Error("Invalid sample for " + id + ": " + pageErrors.join("; "));
    return { id, ...data, errors: pageErrors };
  } finally {
    await context.close();
  }
}

async function sampleCatalogScroll(browser, viewportWidth, expectedCards) {
  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportWidth === 320 ? 740 : 844 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__arcadeCatalogLongTasks = [];
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__arcadeCatalogLongTasks.push(entry.duration);
      }).observe({ type: "longtask", buffered: true });
    } catch { /* Unsupported performance entry type. */ }
  });
  try {
    if (cpu !== 1) {
      const devtools = await context.newCDPSession(page);
      await devtools.send("Emulation.setCPUThrottlingRate", { rate: cpu });
    }
    await page.goto(root.href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(expected =>
      document.querySelectorAll(".game-grid [data-catalog-game]").length === expected,
      expectedCards, { timeout: 30000 });
    const metrics = await page.evaluate(async () => {
      const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
      const fractions = [0, .25, .5, .75, 1, .75, .5, .25, 0];
      const scrollRange = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const twoFrameScrollDurations = [];
      const widths = [];
      for (const fraction of fractions) {
        const start = performance.now();
        window.scrollTo({ top: Math.round(scrollRange * fraction), behavior: "instant" });
        await frame();
        await frame();
        twoFrameScrollDurations.push(performance.now() - start);
        widths.push(document.documentElement.scrollWidth);
      }
      const assets = performance.getEntriesByType("resource")
        .filter(item => /\.(js|css)(\?|$)/.test(item.name));
      const longTasks = window.__arcadeCatalogLongTasks || [];
      return {
        cardCount: document.querySelectorAll(".game-grid [data-catalog-game]").length,
        domNodes: document.getElementsByTagName("*").length,
        svgNodes: document.querySelectorAll("svg").length,
        maxScrollWidth: Math.max(...widths),
        viewportWidth: innerWidth,
        overflowX: widths.some(value => value > innerWidth + 1),
        jsCssTransferBytes: assets.reduce((sum, item) => sum + (item.transferSize || 0), 0),
        jsHeapBytes: performance.memory?.usedJSHeapSize ?? null,
        longTaskCount: longTasks.length,
        longTaskTotalMs: longTasks.reduce((sum, ms) => sum + ms, 0),
        twoFrameScrollDurations,
      };
    });
    const { twoFrameScrollDurations, ...rest } = metrics;
    return {
      ...rest,
      twoFrameScrollMs: stats(twoFrameScrollDurations),
      samplesOver50ms: twoFrameScrollDurations.filter(ms => ms > 50).length,
    };
  } finally {
    await context.close();
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: "block" });
    const page = await context.newPage();
    await page.goto(root.href, { waitUntil: "domcontentloaded" });
    await page.locator(".game-grid [data-catalog-game]").first().waitFor({ state: "visible" });
    const ids = await page.locator(".game-grid [data-catalog-game]").evaluateAll(elements =>
      elements.map(element => element.getAttribute("data-catalog-game")).filter(Boolean));
    const catalog = await page.evaluate(() => ({
      domNodes: document.getElementsByTagName("*").length,
      svgNodes: document.querySelectorAll("svg").length,
      cardCount: document.querySelectorAll(".game-grid [data-catalog-game]").length,
    }));
    await context.close();
    const catalogViewportSamples = [];
    for (const viewportWidth of [320, 390]) {
      for (let index = 0; index < samples; index++) {
        const row = await sampleCatalogScroll(browser, viewportWidth, ids.length);
        if (row.cardCount !== ids.length || row.overflowX) {
          throw new Error("Catalog count or horizontal overflow regression at " + viewportWidth + "px");
        }
        catalogViewportSamples.push(row);
      }
    }
    const catalogViewportSummary = Object.fromEntries([320, 390].map(viewportWidth => {
      const rows = catalogViewportSamples.filter(row => row.viewportWidth === viewportWidth);
      return [String(viewportWidth), {
        cardCount: ids.length,
        domNodes: stats(rows.map(row => row.domNodes)),
        svgNodes: stats(rows.map(row => row.svgNodes)),
        twoFrameScrollP95Ms: stats(rows.map(row => row.twoFrameScrollMs.p95)),
        longTaskTotalMs: stats(rows.map(row => row.longTaskTotalMs)),
        samplesWithOverflow: rows.filter(row => row.overflowX).length,
      }];
    }));
    if (!ids.length || new Set(ids).size !== ids.length || defaults.some(id => !ids.includes(id))) throw new Error("Catalog must contain unique IDs and all reference games");
    const requested = option("all", "false") === "true" ? ids : option("games", defaults.join(",")).split(",");
    const selected = [...new Set(requested.map(x => x.trim()).filter(Boolean))];
    if (!selected.length || selected.some(id => !ids.includes(id))) throw new Error("Unknown or empty game IDs");
    const rows = [];
    for (const id of selected) for (let i = 0; i < samples; i++) {
      const row = await sample(browser, id);
      rows.push(row);
      process.stdout.write(id + " " + (i + 1) + "/" + samples + ": " + rounded(row.routeReadyMs) + "ms, " + row.domNodes + " DOM nodes\n");
    }
    const metrics = ["routeReadyMs", "domNodes", "svgNodes", "jsCssTransferBytes", "longTaskCount", "longTaskTotalMs", "jsHeapBytes", "framesOver50ms", "frameP95Ms"];
    const perGame = Object.fromEntries(selected.map(id => [id, Object.fromEntries(metrics.map(metric => [
      metric, stats(rows.filter(row => row.id === id).map(row => row[metric]).filter(Number.isFinite)),
    ]))]));
    const report = {
      metadata: { timestamp: new Date().toISOString(), baseURL: root.href,
        browser: "chromium", browserVersion: browser.version(), profile: cpu === 1 ? "unthrottled-desktop" : "emulated-cpu-" + cpu + "x",
        warning: "CPU throttling is not a physical mid-range Android measurement.",
        viewport: { width, height }, samples, frameCount, frameMetric: "requestAnimationFrame intervals after a reference action; not GPU render time or sustained gameplay FPS", catalogMetric: "two animation frames after each programmed scroll over 101-card catalog; diagnostic proxy, not INP, sustained FPS or physical Android", cache: "new-context-per-sample; service-worker-blocked" },
      catalog, catalogViewportSummary, catalogViewportSamples, perGame, rows,
    };
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2) + "\n");
    process.stdout.write("Saved " + output + "\n");
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
