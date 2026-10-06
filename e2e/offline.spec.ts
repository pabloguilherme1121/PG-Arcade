import { test, expect } from "@playwright/test";

test("the catalog reloads offline after its first visit", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Service worker lifecycle is checked in Chromium.");
  const gameChunks: string[] = [];
  page.on("response", response => {
    if (/BoardExpansion-|QuizExpansion-|MotionExpansion-/.test(response.url())) gameChunks.push(response.url());
  });
  await page.goto("./");
  await expect(page.locator(".game-grid")).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.locator(".game-grid")).toBeVisible();
    await expect(page.locator(".game-grid a").first()).toBeVisible();
    expect(gameChunks).toEqual([]);
  } finally {
    await context.setOffline(false);
  }
});
