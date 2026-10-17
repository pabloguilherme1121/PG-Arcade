import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('casual records separate completed formats and difficulties without rewriting legacy scores', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    Math.random = () => 0;
    if (!localStorage.getItem('pg-arcade-progress-v1')) localStorage.setItem('pg-arcade-progress-v1', JSON.stringify({ records: { dados: 999 } }));
  });
  await page.goto('./#/jogar/dados');
  const hud = page.locator('.casual-hud');
  await expect(hud).toContainText('Recorde 0');
  await page.getByLabel('Dificuldade', { exact: true }).selectOption('0');
  await page.getByLabel('Formato da sessão', { exact: true }).selectOption('treino');
  await page.getByRole('button', { name: 'Iniciar sessão', exact: true }).click();
  await expect(page.getByLabel('Formato da sessão', { exact: true })).toBeDisabled();
  for (let round = 0; round < 5; round++) {
    await page.getByRole('button', { name: 'Lançar dados', exact: true }).click();
    await page.getByRole('button', { name: 'Registrar combinação', exact: true }).click();
  }
  await expect(page.locator('.casual-suite > [role=status]')).toContainText('Sessão concluída com 525 pontos.');
  await expect(hud).toContainText('Recorde 525');
  await page.getByLabel('Formato da sessão', { exact: true }).selectOption('maratona');
  await expect(hud).toContainText('Recorde 0');
  await page.getByLabel('Formato da sessão', { exact: true }).selectOption('treino');
  await expect(hud).toContainText('Recorde 525');
  await page.getByLabel('Dificuldade', { exact: true }).selectOption('2');
  await expect(hud).toContainText('Recorde 0');
  await page.reload();
  await page.getByLabel('Dificuldade', { exact: true }).selectOption('0');
  await page.getByLabel('Formato da sessão', { exact: true }).selectOption('treino');
  await expect(hud).toContainText('Recorde 525');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!));
  expect(saved.records.dados).toBe(999);
  expect(saved.recordsV2).toEqual({ 'dados|free|0-treino': 525 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await hud.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('casual-records-320.png') });
  await page.goto('./#/progresso');
  await expect(page.getByRole('region', { name: 'Recordes por modo e dificuldade' })).toContainText('Fácil · Treino · 5 rodadas');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Salvar cópia do progresso' }).click()]);
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(exported.records.dados).toBe(999);
  expect(exported.recordsV2).toEqual(saved.recordsV2);
  await page.getByLabel('Restaurar cópia do progresso').setInputFiles({ name: 'casual.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) });
  await expect(page.locator('.progress-backup [role=status]')).toContainText('Progresso restaurado.');
});
