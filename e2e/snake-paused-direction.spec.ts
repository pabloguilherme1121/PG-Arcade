import { expect, test } from "@playwright/test";

test("Snake discards a queued turn if the mobile browser interrupts the round", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/snake");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  const board = page.locator(".snake-board");
  await expect(board).toHaveAttribute("data-play-status", "running");

  // Both events in one JS turn guarantee a queued but unsampled direction.
  await board.evaluate(element => {
    element.dispatchEvent(new KeyboardEvent("keydown", {
      key: "ArrowUp", code: "ArrowUp", bubbles: true, cancelable: true,
    }));
    window.dispatchEvent(new Event("pagehide"));
  });
  await expect(board).toHaveAttribute("data-play-status", "paused");
  await expect(page.locator("[data-snake-queued]")).toHaveText("Livre");

  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(board).toHaveAttribute("data-play-status", "running");
  // A stale pre-pause turn must not unexpectedly change the resumed direction.
  await page.waitForTimeout(360);
  await expect(board).toHaveAttribute("data-facing", "right");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
