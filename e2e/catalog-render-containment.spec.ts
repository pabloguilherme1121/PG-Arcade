import { expect, test } from "@playwright/test";

for (const width of [320, 390]) {
  test("catalog preserves 101 covers and keyboard activation at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");

    const cards = page.locator(".game-grid [data-catalog-game]");
    await expect(cards).toHaveCount(101);

    const last = cards.last();
    await last.scrollIntoViewIfNeeded();
    const link = last.locator("a.game-link");
    await expect(link).toBeVisible();

    const bounds = await last.locator(".game-cover").boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.width).toBeGreaterThan(1);
    expect(bounds!.height).toBeGreaterThan(1);

    const id = await last.getAttribute("data-catalog-game");
    await link.focus();
    await expect(link).toBeFocused();
    expect(id).toBeTruthy();
    // Activate the focused link like a keyboard user. Firefox may detach the
    // old locator during navigation; do not issue a second pointer click.
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-arcade-arena][data-game-id='" + id + "']")).toBeVisible();

    await page.goto("./");
    await expect(cards).toHaveCount(101);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
