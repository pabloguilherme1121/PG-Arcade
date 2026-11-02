import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });
test("catalogo nao muda de posicao quando ajuda do PG Bot termina de carregar", async ({ page }) => {
  let intercepted = 0;
  let releaseHelp!: () => void;
  const helpPending = new Promise<void>(resolve => { releaseHelp = resolve; });
  await page.route(/CatalogPGBot-[^/]+\.js(?:\?.*)?$/, async route => {
    intercepted++;
    // Wait for the test to inspect the genuine loading state before delivering the chunk.
    await helpPending;
    await route.continue();
  });
  // The request is intentionally held. Do not wait for the load event that needs it.
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Buscar jogo").fill("CORES marÃ©");
  await expect(page.getByText("Carregando ajuda do PG Bot.", { exact: true })).toBeVisible();
  const before = await page.locator("#catalogo").evaluate(el => el.getBoundingClientRect().top + scrollY);
  expect(intercepted).toBeGreaterThan(0);
  releaseHelp();
  await expect(page.locator('[data-pg-bot="catalog-help"]')).toBeVisible();
  const after = await page.locator("#catalogo").evaluate(el => el.getBoundingClientRect().top + scrollY);
  expect(intercepted).toBeGreaterThan(0);
  expect(Math.abs(after - before)).toBeLessThan(5);
});
