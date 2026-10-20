import { expect, test } from "@playwright/test";

test("an unavailable optional recommendation never hides the catalog or its filters", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route(/CatalogSpotlight-[^/]+\.(js|css)/, route => route.abort());
  await page.goto("./");
  await expect(page.locator(".game-card")).toHaveCount(102);
  await page.getByLabel("Buscar jogo").fill("xadrez");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page.getByRole("link", { name: /^Jogar Xadrez/ }).click();
  await expect(page.locator("[data-chess-board]")).toBeVisible();
  await page.getByRole("link", { name: "Voltar aos jogos", exact: true }).click();
  await expect(page.getByLabel("Buscar jogo")).toHaveValue("xadrez");
  await expect(page.locator(".game-card")).toHaveCount(1);
  expect(errors).toEqual([]);
});
