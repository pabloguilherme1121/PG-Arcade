import { test, expect } from "@playwright/test";

test("race supports swipes, capitalized steering, pause and voluntary record saving", async ({ page }) => {
  await page.clock.install();
  await page.goto("./#/jogar/corrida");
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const board = page.locator(".race-board");
  const car = board.locator(".race-car");
  await page.getByRole("button", { name: "Largar", exact: true }).click();
  await board.press("A");
  await expect(car).toHaveAttribute("data-lane", "0");
  const box = (await board.boundingBox())!;
  await page.mouse.move(box.x + box.width * .3, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .5);
  await page.mouse.up();
  await expect(car).toHaveAttribute("data-lane", "1");
  await page.clock.runFor(500);
  const distance = await page.locator(".scores strong").first().textContent();
  expect(Number(distance)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.clock.runFor(1000);
  await expect(page.locator(".scores strong").first()).toHaveText(distance!);
  await page.getByRole("button", { name: "Encerrar e salvar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Largar", exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.locator(".scores strong").nth(1)).toHaveText(distance!);
});
