import { test, expect } from "@playwright/test";
import { CATALOG_SIZE } from "../src/lib/catalogRelease";

test.use({ hasTouch: true });

for (const width of [320, 390]) {
  test(`favoritos do catálogo preservam touch e teclado com um único glifo leve em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const cards = page.locator(".game-grid [data-catalog-game]");
    await expect(cards).toHaveCount(CATALOG_SIZE);

    const favorites = cards.locator("button.favorite");
    await expect(favorites).toHaveCount(CATALOG_SIZE);
    // Regressão de desempenho: favs não podem recriar 150 SVGs do Lucide.
    expect(await favorites.locator("svg").count()).toBe(0);
    expect(await favorites.locator('[aria-hidden="true"].favorite-glyph').count()).toBe(CATALOG_SIZE);

    const first = favorites.first();
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await expect(first.locator(".favorite-glyph")).toHaveText("♥");

    await first.tap();
    await expect(first).toHaveAttribute("aria-pressed", "false");
    await expect(first.locator(".favorite-glyph")).toHaveText("♡");

    const last = favorites.last();
    await last.scrollIntoViewIfNeeded();
    await last.tap();
    await expect(last).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
