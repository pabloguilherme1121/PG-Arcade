import { test, expect } from "@playwright/test";
import { newBoard } from "../src/lib/boardExpansion";

test("numeric board explains why a fixed clue cannot be edited", async ({ page }) => {
  await page.goto("./#/jogar/latin");
  const arena = page.locator('[data-new-game="latin"]');
  const state = newBoard("latin", 1, 1);
  const fixed = state.fixed.findIndex(Boolean);
  await arena.locator(`[data-index="${fixed}"]`).click();
  await expect(arena.getByRole("status")).toContainText("pista fixa");
});
