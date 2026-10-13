import { expect, test } from "@playwright/test";

test("Snake pauses on mobile pagehide/freeze and resumes without losing the round", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/snake");
  const board = page.locator(".snake-board");
  const points = page.locator(".scores strong").first();
  await expect(board).toHaveAttribute("data-play-status", "ready");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(board).toHaveAttribute("data-play-status", "running");
  const playingBorder = await board.evaluate(el => getComputedStyle(el).borderTopColor);
  const scoreBefore = await points.textContent();

  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect(board).toHaveAttribute("data-play-status", "paused");
  await expect(board).toContainText("Pausa");
  const pausedBorder = await board.evaluate(el => getComputedStyle(el).borderTopColor);
  expect(pausedBorder).not.toBe(playingBorder);
  await expect(points).toHaveText(scoreBefore ?? "0");

  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(board).toHaveAttribute("data-play-status", "running");

  await page.evaluate(() => document.dispatchEvent(new Event("freeze")));
  await expect(board).toHaveAttribute("data-play-status", "paused");
  await expect(page.locator(".game-status")).toContainText("Partida pausada");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("Snake pause states are readable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#/jogar/snake");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  const board = page.locator(".snake-board");
  await expect(board).toHaveAttribute("data-play-status", "paused");
  await expect(board.locator(".board-overlay")).toBeVisible();
  const visual = await board.evaluate(el => ({
    animation: getComputedStyle(el).animationName,
    border: getComputedStyle(el).borderTopColor,
  }));
  expect(visual.animation).toBe("none");
  expect(visual.border).not.toBe("rgba(0, 0, 0, 0)");
});
