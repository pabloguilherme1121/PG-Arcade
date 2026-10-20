import { expect, test } from "@playwright/test";

test.describe("catalog touch readability", () => {
  test.use({ hasTouch: true });

  test("all game cards retain readable labels and reachable favorites on narrow screens", async ({ page, browserName }) => {
    // Firefox needs longer when laying out 101 SVG covers at four viewport widths.
    if (browserName === "firefox") test.setTimeout(120_000);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("./");
    const cards = page.locator(".game-grid .game-card");
    await expect(cards).toHaveCount(101);
    for (const width of [320, 360, 390, 430]) {
      if (width !== 320) await page.setViewportSize({ width, height: 800 });
      const metrics = await cards.evaluateAll((elements) => elements.map(card => {
        const category = card.querySelector<HTMLElement>(".game-category")!;
        const description = card.querySelector<HTMLElement>("p")!;
        const modeTags = Array.from(card.querySelectorAll<HTMLElement>(".card-mode-tags span"));
        const favorite = card.querySelector<HTMLElement>(".favorite")!;
        const rect = favorite.getBoundingClientRect();
        return {
          categoryFont: parseFloat(getComputedStyle(category).fontSize),
          modeFonts: modeTags.map(tag => parseFloat(getComputedStyle(tag).fontSize)),
          descriptionFont: parseFloat(getComputedStyle(description).fontSize),
          categoryFits: category.scrollWidth <= category.clientWidth + 1,
          favoriteWidth: rect.width,
          favoriteHeight: rect.height,
        };
      }));
      expect(metrics.every(card => card.categoryFont >= 12 && card.descriptionFont >= 12), `text readability at ${width}px`).toBe(true);
      expect(metrics.every(card => card.modeFonts.every(size => size >= 12)), `mode label readability at ${width}px`).toBe(true);
      expect(metrics.every(card => card.categoryFits), `category wrapping at ${width}px`).toBe(true);
      expect(metrics.every(card => card.favoriteWidth >= 44 && card.favoriteHeight >= 44), `touch targets at ${width}px`).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `horizontal overflow at ${width}px`).toBe(true);
    }
    const card = cards.first();
    await card.locator(".favorite").tap();
    await expect(card).toHaveCSS("transform", "none");
    await card.locator(".game-link").tap();
    await expect(page.locator("[data-arcade-arena]")).toBeVisible();
  });
});
