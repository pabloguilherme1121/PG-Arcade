import { expect, test } from "@playwright/test";

test("2048 ignores interrupted multi-touch gestures but accepts a later single-finger swipe", async ({ page, browserName }) => {
  test.skip(browserName === "firefox", "Firefox desktop does not expose the Touch constructor for synthetic gestures; keyboard tests and Chromium/WebKit cover this gesture.");
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/2048");
  const board = page.locator(".board2048");
  const moves = page.locator("[data-2048-moves]");
  await expect(moves).toHaveText("0");

  await board.evaluate(element => {
    const touch = (id: number, x: number) => new Touch({ identifier: id, target: element, clientX: x, clientY: 250 });
    const send = (name: string, active: Touch[], changed: Touch[]) => element.dispatchEvent(
      new TouchEvent(name, { bubbles: true, cancelable: true, touches: active, targetTouches: active, changedTouches: changed })
    );
    const first = touch(11, 120);
    const second = touch(12, 200);
    send("touchstart", [first], [first]);
    send("touchstart", [first, second], [second]);
    send("touchmove", [first, second], [first]);
    send("touchend", [second], [touch(11, 315)]);
    send("touchend", [], [touch(12, 215)]);
  });
  await expect(moves).toHaveText("0");
  await board.evaluate(element => {
    const a = new Touch({ identifier: 25, target: element, clientX: 120, clientY: 250 });
    const b = new Touch({ identifier: 25, target: element, clientX: 315, clientY: 250 });
    element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [a], targetTouches: [a], changedTouches: [a] }));
    element.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], targetTouches: [], changedTouches: [b] }));
  });
  await expect(moves).toHaveText("1");
  await expect(board.locator(".tile-new")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("2048 highlights only the newly spawned tile, honoring reduced motion", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/2048");
  const board = page.locator(".board2048");
  await board.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-2048-moves]")).toHaveText("1");
  const spawned = board.locator(".tile-new");
  await expect(spawned).toHaveCount(1);
  await expect(spawned).toHaveCSS("animation-name", "arcade-2048-spawn");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(spawned).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(spawned).toHaveCount(0);
  await expect(page.locator("[data-2048-moves]")).toHaveText("0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
