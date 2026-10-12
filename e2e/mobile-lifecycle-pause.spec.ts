import { expect, test } from "@playwright/test";

/**
 * Mobile browsers can put a PWA in the back-forward cache or freeze a page
 * without delivering blur/visibilitychange first. Both must pause live games.
 */
for (const game of [
  { id: "runner", overlay: ".action-collection-overlay" },
  { id: "turret", overlay: ".motion-overlay" },
] as const) {
  test(`${game.id} pauses on pagehide and freeze and can resume`, async ({ page }) => {
    await page.goto(`./#/jogar/${game.id}`);
    const overlay = page.locator(game.overlay);
    await overlay.getByRole("button", { name: "Começar" }).click();
    await expect(overlay).toBeHidden();

    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole("button", { name: "Continuar" })).toBeEnabled();

    await overlay.getByRole("button", { name: "Continuar" }).click();
    await expect(overlay).toBeHidden();

    await page.evaluate(() => document.dispatchEvent(new Event("freeze")));
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole("button", { name: "Continuar" })).toBeEnabled();
  });
}
