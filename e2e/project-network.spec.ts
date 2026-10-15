import { test, expect } from "@playwright/test";
for (const width of [320, 390, 1280]) {
  test(`project discovery remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const nav = page.getByRole("navigation", { name: "Outros projetos de Pablo Guilherme" });
    await nav.scrollIntoViewIfNeeded();
    await expect(nav.getByRole("link", { name: "Todos os projetos" })).toHaveAttribute("href", "https://pabloguilherme1121.github.io/PG-portfolio/#rede-projetos");
    await expect(nav.getByRole("link", { name: "Eleições Goiás" })).toHaveAttribute("href", "https://pabloguilherme1121.github.io/eleicoes-goias-2026/");
    for (const link of await nav.getByRole("link").all()) {
      await link.focus();
      await expect(link).toBeFocused();
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
