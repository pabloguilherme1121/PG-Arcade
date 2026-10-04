import { test, expect } from "@playwright/test";
test("word clues, duplicate prevention, victory and saved record", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/#/jogar/palavra");
  const input = page.getByLabel("Sua palavra", { exact: true });
  await input.fill("PORTA");
  await input.press("Enter");
  await expect(page.locator(".letter-present")).toHaveCount(2);
  await input.fill("PORTA");
  await input.press("Enter");
  await expect(page.locator("#word-feedback")).toContainText("já tentou");
  await input.fill("CARRO");
  await input.press("Enter");
  await expect(page.locator("#word-feedback")).toContainText("Acertou");
  await expect(input).toBeDisabled();
  await page.reload();
  await expect(page.locator(".scores strong").nth(1)).toHaveText("500");
  await page
    .getByLabel("Desafio da palavra", { exact: true })
    .selectOption("4");
  await expect(page.locator(".scores strong").first()).toHaveText("0/4");
});
test("sequence pause replays pattern, keyboard and touch save record", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.clock.install();
  await page.goto("/#/jogar/sequencia");
  await expect(page.locator(".sequence-board")).toBeVisible();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(450);
  await expect(page.locator(".pad-lit")).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.locator(".game-status")).toContainText("Pausado");
  await page.clock.runFor(5000);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.clock.runFor(1400);
  await page.locator(".sequence-board").press("1");
  await expect(page.locator(".scores strong").first()).toHaveText("2");
  await page.clock.runFor(2400);
  await page.getByRole("button", { name: "1: Verde", exact: true }).click();
  await page.getByRole("button", { name: "2: Azul", exact: true }).click();
  await expect(page.locator(".game-status")).toContainText("encerrada");
  await page.clock.resume();
  await page.reload();
  await expect(page.locator(".scores strong").nth(1)).toHaveText("100");
});
