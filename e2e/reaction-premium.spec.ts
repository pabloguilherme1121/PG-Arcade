import { expect, test } from "@playwright/test";

test("Reflexo Rápido mostra tempo, média e progresso após o sinal", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/reflexo");
  const field = page.locator(".reaction-board");
  const bar = page.getByRole("progressbar", { name: "Rodadas do reflexo" });
  await expect(bar).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator("[data-reaction-last]")).toHaveText("—");
  await field.click();
  await expect(field).toHaveClass(/reaction-wait/);
  await page.clock.runFor(1250);
  await expect(field).toHaveClass(/reaction-go/);
  await page.clock.runFor(180);
  await field.click();
  await expect(page.locator("[data-reaction-last]")).toContainText("ms");
  await expect(page.locator("[data-reaction-best]")).toContainText("ms");
  await expect(page.locator("[data-reaction-average]")).toContainText("ms");
  await expect(page.locator("[data-reaction-false]")).toHaveText("0");
  await expect(bar).toHaveAttribute("aria-valuenow", "1");
  // A resposta foi válida mesmo se demorou além da janela e rendeu zero.
  // Confira a regra contra o tempo efetivamente medido pelo jogo.
  const measured = Number((await page.locator("[data-reaction-last]").textContent())?.replace(" ms", ""));
  expect(Number.isFinite(measured)).toBe(true);
  const expectedPoints = Math.max(0, Math.round(1000 * (1 - measured / 1000)));
  await expect(page.locator(".scores strong").first()).toHaveText(String(expectedPoints));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Reflexo Rápido distingue largada antecipada e reinicia todas as estatísticas", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/reflexo");
  const field = page.locator(".reaction-board");
  await field.click();
  await expect(field).toHaveClass(/reaction-wait/);
  await field.click();
  await expect(page.locator("[data-reaction-false]")).toHaveText("1");
  await expect(page.locator("[data-reaction-best]")).toHaveText("—");
  await expect(page.locator("[data-reaction-average]")).toHaveText("—");
  await expect(page.getByRole("progressbar", { name: "Rodadas do reflexo" })).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator(".game-status")).toContainText("Cedo demais!");
  await page.getByRole("button", { name: "Novo desafio", exact: true }).click();
  await expect(page.locator("[data-reaction-false]")).toHaveText("0");
  await expect(page.locator("[data-reaction-last]")).toHaveText("—");
  await expect(page.getByRole("progressbar", { name: "Rodadas do reflexo" })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator(".scores strong").first()).toHaveText("0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
