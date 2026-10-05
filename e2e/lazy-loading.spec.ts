import { test, expect } from "@playwright/test";

test("new game families stay lazy until their routes are opened", async ({ page }) => {
  const loaded = new Set<string>();

  page.on("response", (response) => {
    const url = response.url();
    if (
      /BoardExpansion-|QuizExpansion-|MotionExpansion-/.test(url) &&
      response.ok()
    ) {
      loaded.add(url);
    }
  });

  await page.goto("./#/jogos");
  await expect(page.locator(".game-grid")).toBeVisible();
  expect([...loaded]).toEqual([]);

  await page.goto("./#/jogar/latin");
  await expect(page.locator('[data-new-game="latin"]')).toBeVisible();
  expect([...loaded].some((url) => /BoardExpansion-/.test(url))).toBe(true);
  expect([...loaded].some((url) => /QuizExpansion-|MotionExpansion-/.test(url))).toBe(false);

  await page.goto("./#/jogar/arithmetic");
  await expect(page.locator('[data-new-game="arithmetic"]')).toBeVisible();
  expect([...loaded].some((url) => /QuizExpansion-/.test(url))).toBe(true);
  expect([...loaded].some((url) => /MotionExpansion-/.test(url))).toBe(false);

  await page.goto("./#/jogar/rhythm");
  await expect(page.locator('[data-new-game="rhythm"]')).toBeVisible();
  expect([...loaded].some((url) => /MotionExpansion-/.test(url))).toBe(true);
});
