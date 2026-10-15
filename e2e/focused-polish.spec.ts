import { expect, test } from "@playwright/test";

test("reaction measures pointer press without counting release twice", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto("./#/jogar/reflexo");
  const board = page.locator(".reaction-board");
  await board.click();
  await page.clock.runFor(1250);
  await expect(board).toHaveClass(/reaction-go/);
  await board.dispatchEvent("pointerdown", { isPrimary: true, button: 0, pointerId: 1, pointerType: "touch" });
  const response = await page.locator("[data-reaction-last]").textContent();
  await page.clock.runFor(600);
  await board.dispatchEvent("click", { detail: 1 });
  await expect(page.locator("[data-reaction-last]")).toHaveText(response!);
  await expect(page.getByRole("progressbar", { name: "Rodadas do reflexo" })).toHaveAttribute("aria-valuenow", "1");
  await expect(board).toHaveClass(/reaction-result/);
});

test("timed reaction waits for actual play before starting or resuming its clock", async ({ page }) => {
  await page.goto("./#/jogar/reflexo");
  await expect(page.locator(".reaction-board")).toBeVisible();
  await page.clock.install();
  await page.locator(".session-mode-cards").getByRole("button", { name: /Sprint:/ }).click();
  await page.getByRole("button", { name: "Iniciar desafio de tempo", exact: true }).click();
  await page.clock.runFor(5000);
  await expect(page.getByRole("timer")).toHaveText("2:00");
  await page.locator(".reaction-board").click();
  await page.clock.runFor(2000);
  await expect(page.getByRole("timer")).not.toHaveText("2:00");
  await page.getByRole("button", { name: "Pausar sessão", exact: true }).click();
  const paused = await page.getByRole("timer").textContent();
  await page.getByRole("button", { name: "Retomar sessão", exact: true }).click();
  await page.clock.runFor(5000);
  await expect(page.getByRole("timer")).toHaveText(paused!);
  await page.locator(".reaction-board").click();
  await page.clock.runFor(1000);
  await expect(page.getByRole("timer")).not.toHaveText(paused!);
});

test("mobile exposes fullscreen directly and only one session selector", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/snake");
  await expect(page.locator(".player-toolbar > button", { hasText: "Tela cheia" })).toBeVisible();
  await expect(page.locator(".session-mode-cards button")).toHaveCount(3);
  await expect(page.getByLabel("Modo de sessão", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
