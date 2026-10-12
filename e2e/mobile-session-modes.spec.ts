import { expect, test } from "@playwright/test";

test("compact touch sessions explain the selected game mode without hiding the arena", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/runner");
  const modes = page.locator(".session-mode-cards");
  const explanation = page.locator(".session-selected-mode");
  await expect(modes).toBeVisible();
  await expect(explanation).toBeVisible();
  await expect(explanation).toContainText("Explore e pratique");
  await modes.getByRole("button", { name: "Sprint" }).click();
  await expect(explanation).toContainText("sessão curta");
  await modes.getByRole("button", { name: "Maratona" }).click();
  await expect(explanation).toContainText("Mais tempo");
  await expect(page.locator(".action-canvas-wrap")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(explanation).toBeVisible();
  await expect(modes.getByRole("button", { name: "Maratona" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

  await page.setViewportSize({ width: 1024, height: 800 });
  await expect(explanation).toBeHidden();
  await expect(modes.getByRole("button", { name: /Maratona/ })).toBeVisible();
});
