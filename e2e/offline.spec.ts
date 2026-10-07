import { test, expect } from "@playwright/test";

test("a previously loaded game remains playable after an offline reload", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Service worker lifecycle is checked in Chromium.");
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
  await page.getByRole("link", { name: "Jogar 2048", exact: true }).click();
  await expect(page.locator(".board2048")).toBeVisible();
  // Wait for the response's background cache write, rather than a fixed delay.
  await expect.poll(() => page.evaluate(async () => {
    const entries = await Promise.all((await caches.keys()).filter(key => key.startsWith("pg-arcade-")).map(async key => (await (await caches.open(key)).keys()).map(request => request.url)));
    return entries.flat().some(url => /\/Game2048-[^/]+\.js$/.test(url));
  })).toBe(true);
  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.locator(".board2048")).toBeVisible();
    for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"])
      await page.locator(".board2048").press(key);
    await expect(page.getByRole("button", { name: "Desfazer", exact: true })).toBeEnabled();
    await page.getByRole("link", { name: "Jogos", exact: true }).click();
    await expect(page.locator(".game-card")).toHaveCount(100);
  } finally {
    await context.setOffline(false);
  }
});

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
