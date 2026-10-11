import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const criticalGames = [
  ["2048", "2048"],
  ["xadrez", "Xadrez"],
  ["damas", "Damas"],
  ["futebol", "Futebol"],
] as const;

for (const [id, name] of criticalGames) {
  test(`${id}: critical accessibility contract stays clean cross-browser`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`./#/jogar/${id}`);

    await expect(page.locator(".player h1")).toHaveText(name);
    await expect(page.locator("[data-arcade-arena]").first()).toBeVisible();

    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(
      audit.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  });
}
