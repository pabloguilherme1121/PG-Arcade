import { expect, test } from "@playwright/test";

test("2048 oferece três voltas na dificuldade fácil sem apagar recordes", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("./#/jogar/2048");
  await page.getByLabel("Dificuldade do 2048").selectOption("easy");
  const board = page.locator(".board2048");
  const undo = page.getByRole("button", { name: "Desfazer", exact: true });

  await expect(page.locator("[data-2048-moves]")).toHaveText("0");
  await board.press("ArrowLeft");
  await board.press("ArrowDown");
  await board.press("ArrowRight");
  await expect(page.locator("[data-2048-moves]")).toHaveText("3");
  await expect(page.locator("[data-2048-undo-count]")).toHaveText("3");
  await expect(page.locator("[data-2048-best-tile]")).toContainText(/4/);
  await expect(page.getByRole("progressbar", { name: "Progresso até a peça 2048" })).toHaveAttribute("aria-valuenow", "2");

  await undo.click();
  await undo.click();
  await undo.click();
  await expect(page.locator("[data-2048-moves]")).toHaveText("0");
  await expect(undo).toBeDisabled();
  await expect(page.locator(".scores strong").nth(1)).toHaveText("4");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("2048 limita as voltas na dificuldade normal e desativa no difícil", async ({ page }) => {
  await page.goto("./#/jogar/2048");
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  const board = page.locator(".board2048");
  const undo = page.getByRole("button", { name: "Desfazer", exact: true });
  await board.press("ArrowLeft");
  await board.press("ArrowDown");
  await expect(page.locator("[data-2048-undo-count]")).toHaveText("1");
  await undo.click();
  await expect(page.locator("[data-2048-moves]")).toHaveText("1");
  await expect(undo).toBeDisabled();
  await page.getByLabel("Dificuldade do 2048").selectOption("hard");
  await board.press("ArrowLeft");
  await expect(undo).toBeDisabled();
  await expect(page.locator("[data-2048-undo-count]")).toHaveText("0");
  await page.getByRole("button", { name: "Nova partida", exact: true }).click();
  await expect(page.locator("[data-2048-moves]")).toHaveText("0");
});
