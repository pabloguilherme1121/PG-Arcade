import { CATALOG_SIZE } from "../src/lib/catalogRelease";
import { expect, test } from "@playwright/test";

test("all 150 covers preserve original artwork without decorative inline SVG", async ({ page }) => {
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
  expect(result.covers).toBe(CATALOG_SIZE);
  expect(result.artImages).toBe(CATALOG_SIZE);
  expect(result.gradients).toBe(0);
  expect(result.uniqueGradients).toBe(0);
  // 150 covers × no decorative inline SVG; artwork remains as separately loaded SVG images.
  expect(result.decorativePaths).toBe(0);
});
