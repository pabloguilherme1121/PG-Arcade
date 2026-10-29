import { test, expect } from '@playwright/test';

test('PG Bot oferece ajuda em 320 px, teclado e durante uma missão', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./estrategia/');
  const open = page.getByRole('button', { name: 'Abrir PG Bot' });
  await expect(open).toBeVisible();
  await open.click();
  const dialog = page.getByRole('dialog', { name: 'PG Bot, suporte do jogo' });
  await expect(dialog).toBeVisible();
  await page.getByRole('textbox', { name: 'Perguntar ao PG Bot' }).fill('Como salvo meu progresso?');
  await page.getByRole('button', { name: 'Perguntar', exact: true }).click();
  await expect(dialog).toContainText(/sem sincronização/i);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();

  await page.goto('./estrategia/#est-076');
  await expect(page.locator('#arena')).toBeVisible();
  await page.getByRole('button', { name: 'Ajuda do PG Bot' }).click();
  await expect(dialog).toBeVisible();
  await page.getByRole('button', { name: 'Dica da missão' }).click();
  await expect(dialog).toContainText(/pista|torres/i);
  await page.getByRole('button', { name: 'Fechar PG Bot' }).click();
  await expect(page.locator('#arena')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
