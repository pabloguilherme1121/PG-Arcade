import { test, expect } from "@playwright/test";
for (const width of [320, 390, 1280]) {
  test(`project discovery remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const nav = page.locator("footer nav.project-network-links");
    await nav.scrollIntoViewIfNeeded();
    // Read geometry and programmatic focus in one browser round trip: retained
    // traces of the 101-cover catalog cost ~1.7s per action in Firefox.
    const facts = await nav.evaluate(element => ({
      label: element.getAttribute("aria-label"),
      links: Array.from(element.querySelectorAll("a"), link => {
        link.focus();
        return { name: link.textContent?.trim(), href: link.getAttribute("href"),
          height: link.getBoundingClientRect().height, focused: document.activeElement === link };
      }),
      fits: document.documentElement.scrollWidth <= innerWidth,
    }));
    expect(facts.label).toBe("Outros projetos de Pablo Guilherme");
    expect(facts.links.map(({ name, href }) => [name, href])).toEqual([
      ["Todos os projetos", "https://pabloguilherme1121.github.io/PG-portfolio/#rede-projetos"],
      ["Eleições Goiás", "https://pabloguilherme1121.github.io/eleicoes-goias-2026/"],
      ["Observatório", "https://pabloguilherme01.github.io/observatorio/#dashboard"],
    ]);
    for (const link of facts.links) {
      expect(link.focused).toBe(true);
      expect(link.height).toBeGreaterThanOrEqual(44);
    }
    expect(facts.fits).toBe(true);
    // Also prove real keyboard navigation, independently of programmatic focus.
    await page.keyboard.press("Shift+Tab");
    await expect(nav.locator("a").nth(facts.links.length - 2)).toBeFocused();
  });
}

