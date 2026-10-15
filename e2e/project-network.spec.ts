import { test, expect } from "@playwright/test";
for (const width of [320, 390, 1280]) {
  test(`project discovery remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const nav = page.locator("footer nav.project-network-links");
    await nav.scrollIntoViewIfNeeded();
    await expect(nav.getByRole("link", { name: "Todos os projetos" })).toHaveAttribute("href", "https://pabloguilherme1121.github.io/PG-portfolio/#rede-projetos");
    await expect(nav.getByRole("link", { name: "Eleições Goiás" })).toHaveAttribute("href", "https://pabloguilherme1121.github.io/eleicoes-goias-2026/");
    const links = nav.locator("a");
    await expect(links).toHaveCount(3);
    // CSS locators avoid recomputing the accessible tree of the full game catalog.
    for (let index = 0; index < await links.count(); index++) {
      const link = links.nth(index);
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
