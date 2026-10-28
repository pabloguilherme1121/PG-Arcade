import { test, expect } from "@playwright/test";

test.use({ hasTouch: true });

for (const width of [320, 390]) {
  test("PG Estratégia: jogos independentes no celular " + width + " px", async ({ page }) => {
    await page.setViewportSize({ width, height: 780 });
    await page.goto("./estrategia/");
    await page.getByRole("link", { name: /Frota Oculta · estratégia naval/ }).click();
    await expect(page).toHaveURL(/\/estrategia\/independentes\/#frota-oculta$/);
    await expect(page.getByRole("heading", { name: "Frota Oculta" })).toBeVisible();
    await expect(page.locator(".sea-cell")).toHaveCount(36);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.getByRole("button", { name: /Linha 1, coluna 1/ }).tap();
    await expect(page.locator(".metric").first()).toContainText("1 /");
    await page.getByRole("button", { name: "Usar sonar na linha 2" }).tap();
    await expect(page.getByRole("status")).toContainText("Sonar");
    await page.getByRole("button", { name: "Reiniciar partida" }).tap();
    await expect(page.locator(".metric").first()).toContainText("0 /");
    await page.getByLabel("Dificuldade").selectOption("veterano");
    await expect(page.locator(".metric").first()).toContainText("0 / 13");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("Cartas de Cerco: jogo de cartas interativo, energia e reinício", async ({ page }) => {
  await page.goto("./estrategia/independentes/#cartas-de-cerco");
  await expect(page.getByRole("heading", { name: "Cartas de Cerco" })).toBeVisible();
  await expect(page.locator(".hand-card")).toHaveCount(4);
  await page.locator(".hand-card:not(:disabled)").first().click();
  await expect(page.locator(".metric").last()).toContainText("1");
  await page.getByRole("button", { name: "Encerrar turno · receber ataque rival" }).click();
  await expect(page.locator(".metric").first()).toContainText("2 /");
  await page.getByRole("button", { name: "Reiniciar partida" }).click();
  await expect(page.locator(".metric").first()).toContainText("1 /");
  await page.getByRole("button", { name: /Frota Oculta.*Dedução naval/ }).click();
  await expect(page.locator(".sea-cell")).toHaveCount(36);
});

test("Jogos Originais: navegação bidirecional com PG Arcade e PG Estratégia", async ({ page }) => {
  await page.goto("./estrategia/independentes/");
  await expect(page.getByRole("navigation", { name: "Navegação entre os sites" }).getByRole("link", { name: "PG Arcade" })).toHaveAttribute("href", "../../");
  await page.getByRole("navigation", { name: "Navegação entre os sites" }).getByRole("link", { name: "Missões Estratégia" }).click();
  await expect(page.locator("#jogos-originais")).toBeVisible();
  await expect(page.getByRole("link", { name: /Cartas de Cerco · combate com baralho/ })).toHaveAttribute("href", "./independentes/#cartas-de-cerco");
});
