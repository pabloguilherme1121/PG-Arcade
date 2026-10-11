import { expect, test } from "@playwright/test";
import { calculateCanvasPixels } from "../src/lib/touchCanvas";
import AxeBuilder from "@axe-core/playwright";
import { games } from "../src/lib/catalog";

test("native fullscreen or viewport fallback keeps a working exit and navigation", async ({ page }) => {
  await page.goto("./#/jogar/2048");
  await page.getByRole("button", { name: "Tela cheia", exact: true }).click();
  await expect(page.locator(".player")).toHaveAttribute("data-immersive", "true");
  await page.getByRole("button", { name: "Sair da tela cheia", exact: true }).click();
  await expect(page.locator(".player")).toHaveAttribute("data-immersive", "false");
  await expect(page.getByRole("button", { name: "Tela cheia", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Tela cheia", exact: true }).click();
  await page.getByRole("link", { name: "Voltar aos jogos", exact: true }).click();
  await expect(page.locator(".game-card").first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement || document.body.style.overflow === "hidden")).toBe(false);
  await expect(page.locator(".site-header")).not.toHaveAttribute("inert");
});

for (const width of [320, 390, 1280]) {
  test(`all 100 games expose session modes and fit immersive view at ${width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () => Promise.reject(new Error("unsupported"));
    });
    for (const game of games) {
      await page.goto(`./#/jogar/${game.id}`);
      await expect(page.locator("[data-arcade-arena]").first()).toBeVisible();
      await expect(page.getByLabel("Modo de sessão").locator("option")).toHaveCount(3);
      await page.getByRole("button", { name: "Tela cheia", exact: true }).click();
      const player = page.locator(".player");
      await expect(player).toHaveAttribute("data-viewport-fullscreen", "true");
      expect(await player.evaluate((element) => element.scrollWidth <= element.clientWidth + 1), game.id).toBe(true);
      await page.getByLabel("Modo de sessão").selectOption("sprint");
      await expect(page.getByLabel("Dificuldade do desafio de tempo").locator("option")).toHaveCount(3);
      await page.keyboard.press("Escape");
      await expect(player).toHaveAttribute("data-immersive", "false");
    }
    expect(errors).toEqual([]);
  });
}

test("viewport fullscreen isolates keyboard focus, restores scroll and passes axe", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.reject(new Error("denied")); });
  await page.goto("./#/jogar/2048");
  await page.getByRole("button", { name: "Tela cheia", exact: true }).click();
  await expect(page.locator(".site-header")).toHaveAttribute("inert");
  await expect(page.locator(".site-header")).not.toBeVisible();
  expect(await page.getByRole("button", { name: "Sair da tela cheia", exact: true }).evaluate((element) => {
    const box = element.getBoundingClientRect();
    return element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  })).toBe(true);
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Tela cheia", exact: true })).toBeFocused();
  await expect(page.locator(".site-header")).not.toHaveAttribute("inert");
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("session timer pauses on interruption, resumes and blocks play at its deadline", async ({ page }) => {
  await page.goto("./#/jogar/2048");
  await expect(page.locator(".board2048")).toBeVisible();
  const time = new Date("2026-10-09T12:00:00Z");
  await page.clock.install({ time: new Date(time.getTime() - 60_000) });
  await page.clock.pauseAt(time);
  await page.getByLabel("Modo de sessão").selectOption("sprint");
  await page.getByLabel("Dificuldade do desafio de tempo").selectOption("hard");
  await expect(page.getByRole("timer")).toHaveText("1:00");
  await expect(page.locator("[data-session-content]")).toHaveAttribute("inert");
  await page.getByRole("button", { name: "Iniciar desafio de tempo" }).click();
  await page.locator(".board2048").press("ArrowLeft");
  await page.clock.runFor(10_000);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.locator(".session-challenge")).toHaveAttribute("data-session-phase", "paused");
  const remaining = await page.getByRole("timer").textContent();
  await page.clock.runFor(15_000);
  await expect(page.getByRole("timer")).toHaveText(remaining!);
  await page.getByRole("button", { name: "Retomar sessão" }).click();
  await page.clock.runFor(51_000);
  await expect(page.getByRole("timer")).toHaveText("0:00");
  await expect(page.locator("[data-session-content]")).toHaveAttribute("inert");
  await expect(page.getByRole("button", { name: "Repetir desafio de tempo" })).toBeFocused();
  await page.getByRole("button", { name: "Voltar à sessão livre" }).click();
  await expect(page.locator("[data-session-content]")).not.toHaveAttribute("inert");
  await expect(page.getByRole("timer")).toHaveCount(0);
});

test("canvas buffers follow retina pixels and resizing preserves running physics", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  for (const id of ["breakout", "balloons"]) {
    await page.goto(`./#/jogar/${id}`);
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    await expect.poll(async () => {
      const dimensions = await canvas.evaluate((element) => ({
        cssWidth: element.getBoundingClientRect().width,
        bufferWidth: element.width,
        bufferHeight: element.height,
      }));
      const expected = calculateCanvasPixels(dimensions.cssWidth, 480, id === "breakout" ? 360 : 380, 2);
      expect(dimensions.bufferWidth * dimensions.bufferHeight).toBeLessThanOrEqual(1_500_000);
      return Math.abs(dimensions.bufferWidth - expected.width);
    }).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(async () => {
      const dimensions = await canvas.evaluate((element) => ({
        cssWidth: element.getBoundingClientRect().width,
        bufferWidth: element.width,
        bufferHeight: element.height,
      }));
      const expected = calculateCanvasPixels(dimensions.cssWidth, 480, id === "breakout" ? 360 : 380, 2);
      expect(dimensions.bufferWidth * dimensions.bufferHeight).toBeLessThanOrEqual(1_500_000);
      return Math.abs(dimensions.bufferWidth - expected.width);
    }).toBeLessThanOrEqual(1);
    await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeEnabled();
    expect(await canvas.evaluate((element) => {
      const c = element.getContext("2d")!;
      return c.getImageData(Math.floor(element.width / 2), Math.floor(element.height / 2), 1, 1).data[3];
    })).toBe(255);
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  await context.close();
});

test("Snake portal crosses a wall and hard 2048 removes undo", async ({ page }) => {
  await page.goto("./#/jogar/snake");
  await page.getByLabel("Modo do Snake").selectOption("wrap");
  const time = new Date("2026-10-09T12:00:00Z");
  await page.clock.install({ time: new Date(time.getTime() - 60_000) });
  await page.clock.pauseAt(time);
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await page.clock.runFor(160 * 9);
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeEnabled();
  await expect(page.locator(".snake-board > span").nth(8 * 16)).toHaveClass(/snake-head/);
  await page.goto("./#/jogar/2048");
  await page.getByLabel("Dificuldade do 2048").selectOption("hard");
  await page.locator(".board2048").press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Desfazer", exact: true })).toBeDisabled();
});
