import { expect, test } from "@playwright/test";
import { games } from "../src/lib/catalog";

test("catalog prioritizes visible cover images and defers the rest without omitting games", async ({ page }) => {
  await page.goto("./");
  const cards = page.locator(".game-grid .game-card");
  await expect(cards).toHaveCount(games.length);

  const images = await cards.locator("img.cover-mechanic").evaluateAll(nodes =>
    nodes.map(image => ({
      loading: image.getAttribute("loading"),
      priority: image.getAttribute("fetchpriority"),
    })),
  );
  expect(images).toHaveLength(games.length);
  expect(images.slice(0, 4).every(image => image.loading === "eager" && image.priority === "high")).toBe(true);
  expect(images.slice(4).every(image => image.loading === "lazy" && image.priority === "low")).toBe(true);

  await page.getByRole("link", { name: "Jogar Snake", exact: true }).click();
  const currentCover = page.locator(".player-coverline img.cover-mechanic");
  await expect(currentCover).toHaveAttribute("loading", "eager");
  await expect(currentCover).toHaveAttribute("fetchpriority", "high");
});
