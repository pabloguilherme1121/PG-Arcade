import { expect, test, type Page } from "@playwright/test";

async function sendRaceTouch(
  page: Page,
  kind: "touchstart" | "touchmove" | "touchend" | "touchcancel",
  x: number,
  y: number,
) {
  await page.locator(".race-board").evaluate((element, details) => {
    const event = new Event(details.kind, { bubbles: true, cancelable: true });
    const finger = { identifier: 1, clientX: details.x, clientY: details.y };
    const active = details.kind === "touchend" || details.kind === "touchcancel" ? [] : [finger];
    Object.defineProperty(event, "touches", { value: active });
    Object.defineProperty(event, "changedTouches", { value: [finger] });
    element.dispatchEvent(event);
  }, { kind, x, y });
}

test("corrida troca a faixa durante arrastos sucessivos sem repetir ao soltar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/corrida");
  await page.clock.install();
  await page.getByRole("button", { name: "Largar", exact: true }).click();
  const car = page.locator(".race-car");
  await expect(car).toHaveAttribute("data-lane", "1");

  await sendRaceTouch(page, "touchstart", 180, 340);
  await sendRaceTouch(page, "touchmove", 145, 340);
  await expect(car).toHaveAttribute("data-lane", "0");
  await expect(page.locator('[data-race-lane-indicator="0"]')).toHaveAttribute("data-active", "true");

  await page.clock.runFor(220);
  await sendRaceTouch(page, "touchmove", 180, 340);
  await expect(car).toHaveAttribute("data-lane", "1");
  await sendRaceTouch(page, "touchend", 180, 340);
  await page.clock.runFor(220);
  await expect(car).toHaveAttribute("data-lane", "1");

  await sendRaceTouch(page, "touchstart", 180, 340);
  await sendRaceTouch(page, "touchcancel", 180, 340);
  await sendRaceTouch(page, "touchmove", 145, 340);
  await expect(car).toHaveAttribute("data-lane", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("futebol oferece ajustes rápidos e uma previsão geométrica sem prometer gol", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/futebol");
  await page.getByRole("button", { name: "Chute controlado", exact: true }).click();
  await expect(page.getByRole("slider", { name: "Força", exact: true })).toHaveValue("62");
  await expect(page.getByRole("slider", { name: "Elevação", exact: true })).toHaveValue("46");
  await expect(page.locator("[data-football-forecast]")).toContainText("goleiro");

  const crosshair = page.getByRole("slider", { name: "Mira no gol", exact: true });
  await crosshair.focus();
  await crosshair.press("Shift+ArrowRight");
  await expect(crosshair).toHaveAttribute("aria-valuenow", "31");
  await crosshair.press("PageUp");
  await expect(crosshair).toHaveAttribute("aria-valuenow", "41");

  await page.getByRole("button", { name: "Cobranças de falta", exact: true }).click();
  await page.getByRole("button", { name: "Chute com curva", exact: true }).click();
  await expect(page.getByRole("slider", { name: "Curva", exact: true })).toHaveValue("60");
  await expect(page.getByRole("slider", { name: "Força", exact: true })).toHaveValue("68");
  await page.getByRole("slider", { name: "Força", exact: true }).fill("95");
  await expect(page.locator("[data-football-forecast]")).toHaveAttribute("data-football-forecast", "out");
  await expect(page.locator("[data-football-forecast]")).toContainText("fora");

  await page.getByRole("button", { name: "Chute controlado", exact: true }).click();
  await page.getByRole("button", { name: "Centro", exact: true }).click();
  await page.getByRole("slider", { name: "Elevação", exact: true }).fill("10");
  await expect(page.locator("[data-football-forecast]")).toHaveAttribute("data-football-forecast", "wall");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
