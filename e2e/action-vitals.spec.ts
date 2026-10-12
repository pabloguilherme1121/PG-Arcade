import { expect, test } from "@playwright/test";

test("action-game HUD highlights critical lives without flashing or hiding the arena", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/runner");
  const lives = page.locator(".action-hud [data-critical-lives]");
  await expect(lives).toHaveAttribute("data-critical-lives", "false");
  await page.getByRole("combobox", { name: "Dificuldade", exact: true }).selectOption("master");
  await expect(lives).toHaveAttribute("data-critical-lives", "true");
  await expect(lives).toContainText("Vidas");
  await expect(lives).toContainText("2");
  const result = await lives.evaluate(el => ({
    border: getComputedStyle(el).borderTopColor,
    color: getComputedStyle(el).color,
    animation: getComputedStyle(el).animationName,
  }));
  expect(result.border).not.toBe("rgba(0, 0, 0, 0)");
  expect(result.animation).toBe("none");
  await expect(page.locator(".action-canvas-wrap canvas")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
