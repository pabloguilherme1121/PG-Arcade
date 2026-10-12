import { expect, test } from "@playwright/test";

test("Snake preserves confirmed turns across mobile pause and cancels unfinished gestures", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/snake");
  const board = page.locator(".snake-board");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(board).toHaveAttribute("data-play-status", "running");

  // Queue a valid turn and interrupt immediately, before a physics tick.
  await board.evaluate(element => {
    element.dispatchEvent(new KeyboardEvent("keydown", {
      key: "ArrowUp", code: "ArrowUp", bubbles: true, cancelable: true,
    }));
    window.dispatchEvent(new Event("pagehide"));
  });
  await expect(board).toHaveAttribute("data-play-status", "paused");
  // A fully committed turn must survive a pause; no unexpected input loss.
  await expect(page.locator("[data-snake-queued]")).toHaveText("↑");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(board).toHaveAttribute("data-play-status", "running");
  await expect.poll(() => board.getAttribute("data-facing")).toBe("up");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
