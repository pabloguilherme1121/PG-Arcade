import { test, expect } from "@playwright/test";
import type { MotionState } from "../src/lib/motionExpansion";

for (const ending of ["pointer loss", "animation win"] as const) {
  test(`balloon records survive ${ending} exactly once`, async ({ page }) => {
    // Seed the first simulation snapshot, leaving the real pointer/animation,
    // terminal transition and persistence paths in control of the outcome.
    await page.addInitScript((ending) => {
      const clone = window.structuredClone.bind(window);
      let seeded = false;
      window.structuredClone = ((value: unknown, options?: StructuredSerializeOptions) => {
        const result = clone(value, options) as MotionState;
        if (!seeded && result?.id === "balloons" && result.status === "running") {
          seeded = true;
          result.score = 88;
          result.spawn = 100;
          result.invulnerability = 0;
          result.lives = ending === "pointer loss" ? 1 : 3;
          result.time = ending === "animation win" ? 44.99 : 0;
          result.objects = ending === "pointer loss" ? [{
            x: 240, y: 200, vx: 0, vy: 0, r: 24, kind: "bomb",
            lane: 0, active: true,
          }] : [];
        }
        return result;
      }) as typeof structuredClone;
      const setItem = Storage.prototype.setItem;
      (window as unknown as { recordWrites: number }).recordWrites = 0;
      Storage.prototype.setItem = function (key, value) {
        if (key === "pg-arcade-progress-v1" && JSON.parse(value).records?.balloons > 0)
          (window as unknown as { recordWrites: number }).recordWrites++;
        return setItem.call(this, key, value);
      };
    }, ending);
    const now = new Date("2026-10-06T12:00:00Z");
    await page.clock.install({ time: now });
    await page.clock.pauseAt(new Date(now.getTime() + 1000));
    await page.goto("./#/jogar/balloons");
    const game = page.locator('[data-new-game="balloons"]');
    await game.getByRole("button", { name: "Começar", exact: true }).click();
    await page.clock.runFor(150);
    if (ending === "pointer loss") {
      const canvas = game.locator("canvas");
      const box = (await canvas.boundingBox())!;
      await canvas.click({ position: { x: box.width / 2, y: box.height * 200 / 380 } });
    }
    await expect(game.locator(".motion-overlay")).toContainText(
      ending === "pointer loss" ? "Fim da tentativa" : "Desafio concluído!",
    );
    const expected = ending === "pointer loss" ? 88 : 388;
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem("pg-arcade-progress-v1")!).records.balloons,
    )).toBe(expected);
    await page.clock.runFor(1000);
    expect(await page.evaluate(() =>
      (window as unknown as { recordWrites: number }).recordWrites,
    )).toBe(1);
  });
}

test("moving focus to a motion control releases held canvas keys", async ({ page }) => {
  await page.addInitScript(() => {
    const clone = window.structuredClone.bind(window);
    window.structuredClone = ((value: unknown, options?: StructuredSerializeOptions) => {
      const result = clone(value, options) as MotionState;
      if (result?.id === "turret")
        (window as unknown as { motionAngle: number }).motionAngle = result.angle;
      return result;
    }) as typeof structuredClone;
  });
  const now = new Date("2026-10-06T12:00:00Z");
  await page.clock.install({ time: now });
  await page.clock.pauseAt(new Date(now.getTime() + 1000));
  await page.goto("./#/jogar/turret");
  const game = page.locator('[data-new-game="turret"]');
  await game.getByRole("button", { name: "Começar", exact: true }).click();
  await expect(game.locator("canvas")).toBeFocused();
  await page.keyboard.down("ArrowRight");
  await page.clock.runFor(150);
  await page.keyboard.press("Tab");
  await expect(game.getByRole("button", { name: "← Esquerda", exact: true })).toBeFocused();
  await page.keyboard.up("ArrowRight");
  await page.clock.runFor(50);
  const stopped = await page.evaluate(() =>
    (window as unknown as { motionAngle: number }).motionAngle,
  );
  await page.clock.runFor(300);
  const later = await page.evaluate(() =>
    (window as unknown as { motionAngle: number }).motionAngle,
  );
  expect(later).toBeCloseTo(stopped, 6);
  await expect(game.locator(".motion-overlay")).not.toBeVisible();
});
