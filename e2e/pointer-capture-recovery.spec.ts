import { expect, test } from "@playwright/test";

// A captured press interrupted by the browser must never fire a delayed action.
// Normal taps still need exactly one action pulse, even when the touch is short.
test("lost pointer capture cancels queued action without breaking short taps", async ({ page }) => {
  await page.addInitScript(() => {
    const clone = window.structuredClone.bind(window);
    let pulses = 0;
    let wasAction = false;
    window.structuredClone = ((value: unknown, options?: StructuredSerializeOptions) => {
      const result = clone(value, options) as { id?: string; lastAction?: boolean };
      if (result?.id === "turret") {
        if (result.lastAction && !wasAction) pulses += 1;
        wasAction = !!result.lastAction;
        Object.assign(window, { motionPulses: pulses });
      }
      return result;
    }) as typeof structuredClone;
  });

  await page.goto("./#/jogar/turret");
  const frozen = new Date("2026-10-12T12:00:00Z");
  await page.clock.install({ time: frozen });
  // Freeze the physics clock during pointer event setup so a frame cannot
  // consume a press before its simulated cancellation.
  await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.clock.runFor(100);

  const action = page.getByRole("button", { name: "Ação", exact: true });
  await action.evaluate(element => {
    element.addEventListener("pointerdown", event => {
      (element as HTMLElement).dataset.testPointerId = String(event.pointerId);
    }, { once: true });
  });
  await action.hover();
  await page.mouse.down();
  await expect(action).toHaveAttribute("data-held", "true");
  // Releasing real capture is essential: manually dispatching lostpointercapture
  // leaves native capture active and mouseup can still synthesize a click.
  const released = await action.evaluate(element => {
    const pointerId = Number((element as HTMLElement).dataset.testPointerId);
    if (!element.hasPointerCapture(pointerId)) return false;
    element.releasePointerCapture(pointerId);
    return true;
  });
  expect(released).toBe(true);
  await expect(action).not.toHaveAttribute("data-held", "true");
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await page.clock.runFor(100);
  const pulses = () => page.evaluate(() =>
    (window as unknown as { motionPulses?: number }).motionPulses ?? 0
  );
  expect(await pulses()).toBe(0);

  // Native click/keyboard actions must remain available after an interrupted press.
  await action.dispatchEvent("click", { detail: 0 });
  await page.clock.runFor(100);
  expect(await pulses()).toBe(1);
});
