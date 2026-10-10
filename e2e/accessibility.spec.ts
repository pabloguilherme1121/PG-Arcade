import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { games } from "../src/lib/catalog";
for (const game of games)
  test(`${game.id}: WCAG audit at 390px`, async ({ page, browserName }) => {
    test.skip(
      browserName !== "chromium",
      "Axe semantic audits run once in Chromium; cross-browser interaction coverage remains in the gameplay suites.",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`./#/jogar/${game.id}`);
    await expect(page.locator(".player h1")).toHaveText(game.name);
    await expect(page.locator("[data-arcade-arena]").first()).toBeVisible();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
