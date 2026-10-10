import { expect, test } from "@playwright/test";

test("Sequência permite rever uma vez o padrão antes de responder sem avançar o nível", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/sequencia");
  const replay = page.getByRole("button", { name: "Rever sequência", exact: true });
  const progress = page.getByRole("progressbar", { name: "Resposta da sequência" });
  await expect(replay).toBeDisabled();
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(1400);
  await expect(replay).toBeEnabled();
  await expect(progress).toHaveAttribute("aria-valuenow", "0");
  await replay.click();
  await expect(page.locator(".game-status")).toContainText("Observe a sequência");
  await page.clock.runFor(1400);
  await expect(replay).toBeDisabled();
  await expect(page.locator("[data-sequence-review]")).toContainText("Revisão usada");
  await expect(page.locator(".scores strong").first()).toHaveText("1");
  await page.locator(".sequence-board").press("1");
  await expect(page.locator(".scores strong").first()).toHaveText("2");
  await page.clock.runFor(2300);
  await expect(replay).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Sequência exibe progresso de acertos e mostra a cor esperada após erro", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/sequencia");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(1400);
  await page.getByRole("button", { name: "2: Azul", exact: true }).click();
  await expect(page.locator(".game-status")).toContainText("esperada: Verde");
  await expect(page.locator("[data-sequence-round]")).toContainText("Encerrado");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(1400);
  await page.locator(".sequence-board").press("1");
  await expect(page.locator(".scores strong").first()).toHaveText("2");
  await page.clock.runFor(2300);
  const progress = page.getByRole("progressbar", { name: "Resposta da sequência" });
  await expect(progress).toHaveAttribute("aria-valuemax", "2");
  await page.locator(".sequence-board").press("1");
  await expect(progress).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator("[data-sequence-round]")).toContainText("1 de 2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
