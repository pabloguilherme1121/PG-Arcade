import { expect, test } from '@playwright/test';

for (const { width, interruption, difficulty, reelTicks, before, after } of [
  { width: 320, interruption: 'button', difficulty: 0, reelTicks: 1, before: 15, after: 10 },
  { width: 390, interruption: 'lifecycle', difficulty: 2, reelTicks: 8, before: 7, after: 4 },
] as const) {
  test(`fishing resumes without replaying physics at ${width}px (${interruption})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./#/jogar/pesca');
    await page.locator('.casual-options').getByLabel('Dificuldade', { exact: true }).selectOption(String(difficulty));
    await page.getByLabel('Formato da sessão', { exact: true }).selectOption('treino');
    await page.getByRole('button', { name: 'Iniciar sessão', exact: true }).click();
    const now = new Date('2026-10-17T12:00:00Z');
    await page.clock.install({ time: new Date(now.getTime() - 60000) });
    await page.clock.pauseAt(now);
    await page.getByRole('button', { name: 'Lançar linha', exact: true }).click();
    await page.clock.runFor((18 + difficulty * 6) * 150);
    await page.getByRole('button', { name: 'Fisgar', exact: true }).click();
    for (let tick = 0; tick < reelTicks; tick++) await page.clock.runFor(150);
    const scene = page.locator('.fishing-scene');
    const tension = scene.locator('meter');
    await expect(tension).toHaveAttribute('value', String(before));
    await expect(scene).toContainText('Distância: 100%');
    for (let cycle = 0; cycle < 3; cycle++) {
      if (interruption === 'button') await page.getByRole('button', { name: 'Pausar', exact: true }).click();
      else await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
      await expect(page.getByRole('button', { name: 'Continuar pesca', exact: true })).toBeVisible();
      await page.clock.runFor(3000);
      await expect(tension).toHaveAttribute('value', String(before));
      await page.getByRole('button', { name: 'Continuar pesca', exact: true }).click();
      await expect(tension).toHaveAttribute('value', String(before));
      await expect(scene).toContainText('Distância: 100%');
    }
    await page.clock.runFor(150);
    await expect(tension).toHaveAttribute('value', String(after));
    await page.getByRole('button', { name: 'Recolher linha', exact: true }).click();
    await expect(scene).not.toContainText('Distância: 100%');
    expect(Number(await tension.getAttribute('value'))).toBeGreaterThan(after);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('fishing-resumed.png'), fullPage: true });
  });
}
