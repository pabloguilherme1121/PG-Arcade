import { expect, test } from "@playwright/test";

test("Snake food has a subtle cue only while playing with motion allowed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./#/jogar/snake");
  // This test checks CSS and pause, not Snake physics. Freeze game ticks
  // so WebKit does not reach the wall before the Pause button is clicked.
  const frozen = new Date("2026-10-12T12:00:00Z");
  await page.clock.install({ time: frozen });
  await page.clock.pauseAt(new Date(frozen.getTime() + 1000));
  const food = page.locator(".snake-food");
  await expect(food).toHaveCount(1);
  await expect(food).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(food).toHaveCSS("animation-name", "snake-food-breathe");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect(food).toHaveCSS("animation-name", "none");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(food).toHaveCSS("animation-name", "none");
});
