import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('logic records follow difficulty and mode while preserving legacy data and backups', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (!localStorage.getItem('pg-arcade-progress-v1')) localStorage.setItem('pg-arcade-progress-v1', JSON.stringify({ records: { hanoi: 999 } }));
  });
  await page.goto('./#/jogar/hanoi');
  const settings = page.locator('.lc-settings');
  const stats = page.locator('.lc-stats');
  await expect(stats).toContainText('Recorde 0');
  await settings.getByLabel('Dificuldade', { exact: true }).selectOption('0');
  async function win() {
    const towers = page.locator('.lc-towers button');
    for (const [from, to] of [[0,2],[0,1],[2,1],[0,2],[1,0],[1,2],[0,2]]) {
      await towers.nth(from).click(); await towers.nth(to).click();
    }
    await expect(page.locator('.lc-success')).toContainText('Desafio vencido!');
    await expect(stats).toContainText('Recorde 100');
  }
  await win();
  await settings.getByLabel('Modo', { exact: true }).selectOption('serie');
  await expect(stats).toContainText('Recorde 0');
  await win();
  await settings.getByLabel('Dificuldade', { exact: true }).selectOption('1');
  await expect(stats).toContainText('Recorde 0');
  await page.reload();
  await settings.getByLabel('Dificuldade', { exact: true }).selectOption('0');
  await expect(stats).toContainText('Recorde 100');
  await expect(page.locator('.lc-success')).toHaveCount(0);
  await expect(page.locator('.lc-towers button').first()).toContainText('3');
  await page.screenshot({ path: testInfo.outputPath('logic-records-hanoi.png'), fullPage: true });
  await page.goto('./#/progresso');
  const region = page.getByRole('region', { name: 'Recordes por modo e dificuldade' });
  await expect(region).toContainText('Fácil · Desafio livre');
  await expect(region).toContainText('Fácil · Série de 5 desafios');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Salvar cópia do progresso' }).click()]);
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(exported.records.hanoi).toBe(999);
  expect(exported.recordsV2).toEqual({ 'hanoi|free|0-livre': 100, 'hanoi|free|0-serie': 100 });
  await page.getByLabel('Restaurar cópia do progresso').setInputFiles({ name: 'logic.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) });
  await expect(page.locator('.progress-backup [role=status]')).toContainText('Progresso restaurado.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('bot discovery includes solo opponents without inventing local multiplayer', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Contra o bot', exact: true }).click();
  await expect(page.locator('.game-card')).toHaveCount(8);
  for (const id of ['nim', 'reversi', 'pontes']) await expect(page.locator(`[data-catalog-game="${id}"]`)).toBeVisible();
  await page.getByRole('combobox', { name: 'Filtrar por modo', exact: true }).selectOption('Dupla local');
  await expect(page.locator('.game-card')).toHaveCount(5);
  for (const id of ['nim', 'reversi', 'pontes']) await expect(page.locator(`[data-catalog-game="${id}"]`)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
