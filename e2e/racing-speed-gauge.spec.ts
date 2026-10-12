import { expect, test } from "@playwright/test";

test("Corrida Turbo exposes a compact, readable speed gauge while playing on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/corrida");
  const meter = page.getByRole("meter", { name: "Velocidade da corrida" });
  await expect(meter).toBeVisible();
  await expect(meter).toContainText("km/h");

  const read = () => meter.evaluate(element => {
    const low = Number(element.getAttribute("aria-valuemin"));
    const high = Number(element.getAttribute("aria-valuemax"));
    const now = Number(element.getAttribute("aria-valuenow"));
    const fill = Number.parseFloat(getComputedStyle(element).getPropertyValue("--speed-progress"));
    return { low, high, now, fill, background: getComputedStyle(element).backgroundImage };
  });
  const initial = await read();
  expect(initial.low).toBe(0);
  expect(initial.high).toBeGreaterThan(initial.now);
  expect(initial.now).toBeGreaterThan(0);
  expect(initial.fill).toBeGreaterThan(0);
  expect(initial.fill).toBeLessThanOrEqual(100);
  expect(initial.background).toContain("linear-gradient");

  await page.getByRole("button", { name: "Largar", exact: true }).click();
  const pedal = page.getByRole("button", { name: "Acelerar", exact: true });
  await pedal.hover();
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  const playing = await read();
  expect(playing.now).toBeGreaterThanOrEqual(0);
  expect(playing.now).toBeLessThanOrEqual(playing.high);
  expect(playing.fill).toBeGreaterThan(0);
  await expect(meter).toHaveAttribute("aria-valuetext", /quilômetros por hora/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("speed gauge is static in reduced-motion mode and remains readable at 320px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/corrida");
  const meter = page.getByRole("meter", { name: "Velocidade da corrida" });
  await expect(meter).toBeVisible();
  await expect(meter).toHaveCSS("animation-name", "none");
  const box = await meter.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(70);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
