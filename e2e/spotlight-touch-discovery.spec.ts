import { test, expect } from "@playwright/test";
import { games } from "../src/lib/catalog";

test.describe("descoberta premium mobile", () => {
  test.use({ hasTouch: true });

  for (const width of [320, 390]) {
    test(`sugestão responde a modos, visitas e toque em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("./");

      const featured = page.locator("[data-smart-spotlight]");
      await expect(featured).toBeVisible();
      await expect(featured.locator("img")).toHaveAttribute("src", /\/covers\/[a-z0-9-]+\.svg$/);
      await expect(featured.getByRole("link", { name: /Jogar sugestão:/ })).toBeVisible();
      await expect(featured.locator("[data-spotlight-mode]")).not.toHaveCount(0);

      const playedFilter = page.getByRole("button", { name: "Já joguei", exact: true });
      await playedFilter.tap();
      await expect(playedFilter).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".game-card")).toHaveCount(0);
      await expect(featured).toHaveCount(0);

      await page.getByRole("button", { name: "Zerar filtros", exact: true }).tap();
      await page.getByRole("button", { name: "Dupla local", exact: true }).tap();
      await expect(page.locator(".game-card")).toHaveCount(5);
      const link = featured.getByRole("link", { name: /Jogar sugestão:/ });
      const target = await link.getAttribute("href");
      expect(["#/jogar/damas", "#/jogar/domino", "#/jogar/liga4", "#/jogar/velha", "#/jogar/xadrez"]).toContain(target);
      await link.tap();
      await expect(page).toHaveURL(/#\/jogar\//);
      await expect(page.locator("[data-arcade-arena]")).toBeVisible();
      await page.getByRole("link", { name: "Voltar aos jogos", exact: true }).tap();
      await expect(page.locator(".game-card")).toHaveCount(5);
      await page.getByRole("button", { name: "Já joguei", exact: true }).tap();
      await expect(page.locator(".game-card")).toHaveCount(1);
      await expect(featured.getByRole("link", { name: /Jogar sugestão:/ })).toHaveAttribute("href", target!);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }

  test("modos Livre, Sprint e Maratona têm alvos touch e foco visível", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("./#/jogar/2048");
    const modes = page.getByRole("group", { name: "Escolha seu ritmo de partida" });
    const buttons = modes.getByRole("button");
    await expect(buttons).toHaveCount(3);
    for (const button of await buttons.all()) {
      await expect(button).toBeVisible();
      expect(await button.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      expect(await button.evaluate(el => getComputedStyle(el).touchAction)).toBe("manipulation");
    }
    const sprint = modes.getByRole("button", { name: /Sprint/ });
    await page.keyboard.press("Tab");
    await sprint.focus();
    await expect(sprint).toBeFocused();
    const focusOutline = await sprint.evaluate(el => ({
      style: getComputedStyle(el).outlineStyle,
      width: Number.parseFloat(getComputedStyle(el).outlineWidth),
    }));
    expect(focusOutline.style).not.toBe("none");
    expect(focusOutline.width).toBeGreaterThanOrEqual(2);
    await sprint.tap();
    await expect(sprint).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("movimento reduzido também desliga transições dos modos de sessão", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./#/jogar/2048");
    const sprint = page.getByRole("group", { name: "Escolha seu ritmo de partida" })
      .getByRole("button", { name: /Sprint/ });
    await expect(sprint).toBeVisible();
    expect(await sprint.evaluate(el => getComputedStyle(el).transitionDuration)).toMatch(/^0s(?:, 0s)*$/);
  });

  test("capas permanecem uma por jogo e o destaque não carrega os motores", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const modules: string[] = [];
    page.on("response", r => { if (/\/(?:BoardExpansion|Game2048|MotionExpansion)-[^/]+\.js/.test(r.url())) modules.push(r.url()); });
    await page.goto("./");
    await expect(page.locator(".game-card [data-game-cover]")).toHaveCount(games.length);
    await expect(page.locator("[data-smart-spotlight] img")).toHaveCount(1);
    expect(modules).toEqual([]);
  });
});
