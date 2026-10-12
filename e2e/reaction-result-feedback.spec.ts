import { expect, test } from "@playwright/test";

test("Reflexo Rápido distinguishes premature taps and successful reactions visually", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/reflexo");
  const board = page.locator(".reaction-board");

  await expect(board).toHaveAttribute("data-reaction-result", "none");
  await board.click();
  await expect(board).toHaveClass(/reaction-wait/);
  await board.click();
  await expect(board).toHaveAttribute("data-reaction-result", "early");
  await expect(page.locator(".game-status")).toContainText("Cedo demais!");
  const early = await board.evaluate(el => getComputedStyle(el).borderTopColor);

  await board.click();
  await expect(board).toHaveAttribute("data-reaction-result", "none");
  await page.clock.runFor(1250);
  await expect(board).toHaveClass(/reaction-go/);
  await page.clock.runFor(150);
  await board.click();
  await expect(board).toHaveAttribute("data-reaction-result", "valid");
  await expect(page.locator("[data-reaction-last]")).toContainText("ms");
  const valid = await board.evaluate(el => getComputedStyle(el).borderTopColor);
  expect(valid).not.toBe(early);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

  await page.getByRole("button", { name: "Novo desafio", exact: true }).click();
  await expect(board).toHaveAttribute("data-reaction-result", "none");
});

test("Reflexo Rápido does not animate result feedback when reduced motion is enabled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#/jogar/reflexo");
  const board = page.locator(".reaction-board");
  await board.click();
  await board.click();
  await expect(board).toHaveAttribute("data-reaction-result", "early");
  await expect(board).toHaveCSS("animation-name", "none");
});
