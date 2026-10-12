import { expect, test } from "@playwright/test";

// A key held while focus leaves the game controls is cancelled, not replayed
// on the next physics frame. Normal keyboard actions must still fire once.
test("motion action cancels pending keyboard press on blur and accepts the next press", async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.structuredClone.bind(window);
    let last = false;
    let shots = 0;
    window.structuredClone = ((value: unknown, options?: StructuredSerializeOptions) => {
      const state = original(value, options) as { id?: string; lastAction?: boolean };
      if (state?.id === "turret") {
        if (state.lastAction && !last) shots += 1;
        last = !!state.lastAction;
        (window as unknown as { __shotPulses: number }).__shotPulses = shots;
      }
      return state;
    }) as typeof structuredClone;
  });

  await page.goto("./#/jogar/turret");
  const clock = new Date("2026-10-12T12:00:00Z");
  await page.clock.install({ time: clock });
  await page.clock.pauseAt(new Date(clock.getTime() + 1000));
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(100);

  const action = page.getByRole("button", { name: "Ação", exact: true });
  const shots = () => page.evaluate(() =>
    (window as unknown as { __shotPulses?: number }).__shotPulses ?? 0
  );
  await action.focus();
  await page.keyboard.down("Space");
  await expect(action).toHaveAttribute("data-held", "true");
  await action.evaluate(el => (el as HTMLElement).blur());
  await expect(action).not.toHaveAttribute("data-held", "true");
  await page.keyboard.up("Space");
  await page.clock.runFor(100);
  expect(await shots()).toBe(0);

  await action.focus();
  await page.keyboard.down("Space");
  await page.clock.runFor(100);
  await page.keyboard.up("Space");
  expect(await shots()).toBe(1);
});
