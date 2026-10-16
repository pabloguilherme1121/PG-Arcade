import { expect, test } from "@playwright/test";

test.describe("jornadas de partida em famílias de jogos", () => {
  test.use({ hasTouch: true });

  test("Memória 320px preserva a carta durante a pausa e reinicia sem mudar a dificuldade", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("./#/jogar/memoria");
    const difficulty = page.getByLabel("Dificuldade da memória", { exact: true });
    await difficulty.selectOption("4");
    const cards = page.locator(".memory-card");
    await expect(cards).toHaveCount(8);
    await cards.first().tap();
    await expect(cards.first()).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Pausar", exact: true }).click();
    await expect(page.locator(".memory-card:disabled")).toHaveCount(8);
    await expect(page.locator(".game-status")).toContainText("Partida pausada");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(cards.first()).toBeEnabled();
    await expect(cards.first()).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Nova partida", exact: true }).click();
    await expect(cards.first()).toHaveAttribute("aria-pressed", "false");
    await expect(difficulty).toHaveValue("4");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });

  test("Snake alterna entre jogar, pausa, retomada e partida nova sem apagar o progresso", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./#/jogar/snake");
    const board = page.locator(".snake-board");
    await expect(board).toBeVisible();
    await page.getByRole("button", { name: "Jogar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Pausar", exact: true }).click();
    await expect(page.locator(".game-status")).toContainText("Partida pausada");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Nova partida", exact: true }).click();
    await expect(page.getByRole("button", { name: "Jogar", exact: true })).toBeVisible();
    await expect(page.locator(".snake-board .board-overlay")).toContainText("Vamos jogar?");
  });

  test("2048 separa reinício de recorde e bloqueia desfazer na dificuldade difícil", async ({ page }) => {
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.goto("./#/jogar/2048");
    await page.getByLabel("Dificuldade do 2048").selectOption("easy");
    const score = page.locator(".scores strong").first();
    const record = page.locator(".scores strong").nth(1);
    await page.locator(".board2048").press("ArrowLeft");
    await expect(score).toHaveText("4");
    await expect(record).toHaveText("4");
    await page.getByRole("button", { name: "Nova partida", exact: true }).click();
    await expect(score).toHaveText("0");
    await expect(record).toHaveText("4");
    await page.getByLabel("Dificuldade do 2048").selectOption("hard");
    await expect(page.getByRole("button", { name: "Desfazer", exact: true })).toBeDisabled();
    await expect(record).toHaveText("0");
  });
});
