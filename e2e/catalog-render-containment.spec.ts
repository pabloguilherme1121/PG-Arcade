import { expect, test } from "@playwright/test";

for (const width of [320, 390]) {
  test("catalog preserves 102 covers and keyboard activation at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");

    const cards = page.locator(".game-grid [data-catalog-game]");
    await expect(cards).toHaveCount(102);

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
    // Hash navigation can detach the element while Playwright waits for a
    // navigation event. The next two assertions still require real activation.
    await link.press("Enter", { noWaitAfter: true });
    await expect(page).toHaveURL(new RegExp("#/jogar/" + id + "$"));
    await expect(page.locator("[data-arcade-arena][data-game-id='" + id + "']")).toBeVisible();

    await page.goto("./");
    await expect(cards).toHaveCount(102);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
