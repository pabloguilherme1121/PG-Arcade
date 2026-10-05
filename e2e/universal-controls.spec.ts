import { test, expect } from "@playwright/test";
import { games } from "../src/lib/catalog";

test("all hundred games provide keyboard help and safe restart without losing records", async ({ page }) => {
  test.setTimeout(games.length * 4000);
  await page.addInitScript(() => localStorage.setItem("pg-arcade-progress-v1", JSON.stringify({ records: { snake: 70 }, favorites: ["snake"] })));
  for (const game of games) {
    await page.goto(`./#/jogar/${game.id}`);
    await expect(page.locator(".player > h1")).toHaveText(game.name);
    await expect(page.locator("[data-arcade-arena]").first()).toBeVisible();
    await page.getByRole("button", { name: "Ir para o tabuleiro", exact: true }).focus();
    await page.keyboard.press("Alt+Shift+h");
    const help = page.locator(".experience-tools details");
    await expect(help).toHaveAttribute("open", "");
    await expect(help).toContainText("Alt + Shift + B");
    await page.keyboard.press("Alt+Shift+h");
    await expect(help).not.toHaveAttribute("open", "");
    await page.keyboard.press("Alt+Shift+b");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("[data-arcade-arena]")))).toBe(true);
    // Word games deliberately ignore shortcuts while the answer field has focus.
    await page.getByRole("button", { name: "Reiniciar jogo", exact: true }).focus();
    await page.keyboard.press("Alt+Shift+r");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Continuar esta partida", exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pg-arcade-progress-v1")!));
    expect(saved.records.snake).toBe(70);
    expect(saved.favorites).toContain("snake");
  }
});

test("shortcut typing inside a word input does not open a restart dialog", async ({ page }) => {
  await page.goto("./#/jogar/palavra");
  await page.locator(".word-input").focus();
  await page.keyboard.press("Alt+Shift+r");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
