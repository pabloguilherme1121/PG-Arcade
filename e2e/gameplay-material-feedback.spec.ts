import { test, expect } from "@playwright/test";

// This spec exercises locator.tap(); desktop browser projects need an explicit touch context.
test.use({ hasTouch: true });

test("the original, board and logic families share readable material HUD styling on touch", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const [id, selector] of [
    ["2048", ".scores > div"],
    ["flood", ".new-hud > span"],
    ["sudoku", ".lc-stats"],
  ] as const) {
    await page.goto(`./#/jogar/${id}`);
    const metric = page.locator(`[data-arcade-arena] ${selector}`).first();
    await expect(metric).toBeVisible();
    const styles = await metric.evaluate(el => {
      const s = getComputedStyle(el);
      return {
        background: s.backgroundImage,
        border: s.borderTopColor,
        box: s.boxShadow,
        fontVariant: s.fontVariantNumeric,
      };
    });
    expect(styles.background, id).toContain("linear-gradient");
    expect(styles.box, id).not.toBe("none");
    expect(styles.fontVariant, id).toContain("tabular-nums");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), id).toBe(true);
  }
});

test("touch boards keep lightweight feedback and respect reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/flood");
  const cell = page.locator(".new-grid button:enabled").first();
  await expect(cell).toBeVisible();
  const initialColor = await cell.getAttribute("data-value");
  const nextColor = page.locator(`.new-grid button:enabled:not([data-value="${initialColor}"])`).first();
  await expect(nextColor).toBeVisible();
  expect(await nextColor.evaluate(el => getComputedStyle(el).touchAction)).toBe("manipulation");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await nextColor.evaluate(el => getComputedStyle(el).transitionDuration)).toMatch(/^0s(?:, 0s)*$/);
  await nextColor.tap();
  await expect(page.locator(".new-hud strong").first()).not.toHaveText("0");
});
