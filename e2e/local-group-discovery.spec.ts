import { expect, test } from "@playwright/test";
import { games } from "../src/lib/catalog";

for (const width of [320, 390]) {
  test(`grupo local mostra somente os jogos com 3–4 participantes a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const group = page.locator(".smart-mode-chips").getByRole("button", { name: "Grupo local (3–4)", exact: true });
    await group.click();
    await expect(group).toHaveAttribute("aria-pressed", "true");
    const matching = await page.evaluate(() => ({
      ids: [...document.querySelectorAll<HTMLElement>(".game-grid [data-catalog-game]")]
        .map(card => card.dataset.catalogGame),
      noOverflow: document.documentElement.scrollWidth <= innerWidth,
    }));
    expect(matching.ids).toEqual(["leilao", "comum"]);
    expect(matching.noOverflow).toBe(true);

    await page.reload();
    await page.waitForFunction(() =>
      document.querySelector(".smart-mode-chips button[aria-pressed='true']")?.textContent?.includes("Grupo local") &&
      document.querySelectorAll(".game-grid [data-catalog-game]").length === 2
    );
    await group.click();
    await page.waitForFunction(length =>
      document.querySelectorAll(".game-grid [data-catalog-game]").length === length &&
      document.documentElement.scrollWidth <= innerWidth,
      games.length,
    );
  });
}
