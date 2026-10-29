import { test, expect } from '@playwright/test';

test('PG Bot responde dúvidas e devolve foco ao launcher em 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./estrategia/');
  const launcher = page.getByRole('button', { name: 'Ajuda do PG Bot' });
  await launcher.click();
  const dialog = page.getByRole('dialog', { name: 'PG Bot' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Respostas prontas');
  await dialog.getByRole('button', { name: 'Como jogar' }).click();
  await expect(dialog.getByRole('status')).toContainText('150 missões utilizam seis sistemas');
  await dialog.getByRole('button', { name: 'Salvar progresso' }).click();
  await expect(dialog.getByRole('status')).toContainText('apenas neste navegador');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(launcher).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('PG Bot recebe acesso direto do PG Arcade em 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('link', { name: 'PG Bot · Ajuda dos jogos' }).click();
  await expect(page).toHaveURL(/\/estrategia\/\?ajuda=1$/);
  const dialog = page.getByRole('dialog', { name: 'PG Bot' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Jogar offline' }).click();
  await expect(dialog.getByRole('status')).toContainText('pelo menos uma vez');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});