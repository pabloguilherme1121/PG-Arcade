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


test('PG Arcade encaminha para o PG Bot do Estratégia sem novo serviço', async ({ page }) => {
  await page.goto('./');
  const link = page.getByRole('link', { name: 'PG Bot · Suporte' });
  await expect(link).toHaveAttribute('href', /estrategia\/\?ajuda=1$/);
  await link.click();
  await expect(page).toHaveURL(/estrategia\/\?ajuda=1$/);
  await expect(page.getByRole('dialog', { name: 'PG Bot, suporte do jogo' })).toBeVisible();
});


test('PG Estratégia reabre a última missão após reload sem perder o catálogo', async ({ page }) => {
  await page.goto('./estrategia/');
  await expect(page.locator('#resume')).toBeHidden();
  await page.locator('[data-open="est-001"]').click();
  await page.locator('#exit').click();
  await expect(page.locator('#resume')).toBeVisible();
  await page.reload();
  await page.locator('#resume').click();
  await expect(page.locator('#arena-id')).toHaveText('EST-001');
  await expect(page.locator('#arena')).toBeVisible();
});
