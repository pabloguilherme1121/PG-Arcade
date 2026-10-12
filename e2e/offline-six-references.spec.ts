import { expect, test, type Page } from "@playwright/test";

const references = [
  ["snake", ".snake-board", "Snake", "Snake"],
  ["2048", ".board2048", "2048", "Game2048"],
  ["memoria", ".memory-board", "Memória", "Memory"],
  ["xadrez", "[data-chess-board]", "Xadrez", "PortfolioChess"],
  ["corrida", ".race-board", "Corrida Turbo", "Racing"],
  ["futebol", ".football-pitch", "Futebol", "PortfolioFootball"],
] as const;

async function showGame(page: Page, id: string, field: string, name: string) {
  await page.evaluate(game => { window.location.hash = "#/jogar/" + game; }, id);
  await expect(page.locator(".player h1")).toHaveText(name);
  await expect(page.locator(field)).toBeVisible();
}

/** The current SPA must remain navigable when the device loses connectivity. */
test("six previously visited reference families remain usable in the open offline tab", async ({ page, context }) => {
  test.slow();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.locator(".game-card")).toHaveCount(100);
  for (const [id, field, name] of references) await showGame(page, id, field, name);

  await context.setOffline(true);
  try {
    for (const [id, field, name] of [...references].reverse()) {
      await showGame(page, id, field, name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), id).toBe(true);
    }
    await page.evaluate(() => { window.location.hash = "#/"; });
    await expect(page.locator(".game-card")).toHaveCount(100);
  } finally {
    await context.setOffline(false);
  }
});

/** Separately prove that Chromium's real SW cache, not just in-memory JS, supports an offline reload. */
test("cached six reference chunks survive a Chromium service-worker offline reload", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Playwright only supports full Service Worker inspection in Chromium.");
  test.slow();
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });

  for (const [id, field, name, assetName] of references) {
    await showGame(page, id, field, name);
    await expect.poll(async () => page.evaluate(async expected => {
      const keys = (await caches.keys()).filter(key => key.startsWith("pg-arcade-") && !key.includes("covers"));
      const urls = (await Promise.all(keys.map(async key => (await (await caches.open(key)).keys()).map(req => req.url)))).flat();
      return urls.some(url => url.includes("/assets/" + expected + "-") && url.endsWith(".js"));
    }, assetName), { message: "The visited " + id + " game chunk must reach the service-worker cache" }).toBe(true);
  }

  await context.setOffline(true);
  try {
    await page.reload();
    for (const [id, field, name] of references) await showGame(page, id, field, name);
    await page.evaluate(() => { window.location.hash = "#/"; });
    await expect(page.locator(".game-card")).toHaveCount(100);
  } finally {
    await context.setOffline(false);
  }
});
