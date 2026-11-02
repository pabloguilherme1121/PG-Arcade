import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });
test("catalogo nao muda de posicao quando ajuda do PG Bot termina de carregar", async ({ page }) => {
  let intercepted = 0;
  await page.route(/CatalogPGBot-[^/]+\.js(?:\?.*)?$/, async route => {
    intercepted++;
    await new Promise(resolve => setTimeout(resolve, 2500));
    await route.continue();
  });
  await page.goto("./");
  await page.getByLabel("Buscar jogo").fill("CORES marÃ©");
  await expect(page.getByText("Carregando ajuda do PG Bot.", { exact: true })).toBeVisible();
  const before = await page.locator("#catalogo").evaluate(el => el.getBoundingClientRect().top + scrollY);
  await expect(page.locator('[data-pg-bot="catalog-help"]')).toBeVisible();
  const after = await page.locator("#catalogo").evaluate(el => el.getBoundingClientRect().top + scrollY);
  expect(intercepted).toBeGreaterThan(0);
  expect(Math.abs(after - before)).toBeLessThan(5);
});
