import { expect, test } from "@playwright/test";

for (const width of [320, 390]) {
  test("render containment preserves all cards, keyboard focus and covers at " + width + "px", async ({ page }) => {
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

    await link.focus();
    await expect(link).toBeFocused();
    const id = await last.getAttribute("data-catalog-game");
    expect(id).toBeTruthy();
    await link.click();
    await expect(page.locator("[data-arcade-arena][data-game-id='" + id + "']")).toBeVisible();

    await page.goto("./");
    await expect(cards).toHaveCount(101);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
