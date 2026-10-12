import { expect, test } from "@playwright/test";

test("canvas redraws only when its physical resolution changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/runner");
  const canvas = page.locator("canvas[data-expanded-board]");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(120); // let the initial ResizeObserver callback complete

  const initial = await canvas.evaluate(element => {
    const c = element as HTMLCanvasElement;
    const context = c.getContext("2d")!;
    let repaints = 0;
    const fillRect = context.fillRect.bind(context);
    context.fillRect = (...args) => {
      repaints++;
      fillRect(...args);
    };
    Object.assign(window, {
      __arcadeRepaints: () => repaints,
      __arcadeResetRepaints: () => { repaints = 0; },
    });
    return { width: c.width, height: c.height };
  });

  await page.evaluate(() => {
    for (let i = 0; i < 6; i++) window.dispatchEvent(new Event("resize"));
  });
  expect(await page.evaluate(() =>
    (window as unknown as { __arcadeRepaints: () => number }).__arcadeRepaints()
  )).toBe(0);

  await page.setViewportSize({ width: 320, height: 844 });
  await expect.poll(async () => canvas.evaluate(c => c.width), { timeout: 5_000 })
    .not.toBe(initial.width);
  expect(await page.evaluate(() =>
    (window as unknown as { __arcadeRepaints: () => number }).__arcadeRepaints()
  )).toBeGreaterThan(0);
  const resized = await canvas.evaluate(c => ({ width: c.width, height: c.height }));
  expect(resized.width).toBeGreaterThan(0);
  expect(resized.height).toBeGreaterThan(0);

  await page.evaluate(() => (window as unknown as { __arcadeResetRepaints: () => void }).__arcadeResetRepaints());
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  expect(await page.evaluate(() =>
    (window as unknown as { __arcadeRepaints: () => number }).__arcadeRepaints()
  )).toBe(0);
});
