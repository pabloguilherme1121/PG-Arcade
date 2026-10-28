import { expect, test } from "@playwright/test";

test("PG Estratégia conecta os dois catálogos e permite jogar e voltar", async ({ page }) => {
  await page.goto("./#/");
  await page.getByRole("link", { name: "Conhecer PG Estratégia" }).click();
  await expect(page.getByRole("heading", { name: "PG Estratégia." })).toBeVisible();
  await expect(page.getByText("150", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Explorar 150 operações" }).click();
  await expect(page).toHaveURL(/#\/estrategia$/);
  await page.getByRole("button", { name: "Jogos estratégicos do Arcade" }).click();
  await expect(page).toHaveURL(/#\/estrategia$/);
  await page.getByRole("button", { name: /Jogar missão Aurora · Conquista territorial/ }).click();
  await expect(page.locator("[data-strategy-arena='territorio-01']")).toBeVisible();
  for (const [row, column] of [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6]]) {
    await page.getByRole("button", { name: new RegExp("Linha " + row + ", coluna " + column) }).click();
  }
  await expect(page.locator("[data-strategy-result='won']")).toBeVisible();
  await page.getByRole("button", { name: "Voltar à campanha" }).click();
  await expect(page.getByRole("heading", { name: "PG Estratégia." })).toBeVisible();
  const classic = page.getByRole("link", { name: /Jogar .+ no PG Arcade/ }).first();
  await classic.click();
  await expect(page.locator("[data-current-game]")).toBeVisible();
  await page.getByRole("link", { name: "Voltar aos jogos" }).click();
  await expect(page.locator("[data-pg-strategy]")).toBeVisible();
  await page.getByRole("link", { name: "PG Arcade", exact: true }).last().click();
  await expect(page.getByRole("heading", { name: /Escolha\. Jogue/ })).toBeVisible();
});

for (const width of [320, 390]) {
  test("PG Estratégia no celular " + width + " px mantém jogo e navegação sem overflow", async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("./#/estrategia");
    await expect(page.getByRole("heading", { name: "PG Estratégia." })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.getByRole("button", { name: /Jogar missão Aurora · Conquista territorial/ }).click();
    await expect(page.locator("[data-strategy-arena]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    const cell = page.getByRole("button", { name: /Linha 1, coluna 2/ });
    await expect(cell).toBeVisible();
    await cell.click();
    await expect(page.getByText("12", { exact: true }).first()).toBeVisible();
  });
}

test("PG Estratégia compartilha URL de missão e separa jogos não estratégicos", async ({ page }) => {
  await page.goto("./#/estrategia/jogo/rotas-08");
  await expect(page.locator("[data-strategy-arena='rotas-08']")).toBeVisible();
  await page.getByRole("button", { name: "Voltar à campanha" }).click();
  await expect(page.locator("#st-classics .st-original-card").first()).toBeVisible();
  await expect(page.locator("#st-classics .st-original-card").first()).toHaveCount(1);
  await expect(page.locator("#st-classics .st-original-card")).not.toHaveCount(0);
});
