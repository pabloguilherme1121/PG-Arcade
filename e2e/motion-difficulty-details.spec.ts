import { expect, test } from "@playwright/test";

test("difficulty explains the active tuning and stays fixed during a round", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/rhythm");
  const difficulty = page.getByLabel("Dificuldade", { exact: true });
  for (const [value, speed] of [["0", "90%"], ["1", "100%"], ["2", "118%"]]) {
    await difficulty.selectOption(value);
    await expect(page.locator("#motion-difficulty-details")).toContainText(speed);
  }
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await expect(difficulty).toBeDisabled();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect(difficulty).toBeDisabled();
  await expect(page.locator("#motion-difficulty-details")).toContainText("118%");
  await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  await expect(difficulty).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
