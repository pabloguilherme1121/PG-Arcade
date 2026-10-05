import { test, expect } from "@playwright/test";
import { games } from "../src/lib/catalog";

for (const preference of ["system", "saved"] as const) {
  test(`${preference} reduced motion freezes canvas decoration while gameplay advances`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference === "system" ? "reduce" : "no-preference" });
    await page.addInitScript((saved) => {
      if (saved) localStorage.setItem("pg-arcade-preferences-v1", JSON.stringify({ motion: "reduced" }));
      const original = CanvasRenderingContext2D.prototype.fillRect;
      const samples: number[] = [];
      Object.assign(window, { decorationSamples: samples });
      CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
        // The first background star, independent of moving gameplay objects.
        if (x === 0 && w === 2 && h === 2) samples.push(y);
        return original.call(this, x, y, w, h);
      };
    }, preference === "saved");
    await page.goto("./#/jogar/asteroides");
    await expect(page.getByRole("button", { name: "Começar", exact: true })).toBeVisible();
    // Load lazy components before controlling React/game timers.
    const frozen = new Date("2026-10-05T02:00:00Z");
    await page.clock.install({ time: frozen });
    await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await page.clock.runFor(1100);
    await expect(page.locator(".action-hud")).toContainText("1 s");
    const samples = await page.evaluate(() => (window as unknown as { decorationSamples: number[] }).decorationSamples);
    expect(samples.length).toBeGreaterThan(10);
    expect(samples.every((y) => y === 0)).toBe(true);
  });
}

test("football keeps perspective after flight, cancels reset timers and supports instant reduced shots", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./#/jogar/futebol");
  const shoot = page.getByRole("button", { name: "Chutar", exact: true });
  await expect(shoot).toBeVisible();
  const frozen = new Date("2026-10-05T02:00:00Z");
  await page.clock.install({ time: frozen });
  await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
  await shoot.click();
  const scale = await page.locator(".football-ball animateTransform").getAttribute("to");
  const duration = Number.parseFloat((await page.locator(".football-ball animateMotion").getAttribute("dur"))!) * 1000;
  await expect(shoot).toBeDisabled();
  await page.clock.runFor(Math.floor(duration) - 1);
  await expect(page.locator(".football-ball-flight")).toHaveCount(1);
  await page.clock.runFor(2);
  await expect(page.locator(".football-ball-flight")).toHaveCount(0);
  await expect(page.locator(".football-ball")).toHaveAttribute("transform", new RegExp(`scale\\(${scale}\\)`));
  await shoot.click();
  await page.getByRole("button", { name: /Reiniciar série/i }).click();
  await page.clock.runFor(1000);
  await expect(page.locator("[data-football-result]")).toHaveAttribute("data-football-result", "ready");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await shoot.click();
  await expect(page.locator(".football-ball animateMotion")).toHaveCount(0);
  await expect(page.locator("[data-football-result]")).not.toHaveAttribute("data-football-result", "ready");
});

test("race speed remains readable without frequent live announcements", async ({ page }) => {
  await page.goto("./#/jogar/corrida");
  expect(await page.locator("[data-race-speed]").evaluate((element) => Boolean(element.closest('[role="status"], [aria-live="polite"], [aria-live="assertive"]')))).toBe(false);
  await expect(page.getByRole("status").filter({ hasText: "3 vidas" })).toBeVisible();
  expect(
    await page.locator(".race-board").evaluate((element) => getComputedStyle(element).touchAction),
  ).toContain("pinch-zoom");
});

for (const preference of ["system", "saved"] as const) {
  test(`${preference} reduced motion preserves all hundred mobile arenas`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 320, height: 740 });
    await page.emulateMedia({ reducedMotion: preference === "system" ? "reduce" : "no-preference" });
    if (preference === "saved") await page.addInitScript(() => localStorage.setItem("pg-arcade-preferences-v1", JSON.stringify({ motion: "reduced" })));
    expect(games).toHaveLength(100);
    for (const { id, name } of games) {
      await page.goto(`./#/jogar/${id}`);
      await expect(page.locator(".player > h1")).toHaveText(name);
      const arena = page.locator("[data-arcade-arena]");
      await expect(arena).toHaveCount(1);
      await expect(arena).toBeVisible();
      const durations = await arena.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.animationDuration, style.transitionDuration];
      });
      for (const duration of durations) for (const part of duration.split(",")) {
        const ms = Number.parseFloat(part) * (part.trim().endsWith("ms") ? 1 : 1000);
        expect(ms).toBeLessThanOrEqual(0.01);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
