import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("all 102 catalog links use their visible label in their accessible name", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("./");
  await expect(page.locator(".game-grid a.game-link")).toHaveCount(102);
  const links = page.locator(".game-grid a.game-link");
  const accessible = await links.first().getAttribute("aria-label");
  expect(accessible).toBeNull();
  await expect(links.first()).toHaveAccessibleName(/Jogar .+/);
  const audit = await new AxeBuilder({ page }).include(".game-grid").withRules(["label-content-name-mismatch"]).analyze();
  expect(audit.violations).toEqual([]);
});
