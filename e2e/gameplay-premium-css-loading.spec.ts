import { expect, test } from "@playwright/test";

test("gameplay-only CSS arrives before a mobile arena becomes playable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/corrida");
  const arena = page.locator("[data-arcade-arena][data-game-id='corrida']");
  await expect(arena).toBeVisible();
  await expect.poll(() => arena.evaluate(el => getComputedStyle(el).overscrollBehavior)).toBe("contain");
  const race = page.locator(".race-board");
  await expect(race).toBeVisible();
  await expect.poll(() => race.evaluate(el => getComputedStyle(el).touchAction)).toBe("pan-y pinch-zoom");
  await expect(page.locator("body")).toHaveJSProperty("tagName", "BODY");
});

test("catalog keeps all 101 cards with lazy gameplay styling isolated", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("./");
  await expect(page.locator("[data-catalog-game]")).toHaveCount(101);
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(horizontalOverflow).toBe(false);
});
