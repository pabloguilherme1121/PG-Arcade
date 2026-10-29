import { test, expect } from '@playwright/test';

test.use({ hasTouch: true });

for (const width of [320, 390]) {
  test(`PG Estratégia preserva foco após favoritar com Enter em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 780 });
    await page.goto('./estrategia/');

    const favorite = page.locator('[data-star="est-001"]');
    await favorite.focus();
    await page.keyboard.press('Enter');

    await expect(favorite).toHaveAttribute('aria-pressed', 'true');
    await expect(favorite).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-open="est-002"]')).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('PG Estratégia retorna foco à busca se o favorito some do filtro', async ({ page }) => {
  await page.goto('./estrategia/');
  await page.locator('[data-star="est-001"]').click();
  await page.locator('#family-tabs button[data-filter="favorites"]').click();

  const favorite = page.locator('[data-star="est-001"]');
  await favorite.focus();
  await page.keyboard.press('Enter');

  await expect(favorite).toHaveCount(0);
  await expect(page.locator('#search')).toBeFocused();
});
