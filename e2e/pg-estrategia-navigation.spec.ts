import { test, expect } from '@playwright/test';

test('PG Estratégia mantém foco num botão jogável após lance por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./estrategia/#est-026');
  const playable = page.locator('#battlefield button:enabled');
  await expect(playable.first()).toBeVisible();
  await playable.first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#arena-turn')).toContainText('1 /');
  await expect.poll(() => page.evaluate(() => {
    const active = document.activeElement;
    return Boolean(active?.matches('#battlefield button:not(:disabled)'));
  })).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});