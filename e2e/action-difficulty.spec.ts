import { expect, test } from '@playwright/test';

for (const [width, id] of [[320, 'voo'], [390, 'jetpack']] as const) {
  test(`action difficulty explains five levels and locks the active configuration at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./#/jogar/${id}`);
    const difficulty = page.locator('.action-settings').getByLabel('Dificuldade', { exact: true });
    const details = page.locator('#action-difficulty-details');
    for (const [value, lives, pressure] of [['easy', 5, 70], ['normal', 3, 100], ['hard', 3, 140], ['master', 2, 158], ['expert', 2, 172]] as const) {
      await difficulty.selectOption(value);
      await expect(details).toContainText(`${lives} vidas`);
      await expect(details).toContainText(`${pressure}%`);
    }
    const mode = page.locator('.action-settings').getByLabel('Modo', { exact: true });
    await mode.selectOption('endless');
    await expect(page.locator('.action-objective')).toContainText('Sem limite');
    const now = new Date('2026-10-17T12:00:00Z');
    await page.clock.install({ time: new Date(now.getTime() - 60000) });
    await page.clock.pauseAt(now);
    await page.getByRole('button', { name: 'Começar', exact: true }).click();
    await page.clock.runFor(150);
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await expect(difficulty).toBeDisabled();
    await expect(mode).toBeDisabled();
    await expect(details).toContainText('2 vidas');
    await page.screenshot({ path: testInfo.outputPath('action-difficulty.png'), animations: 'disabled' });
    await page.getByRole('button', { name: 'Nova partida', exact: true }).click();
    await expect(difficulty).toBeEnabled();
    await expect(mode).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('action results stay within their mode and difficulty without replacing legacy records', async ({ page }) => {
  // Twelve seconds of fixed-step physics plus trace capture can exceed the
  // default wall-clock limit on a shared WebKit runner. Keep all record checks.
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    if (!localStorage.getItem('pg-arcade-progress-v1')) localStorage.setItem('pg-arcade-progress-v1', JSON.stringify({
      records: { runner: 999 }, recordsV2: { 'runner|free|normal-mission': 25, 'runner|free|normal-endless': 500 },
    }));
  });
  await page.goto('./#/jogar/runner');
  const record = page.locator('.action-hud span').filter({ hasText: /^Recorde/ }).locator('strong');
  await expect(record).toHaveText('25');
  const now = new Date('2026-10-17T12:00:00Z');
  await page.clock.install({ time: new Date(now.getTime() - 60000) });
  await page.clock.pauseAt(now);
  await page.getByRole('button', { name: 'Começar', exact: true }).click();
  const replay = page.getByRole('button', { name: 'Jogar novamente', exact: true });
  // WebKit may throttle RAF independently of the virtual clock. Advance in
  // bounded chunks until the actual fixed-step engine reports completion.
  for (let step = 0; step < 8 && !await replay.isVisible(); step++) {
    await page.clock.runFor(3000);
  }
  await expect(replay).toBeVisible();
  const score = Number(await page.locator('.action-hud strong').first().textContent());
  expect(score).toBeGreaterThan(25);
  await expect(record).toHaveText(String(score));
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!).recordsV2['runner|free|normal-mission'])).toBe(score);
  const settings = page.locator('.action-settings');
  await settings.getByLabel('Modo', { exact: true }).selectOption('endless');
  await expect(record).toHaveText('500');
  await settings.getByLabel('Dificuldade', { exact: true }).selectOption('hard');
  await expect(record).toHaveText('0');
  await page.clock.resume();
  await page.reload();
  await expect(record).toHaveText(String(score));
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('pg-arcade-progress-v1')!));
  expect(progress.records.runner).toBe(999);
  expect(progress.recordsV2).toEqual({ 'runner|free|normal-mission': score, 'runner|free|normal-endless': 500 });
});
