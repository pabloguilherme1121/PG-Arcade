import { expect, test } from "@playwright/test";
import { shuffledPairs } from "../src/lib/engines";

test("Memória highlights consecutive pairs without changing scoring or touch targets", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./#/jogar/memoria");
  await page.getByRole("combobox", { name: "Dificuldade da memória" }).selectOption("4");
  const streak = page.locator("[data-memory-streak]");
  const summary = page.locator("[data-memory-streak-tier]");
  await expect(summary).toHaveAttribute("data-memory-streak-tier", "none");
  await expect(streak).toHaveText("0");
  const cards = shuffledPairs(4, () => 0);
  for (let pair = 0; pair < 3; pair++) {
    const positions = cards.flatMap((id, index) => id === pair ? [index] : []);
    expect(positions).toHaveLength(2);
    await page.locator(`[data-memory-index="${positions[0]}"]`).click();
    await page.locator(`[data-memory-index="${positions[1]}"]`).click();
    await expect(streak).toHaveText(String(pair + 1));
    await expect(page.locator(".game-status")).toContainText(
      `${pair + 1} ${pair === 0 ? "par seguido" : "pares seguidos"}`,
    );
    await expect(summary).toHaveAttribute("data-memory-streak-tier", pair >= 2 ? "combo" : "building");
    await expect(page.locator("[data-memory-pairs]")).toHaveText(`${pair+1}/4`);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole("button", { name: "Nova partida", exact: true }).click();
  await expect(summary).toHaveAttribute("data-memory-streak-tier", "none");
  await expect(streak).toHaveText("0");
});

test("Memória combo feedback remains static with reduced motion at 320px", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/memoria");
  await page.getByRole("combobox", { name: "Dificuldade da memória" }).selectOption("4");
  const cards = shuffledPairs(4, () => 0);
  for (let id = 0; id < 3; id++) {
    const positions = cards.flatMap((value, index) => value === id ? [index] : []);
    await page.locator(`[data-memory-index="${positions[0]}"]`).click();
    await page.locator(`[data-memory-index="${positions[1]}"]`).click();
  }
  const summary = page.locator("[data-memory-streak-tier]");
  await expect(summary).toHaveAttribute("data-memory-streak-tier", "combo");
  await expect(summary).toHaveCSS("animation-name", "none");
  const contrast = await summary.evaluate(el => ({
    background: getComputedStyle(el).backgroundImage,
    border: getComputedStyle(el).borderTopColor,
  }));
  expect(contrast.background).toContain("linear-gradient");
  expect(contrast.border).not.toBe("rgba(0, 0, 0, 0)");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
