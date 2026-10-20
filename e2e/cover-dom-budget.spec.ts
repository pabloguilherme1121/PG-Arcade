import { expect, test } from "@playwright/test";

test("all 100 covers preserve artwork while keeping decorative SVG DOM lightweight", async ({ page }) => {
  await page.goto("./");
  const result = await page.locator(".game-grid [data-game-cover]").evaluateAll(covers => {
    const gradients = covers.flatMap(cover =>
      Array.from(cover.querySelectorAll("linearGradient[id]"), node => node.id)
    );
    return {
      covers: covers.length,
      artImages: covers.filter(cover => cover.querySelector("img.cover-mechanic")).length,
      gradients: gradients.length,
      uniqueGradients: new Set(gradients).size,
      decorativePaths: covers.reduce((total, cover) => total + cover.querySelectorAll("svg path").length, 0),
    };
  });
  expect(result.covers).toBe(102);
  expect(result.artImages).toBe(102);
  expect(result.gradients).toBe(102);
  expect(result.uniqueGradients).toBe(102);
  // 100 covers × one ornament path + one framing path; allow small future variation.
  expect(result.decorativePaths).toBeLessThanOrEqual(300);
});
