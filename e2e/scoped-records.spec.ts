import { expect, test } from '@playwright/test';

test('2048 separates difficulties and timed sessions, retaining old records through reload', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('pg-arcade-progress-v1', JSON.stringify({ records: { '2048': 9999, memoria: 4 } })));
  await page.reload();
  await page.goto('./#/jogar/2048');
  const best = page.locator('.scores strong').nth(1);
  await expect(best).toHaveText('0');
  await page.getByLabel('Dificuldade do 2048').selectOption('easy');
  await page.locator('.board2048').press('ArrowLeft');
  await expect(best).toHaveText('4');
  await page.getByLabel('Dificuldade do 2048').selectOption('hard');
  await expect(best).toHaveText('0');
  await page.getByLabel('Dificuldade do 2048').selectOption('easy');
  await expect(best).toHaveText('4');
  await page.getByLabel('Modo de sessão', { exact: true }).selectOption('sprint');
  await expect(best).toHaveText('0');
  await page.getByRole('button', { name: 'Iniciar desafio de tempo', exact: true }).click();
  await page.getByLabel('Dificuldade do 2048').selectOption('easy');
  await page.locator('.board2048').press('ArrowLeft');
  await expect(best).toHaveText('4');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!).recordsV2)).toEqual({ '2048|free|easy': 4, '2048|sprint-normal|easy': 4 });
  await page.getByRole('button', { name: 'Pausar sessão', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar à sessão livre', exact: true }).click();
  await expect(page.locator('.scores strong').first()).toHaveText('0');
  await page.reload();
  await page.getByLabel('Dificuldade do 2048').selectOption('easy');
  await expect(best).toHaveText('4');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!).records)).toEqual({ '2048': 9999, memoria: 4 });
  await page.goto('./#/progresso');
  await expect(page.getByRole('region', { name: 'Recordes por modo e dificuldade' })).toContainText('Sprint · Normal · Fácil');
});

test('scoped records still work when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
    Storage.prototype.setItem = () => { throw new Error('blocked'); };
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
  });
  await page.goto('./#/jogar/2048');
  await page.locator('.board2048').press('ArrowLeft');
  await expect(page.locator('.scores strong').nth(1)).toHaveText('4');
});
