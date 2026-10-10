import { expect, test } from "@playwright/test";

test("Snake premium shows length, queued turn and pace without losing touch controls", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/snake");
  await page.clock.install();
  const board = page.locator(".snake-board");
  const progressive = page.getByRole("checkbox", { name: /aceleração progressiva/i });
  await expect(progressive).not.toBeChecked();
  await expect(page.locator("[data-snake-length]")).toHaveText("3");
  await expect(page.locator("[data-snake-pace]")).toHaveText("160 ms");
  await progressive.check();
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(progressive).toBeDisabled();
  await board.press("ArrowUp");
  await expect(page.locator("[data-snake-queued]")).toContainText("↑");
  await page.clock.runFor(160);
  await expect(page.locator("[data-snake-queued]")).toHaveText("Livre");
  await expect(board).toHaveAttribute("data-facing", "up");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const current = await board.locator(".snake-head").evaluate((el) =>
    Array.from(el.parentElement!.children).indexOf(el),
  );
  await page.clock.runFor(1200);
  await expect(board.locator(".snake-head")).toHaveCount(1);
  const after = await board.locator(".snake-head").evaluate((el) =>
    Array.from(el.parentElement!.children).indexOf(el),
  );
  expect(after).toBe(current);
  await page.getByRole("button", { name: "Nova partida", exact: true }).click();
  await expect(page.locator("[data-snake-queued]")).toHaveText("Livre");
  await expect(page.locator("[data-snake-length]")).toHaveText("3");
  await expect(page.locator("[data-snake-pace]")).toHaveText("160 ms");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Snake progressive mode remains opt-in and visible in the speed HUD", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/snake");
  const progressive = page.getByRole("checkbox", { name: /aceleração progressiva/i });
  await progressive.check();
  await page.locator("#snake-speed").selectOption("220");
  await expect(page.locator("[data-snake-pace]")).toHaveText("220 ms");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(page.locator("[data-snake-challenge]")).toContainText("Progressivo");
  await page.getByRole("button", { name: "Nova partida", exact: true }).click();
  await expect(progressive).toBeChecked();
  await progressive.uncheck();
  await expect(page.locator("[data-snake-challenge]")).toContainText("Constante");
});
