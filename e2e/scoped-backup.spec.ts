import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('backup imports, merges and exports scoped records without inventing legacy results', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./#/progresso');
  const restore = page.getByLabel('Restaurar cópia do progresso');
  async function importRecords(recordsV2: Record<string, number>) {
    await restore.setInputFiles({ name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ favorites: [], records: {}, recordsV2 })) });
    await expect(page.getByRole('status').filter({ hasText: 'Progresso restaurado.' })).toBeVisible();
  }
  await importRecords({ 'memoria|free|4-900': 6, '2048|free|hard': 100 });
  await expect(page.getByRole('region', { name: 'Recordes por modo e dificuldade' })).toContainText('4 pares');
  await expect(page.getByRole('button', { name: 'Com recorde (2)', exact: true })).toBeVisible();
  await importRecords({ 'memoria|free|4-900': 8, '2048|free|hard': 80, 'blocos|free|invalid': 999, 'blocos|free|2': 200, 'snake|marathon-hard|classic-100-progressive': 10 });
  await expect(page.getByRole('button', { name: 'Com recorde (4)', exact: true })).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Salvar cópia do progresso' }).click()]);
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(exported.records).toEqual({});
  expect(exported.recordsV2).toEqual({ 'memoria|free|4-900': 6, '2048|free|hard': 100, 'blocos|free|2': 200, 'snake|marathon-hard|classic-100-progressive': 10 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Com recorde (4)', exact: true })).toBeVisible();
});
