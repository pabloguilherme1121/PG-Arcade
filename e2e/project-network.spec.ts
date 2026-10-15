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
    await expect(links).toHaveCount(6);
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
