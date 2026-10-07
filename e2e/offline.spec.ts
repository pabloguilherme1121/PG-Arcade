import { test, expect, type Page } from "@playwright/test";

async function waitForOfflineShell(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
}

test("an uncached offline game lets the player return and recover after reconnecting", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Service worker lifecycle is checked in Chromium.");
  await page.goto("./");
  await waitForOfflineShell(page);
  await context.setOffline(true);
  try {
    await page.getByRole("link", { name: "Jogar 2048", exact: true }).click();
    await expect(page.getByRole("heading", { name: "O jogo não carregou." })).toBeVisible();
    await page.locator(".empty").getByRole("link", { name: "Voltar aos jogos", exact: true }).click();
    await expect(page.locator(".game-card")).toHaveCount(100);
    await context.setOffline(false);
    await page.getByRole("link", { name: "Jogar 2048", exact: true }).click();
    await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
    await expect(page.locator(".board2048")).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test("a previously loaded game remains playable after an offline reload", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Service worker lifecycle is checked in Chromium.");
  await page.goto("./");
  await waitForOfflineShell(page);
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
  await waitForOfflineShell(page);
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
