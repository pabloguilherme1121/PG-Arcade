import { test, expect } from "@playwright/test";
for (const width of [320, 390, 1280]) {
  test(`project discovery remains usable at ${width}px`, async ({ page }) => {
    // Firefox's retained full-catalog trace exceeds 30s at 132 games even
    // when links, 44px targets and Shift+Tab all succeed. Keep every check.
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./", { waitUntil: "domcontentloaded" });
    // Resolve, scroll and inspect in one browser call. Locator helpers resolve
    // extra handles whose full-catalog trace snapshots dominated the deadline.
    const ready = await page.waitForFunction(() => {
      const element = document.querySelector<HTMLElement>("footer nav.project-network-links");
      if (!element) return false;
      element.scrollIntoView({ block: "nearest", behavior: "instant" });
      return {
        label: element.getAttribute("aria-label"),
        links: Array.from(element.querySelectorAll("a"), link => {
          link.focus();
          return { name: link.textContent?.trim(), href: link.getAttribute("href"),
            height: link.getBoundingClientRect().height, focused: document.activeElement === link };
        }),
        fits: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    const facts = await ready.jsonValue();
    await ready.dispose();
    if (!facts) throw new Error("Project navigation did not become ready");
    expect(facts.label).toBe("Outros projetos de Pablo Guilherme");
    expect(facts.links.map(({ name, href }) => [name, href])).toEqual([
      ["Todos os projetos", "https://pabloguilherme1121.github.io/PG-portfolio/#rede-projetos"],
      ["Eleições Goiás", "https://pabloguilherme1121.github.io/eleicoes-goias-2026/"],
      ["Observatório", "https://pabloguilherme01.github.io/observatorio/#dashboard"],
      ["Mapa Planaltina", "https://pabloguilherme01.github.io/mapa-planaltina-go/"],
      ["Trajeto · código", "https://github.com/Pabloguilherme01/trajeto-web"],
      ["Eliane Fashion · template", "https://github.com/pabloguilherme1121/elianefashion-netlify-template"],
    ]);
    for (const link of facts.links) {
      expect(link.focused).toBe(true);
      expect(link.height).toBeGreaterThanOrEqual(44);
    }
    expect(facts.fits).toBe(true);
    // Also prove real keyboard navigation, independently of programmatic focus.
    await page.keyboard.press("Shift+Tab");
    await page.waitForFunction(count => {
      const links = document.querySelectorAll("footer nav.project-network-links a");
      return links.length === count && document.activeElement === links[count - 2];
    }, facts.links.length, { timeout: 5_000 });
  });
}

// Optional UI requested before the service worker takes control may be unavailable
// on the first offline reload. The game and persisted preferences must survive.
test("optional panel failures keep the game and saved preferences usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("pg-arcade-preferences-v1", JSON.stringify({ contrast: true, motion: "reduced", controls: "large" })));
  await page.route(/\/(?:VisualPreferences|ProjectNetwork)-[^/]+\.(?:js|css)$/, route => route.abort());
  await page.goto("./#/jogar/2048");
  const board = page.locator(".board2048");
  await expect(board).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-arcade-controls", "large");
  await expect(page.locator("html")).toHaveAttribute("data-arcade-contrast", "true");
  await page.locator("#conforto summary").click();
  await expect(page.locator("#conforto [role=status]")).toContainText("preferências salvas continuam ativas");
  for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"]) await board.press(key);
  await expect(page.getByRole("button", { name: "Desfazer", exact: true })).toBeEnabled();
  await expect(page.locator("footer a")).toHaveAttribute("href", "https://pabloguilherme1121.github.io/PG-portfolio/#rede-projetos");
  expect(errors).toEqual([]);
});
