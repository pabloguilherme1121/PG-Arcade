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
