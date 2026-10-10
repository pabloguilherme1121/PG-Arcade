import { test, expect } from '@playwright/test';
import { games } from '../src/lib/catalog';
import type { MotionState } from '../src/lib/motionExpansion';
test.use({ hasTouch: true });
const controls = '.player :is(.player-toolbar,.game-actions,.session-options,.new-actions,.action-footer,.action-controls,.motion-controls,.wide-controls,.dpad,.casual-controls) button';
for (const width of [320, 390]) test(`all 100 games have reachable touch controls at ${width}px`, async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const game of games) {
    await page.goto(`./#/jogar/${game.id}`);
    await expect(page.locator('[data-arcade-arena]').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    if (await page.locator('.action-settings').count())
      await page.getByRole('combobox', { name: 'Modo', exact: true }).selectOption('endless');
    const defects = await page.locator(controls).evaluateAll(buttons => buttons.flatMap(button => {
      const r = button.getBoundingClientRect();
      if (!r.width || !r.height) return [];
      return r.width < 44 || r.height < 44 ? [`${button.textContent}: ${r.width}x${r.height}`] : [];
    }));
    expect(defects, game.id).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), game.id).toBe(true);
    const sizes = await page.locator('.player select').evaluateAll(elements => elements.map(e => parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.every(size => size >= 16), game.id).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('a fast motion tap reaches physics once and cancelled direction stays released', async ({ page }) => {
  await page.addInitScript(() => {
    const clone = structuredClone.bind(window);
    let active = false, pulses = 0;
    window.structuredClone = ((value: unknown, options?: StructuredSerializeOptions) => {
      const result = clone(value, options) as MotionState;
      if (result?.id === 'turret') {
        if (result.lastAction && !active) pulses++;
        active = result.lastAction;
        Object.assign(window, { motionSample: result, motionPulses: pulses });
      }
      return result;
    }) as typeof structuredClone;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/jogar/turret');
  await expect(page.locator('canvas')).toBeVisible();
  const now = new Date('2026-10-09T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(new Date(+now + 1000));
  await page.getByRole('button', { name: 'Começar', exact: true }).click();
  await page.clock.runFor(100);
  const sample = () => page.evaluate(() => (window as unknown as { motionSample: MotionState }).motionSample);
  const angle = (await sample()).angle;
  const right = page.getByRole('button', { name: 'Direita →', exact: true });
  await right.tap();
  await page.clock.runFor(50);
  expect((await sample()).angle).toBeGreaterThan(angle);
  const stopped = (await sample()).angle;
  await page.clock.runFor(100);
  expect((await sample()).angle).toBeCloseTo(stopped, 6);
  await right.dispatchEvent('pointerdown', { pointerId: 2, pointerType: 'touch' });
  await right.dispatchEvent('pointercancel', { pointerId: 2, pointerType: 'touch' });
  await page.clock.runFor(100);
  expect((await sample()).angle).toBeCloseTo(stopped, 6);
  const action = page.getByRole('button', { name: 'Ação', exact: true });
  await action.hover();
  await page.mouse.down();
  await action.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' });
  await page.mouse.up();
  await page.clock.runFor(100);
  expect(await page.evaluate(() => (window as unknown as { motionPulses: number }).motionPulses)).toBe(0);
  await expect(action).not.toHaveAttribute('data-held', 'true');
  await action.tap();
  await page.clock.runFor(100);
  const pulses = () => page.evaluate(() => (window as unknown as { motionPulses: number }).motionPulses);
  expect(await pulses()).toBe(1);
  await action.dispatchEvent('click', { detail: 1 });
  await page.clock.runFor(100);
  expect(await pulses()).toBe(1);
  await action.dispatchEvent('click', { detail: 0 });
  await page.clock.runFor(100);
  expect(await pulses()).toBe(2);
});
