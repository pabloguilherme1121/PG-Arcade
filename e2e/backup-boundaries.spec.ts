import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { games } from '../src/lib/catalog';
import { MAX_PROGRESS_BACKUP_BYTES } from '../src/lib/progressBackup';

test('the app restores and reimports its own complete calendar larger than the old limit', async ({ page }) => {
  const visits = Object.fromEntries(games.map(game => [game.id, Number.MAX_SAFE_INTEGER]));
  const days = Object.fromEntries(Array.from({ length: 400 }, (_, index) => [new Date(Date.UTC(2025,0,index+1)).toISOString().slice(0,10), visits]));
  const data = { favorites: ['snake'], records: { snake: 22 }, dailyActivity: { version: 1, days } };
  const buffer = Buffer.from(JSON.stringify(data, null, 2));
  expect(buffer.length).toBeGreaterThan(512000);
  expect(buffer.length).toBeLessThan(MAX_PROGRESS_BACKUP_BYTES);
  await page.goto('./#/progresso');
  const input = page.getByLabel('Restaurar cópia do progresso', { exact: true });
  await input.setInputFiles({ name: 'calendar.json', mimeType: 'application/json', buffer });
  await expect(page.locator('.progress-backup [role=status]')).toContainText('Progresso restaurado');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Salvar cópia do progresso', exact: true }).click();
  const download = await downloadEvent;
  const exported = await readFile((await download.path())!);
  const backup = JSON.parse(exported.toString());
  expect(backup.records.snake).toBe(22);
  expect(backup.favorites).toEqual(['snake']);
  expect(Object.keys(backup.dailyActivity.days)).toHaveLength(400);
  await input.setInputFiles({ name: 'exported.json', mimeType: 'application/json', buffer: exported });
  await expect(page.locator('.progress-backup [role=status]')).toContainText('Progresso restaurado');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!).records.snake)).toBe(22);
});

test('oversized backup is rejected without mutating either progress store', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pg-arcade-progress-v1', JSON.stringify({favorites:['snake'],visits:{snake:7},records:{snake:22},last:'snake'}));
    localStorage.setItem('pg-arcade-daily-v1', JSON.stringify({version:1,days:{[new Date().toISOString().slice(0,10)]:{snake:7}}}));
  });
  await page.goto('./#/progresso');
  await expect(page.getByLabel('Restaurar cópia do progresso', { exact: true })).toBeVisible();
  const before = await page.evaluate(() => [localStorage.getItem('pg-arcade-progress-v1'), localStorage.getItem('pg-arcade-daily-v1')]);
  await page.getByLabel('Restaurar cópia do progresso', { exact: true }).setInputFiles({name:'oversized.json',mimeType:'application/json',buffer:Buffer.alloc(MAX_PROGRESS_BACKUP_BYTES+1,32)});
  await expect(page.locator('.progress-backup [role=status]')).toContainText('até 3 MiB');
  expect(await page.evaluate(() => [localStorage.getItem('pg-arcade-progress-v1'), localStorage.getItem('pg-arcade-daily-v1')])).toEqual(before);
});
