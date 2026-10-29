import { test, expect } from '@playwright/test';

test('PG Bot responde no PG Estratégia sem cobrir a arena no celular', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./estrategia/');
  await page.getByRole('button', { name: 'Ajuda do PG Bot' }).click();
  const bot = page.locator('pg-bot-support');
  await expect(bot.locator('details')).toHaveAttribute('open', '');
  await bot.getByRole('button', { name: 'Jogos e missões' }).click();
  await expect(bot.getByRole('status')).toContainText('não são 150 jogos independentes');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('./estrategia/#est-076');
  await expect(page.locator('#battlefield')).toBeHidden();
  await expect(page.locator('.defense-lane')).toHaveCount(3);
  await page.locator('.arena-bot-tip summary').click();
  await expect(page.locator('#arena-bot-text')).toContainText('pista');
});

test('PG Bot é operável por teclado no Arcade e mostra ajuda de controles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Ajuda do PG Bot' }).click();
  const bot = page.locator('pg-bot-support');
  await expect(bot.locator('details')).toHaveAttribute('open', '');
  await bot.getByRole('button', { name: 'Controles' }).focus();
  await page.keyboard.press('Enter');
  await expect(bot.getByRole('status')).toContainText('Opções da partida');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});