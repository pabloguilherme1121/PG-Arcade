import { expect, test } from "@playwright/test";

test.use({ hasTouch: true, reducedMotion: "reduce" });

for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  for (const game of ["snake", "blocos"] as const) {
    test(`${game}: fullscreen keeps the board and touch controls together at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() => {
        Element.prototype.requestFullscreen = () => Promise.reject(new Error("viewport fallback"));
      });
      await page.goto(`./#/jogar/${game}`);
      const board = page.locator(game === "snake" ? ".snake-board" : ".blocks-board");
      await expect(board).toBeVisible();
      if (game === "snake") await page.getByLabel("Modo do Snake").selectOption("wrap");
      await page.getByRole("button", { name: "Tela cheia", exact: true }).tap();
      await expect(page.locator(".player")).toHaveAttribute("data-viewport-fullscreen", "true");
      if (game === "snake") await page.getByRole("button", { name: "Jogar", exact: true }).tap();
      await expect(page.locator(game === "snake" ? ".dpad button" : ".blocks-tray button")).toHaveCount(game === "snake" ? 4 : 3);

      const targets = game === "snake"
        ? ".snake-board,[data-arcade-arena] .game-actions button,.dpad button"
        : ".blocks-board,.blocks-tray button:not(:disabled)";
      const checkViewport = () => expect.poll(() => page.locator(targets).evaluateAll(elements => {
        const toolbar = document.querySelector(".player-toolbar")!.getBoundingClientRect();
        return elements.flatMap(element => {
          const rect = element.getBoundingClientRect();
          const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
          return rect.top < toolbar.bottom || rect.bottom > innerHeight + 1
            || rect.left < 0 || rect.right > innerWidth + 1 || !hit || !element.contains(hit)
            ? [`${element.getAttribute("aria-label") || element.className}: ${Math.round(rect.top)}–${Math.round(rect.bottom)}`]
            : [];
        });
      }), { message: "playfield and controls must share the visible viewport without another scroll" }).toEqual([]);
      await checkViewport();

      if (game === "snake") {
        await page.getByRole("button", { name: "Mover para cima", exact: true }).tap();
        await expect(board).toHaveAttribute("data-facing", "up");
        await page.getByRole("button", { name: "Pausar", exact: true }).tap();
        await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Continuar", exact: true }).tap();
        await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeVisible();
        await page.setViewportSize(viewport.width > viewport.height
          ? { width: 390, height: 844 }
          : { width: 844, height: 390 });
        await checkViewport();
        await expect(board).toHaveAttribute("data-facing", "up");
      } else {
        await page.locator(".blocks-tray button").first().tap();
        await page.locator('[data-cell="0"]').tap();
        await expect(page.locator("[data-blocks-moves]")).toHaveText("1");
      }
      await page.getByRole("button", { name: "Sair da tela cheia", exact: true }).tap();
      await expect(page.locator(".player")).toHaveAttribute("data-immersive", "false");
    });
  }

  if (viewport.width < viewport.height) test(`blocos: portrait framing preserves timed-session start at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () => Promise.reject(new Error("viewport fallback"));
    });
    await page.goto("./#/jogar/blocos");
    await expect(page.locator(".blocks-board")).toBeVisible();
    await page.getByRole("button", { name: "Tela cheia", exact: true }).tap();
    await page.locator(".session-mode-cards").getByRole("button", { name: /Sprint:/ }).tap();
    await expect(page.locator("[data-session-content]")).toHaveAttribute("inert");
    const start = page.getByRole("button", { name: "Iniciar desafio de tempo", exact: true });
    await expect(start).toBeInViewport({ ratio: 1 });
    await start.tap();
    await expect(page.locator("[data-session-content]")).not.toHaveAttribute("inert");
    await expect(page.locator(".blocks-board")).toBeInViewport({ ratio: 1 });
    await expect(page.locator(".blocks-tray")).toBeInViewport({ ratio: 1 });
  });
}

test("explicit reduced-motion preference also preserves fullscreen framing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error("viewport fallback"));
  });
  await page.goto("./#/jogar/blocos");
  await expect(page.locator(".blocks-board")).toBeVisible();
  await page.locator(".player-utilities summary").tap();
  await page.getByRole("link", { name: "Ajustar conforto", exact: true }).tap();
  await page.getByLabel("Movimento da interface").selectOption("reduced");
  await expect(page.locator("html")).toHaveAttribute("data-arcade-motion", "reduced");
  await page.getByRole("button", { name: "Tela cheia", exact: true }).tap();
  await expect(page.locator(".blocks-board")).toBeInViewport({ ratio: 1 });
  await expect(page.locator(".blocks-tray")).toBeInViewport({ ratio: 1 });
  await expect.poll(() => page.locator(".blocks-board").evaluate(board =>
    board.getBoundingClientRect().top - document.querySelector(".player-toolbar")!.getBoundingClientRect().bottom,
  )).toBeGreaterThanOrEqual(0);
});
