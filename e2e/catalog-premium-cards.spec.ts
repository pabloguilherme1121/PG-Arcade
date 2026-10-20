import { expect, test } from "@playwright/test";
import { games } from "../src/lib/catalog";

for (const width of [320, 390]) {
  test(`premium cards retain keyboard focus, accurate modes and local favorites at ${width}px`, async ({ page, browserName }) => {
    if (browserName === "firefox") test.slow();
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const cards = page.locator(".game-grid .game-card");
    await expect(cards).toHaveCount(games.length);
    const card = cards.filter({ has: page.getByRole("link", { name: /^Jogar Snake/ }) });
    const link = card.getByRole("link", { name: /^Jogar Snake/ });
    // Read independent presentation contracts together, avoiding several
    // full-catalog protocol snapshots while retaining real focus/click actions.
    const appearance = await card.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const border = getComputedStyle(element);
      const catalog = document.querySelectorAll('.game-grid .game-card');
      return { width: rect.width, radius: parseFloat(border.borderTopLeftRadius), border: border.borderTopStyle,
        firstPriority: catalog[0]?.querySelector('img.cover-mechanic')?.getAttribute('fetchpriority'),
        fifthPriority: catalog[4]?.querySelector('img.cover-mechanic')?.getAttribute('fetchpriority'),
        metadataDisplay: getComputedStyle(element.querySelector('.game-metadata')!).display,
        modeCount: element.querySelectorAll('[data-game-mode]').length };
    });
    // Integration contract with #120: preserve eager/lazy cover priorities.
    expect(appearance.firstPriority).toBe('high');
    expect(appearance.fifthPriority).toBe('low');
    expect(appearance.metadataDisplay).toBe('flex');
    expect(appearance.modeCount).toBeGreaterThan(0);
    expect(appearance.width).toBeGreaterThan(0);
    expect(appearance.radius).toBeGreaterThanOrEqual(14);
    expect(appearance.border).toBe("solid");
    await link.focus();
    await expect(link).toBeFocused();

    const favorite = card.getByRole("button", { name: "Adicionar Snake aos favoritos" });
    await favorite.click();
    await expect(card.getByRole("button", { name: "Remover Snake dos favoritos" })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(cards).toHaveCount(games.length);
    await expect(card.getByRole("button", { name: "Remover Snake dos favoritos" })).toHaveAttribute("aria-pressed", "true");
    await link.click();
    await expect(page).toHaveURL(/#\/jogar\/snake/);
    await page.getByRole("link", { name: "Voltar aos jogos", exact: true }).click();
    await expect(card).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("premium cards obey reduced motion and high contrast without layout overflow", async ({ page, browserName }) => {
  if (browserName === "firefox") test.slow();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("pg-arcade-preferences-v1", JSON.stringify({
    contrast: true, motion: "reduced", controls: "large",
  })));
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("data-arcade-contrast", "true");
  const card = page.locator(".game-card").first();
  await expect(card).toBeVisible();
  expect(await card.evaluate(element => ({
    transition: getComputedStyle(element).transitionDuration,
    background: getComputedStyle(element).backgroundColor,
  }))).toEqual({ transition: "0s", background: "rgb(0, 0, 0)" });
});
