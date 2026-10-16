import { expect, test } from "@playwright/test";

test("a cancelled rhythm touch never plays a phantom lane, while a valid tap does", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Requires genuine CDP touch cancel");
  await page.addInitScript(() => {
    const clone = window.structuredClone.bind(window);
    let pulses = 0;
    let active = false;
    window.structuredClone = ((value: unknown, options?: StructuredSerializeOptions) => {
      const result = clone(value, options) as { id?: string; lastLane?: number };
      if (result?.id === "rhythm") {
        const held = typeof result.lastLane === "number" && result.lastLane >= 0;
        if (held && !active) pulses++;
        active = held;
        Object.assign(window, { rhythmLanePulses: pulses });
      }
      return result;
    }) as typeof structuredClone;
  });
  await page.goto("./#/jogar/rhythm");
  const frozen = new Date("2026-10-15T12:00:00Z");
  await page.clock.install({ time: frozen });
  // A cancellation before the next physics frame must not become a tap.
  // Installing the clock alone still advances time between CDP calls.
  await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  const canvas = page.locator(".motion-stage canvas");
  await canvas.scrollIntoViewIfNeeded();
  const rect = (await canvas.boundingBox())!;
  const x = rect.x + rect.width * 0.375;
  const y = rect.y + rect.height * 0.6;
  const session = await page.context().newCDPSession(page);
  const send = (type: "touchStart" | "touchEnd" | "touchCancel", touchPoints: {x:number;y:number}[]) =>
    session.send("Input.dispatchTouchEvent", { type, touchPoints });
  const pulses = () => page.evaluate(() =>
    (window as unknown as { rhythmLanePulses?: number }).rhythmLanePulses ?? 0
  );

  await send("touchStart", [{x, y}]);
  await send("touchCancel", []);
  await page.clock.runFor(100);
  expect(await pulses()).toBe(0);

  await send("touchStart", [{x, y}]);
  await send("touchEnd", []);
  await page.clock.runFor(100);
  expect(await pulses()).toBe(1);
});
