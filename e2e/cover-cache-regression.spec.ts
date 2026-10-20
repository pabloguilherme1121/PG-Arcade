import { test, expect } from "@playwright/test";

test("loading many catalog covers never evicts an already playable offline game", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Service worker cache lifecycle is verified in Chromium.");

  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>(resolve =>
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }),
      );
    }
  });

  await page.getByRole("link", { name: /^Jogar 2048/ }).click();
  await expect(page.locator(".board2048")).toBeVisible();

  async function isGameChunkCached() {
    return page.evaluate(async () => {
      const requests = (await Promise.all(
        (await caches.keys()).filter(name => name.startsWith("pg-arcade-")).map(async name =>
          (await (await caches.open(name)).keys()).map(request => request.url),
        ),
      )).flat();
      return requests.some(url => /\/Game2048-[^/]+\.js$/.test(url));
    });
  }

  await expect.poll(isGameChunkCached).toBe(true);

  // 125+ cover URLs simulate browsing a large catalog plus repeated cover
  // revisions. They must never compete with the lazily loaded game bundles.
  await page.evaluate(async () => {
    for (let i = 0; i < 135; i++) {
      const url = new URL(`covers/2048.svg?cache-probe=${i}`, location.href).href;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Cover ${i} could not be fetched`);
      let stored = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        if (await caches.match(url)) { stored = true; break; }
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      if (!stored) throw new Error(`Cover ${i} did not reach service worker cache`);
    }
  });

  expect(await isGameChunkCached()).toBe(true);
  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.locator(".board2048")).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
