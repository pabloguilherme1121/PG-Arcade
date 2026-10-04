import { test, expect } from "@playwright/test";
test("catalog search, categories, favorites and direct links persist", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".game-card")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Adicionar Snake aos favoritos" })
    .click();
  await page.getByRole("link", { name: "Favoritos", exact: true }).click();
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Jogar Snake", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Jogos", exact: true }).click();
  await page.getByLabel("Buscar jogo").fill("memoria");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page.getByLabel("Buscar jogo").fill("");
  await page.getByRole("button", { name: "Reflexos", exact: true }).click();
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Jogar Snake", exact: true }).click();
  await expect(page.locator(".snake-board")).toBeVisible();
  await page.reload();
  await expect(page.locator(".snake-board")).toBeVisible();
  await page.getByRole("link", { name: "Meu progresso" }).click();
  await expect(page.getByText("1 de 8")).toBeVisible();
});
test("2048 keyboard move, undo, reset and record persistence", async ({
  page,
}) => {
  await page.goto("/#/jogar/2048");
  const board = page.locator(".board2048");
  await expect(board.locator(".tile:not(.tile-0)")).toHaveCount(2);
  const initial = await board.textContent();
  for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"])
    await board.press(key);
  await expect(page.getByRole("button", { name: "Desfazer" })).toBeEnabled();
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(page.getByRole("button", { name: "Desfazer" })).toBeDisabled();
  await page.getByRole("button", { name: "Nova partida" }).click();
  await expect(board.locator(".tile:not(.tile-0)")).toHaveCount(2);
  expect(initial).toBeTruthy();
});
test("Snake starts, pauses, blocks reverse direction and resets", async ({
  page,
}) => {
  await page.goto("/#/jogar/snake");
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pausar", exact: true }),
  ).toBeVisible();
  await page.locator(".snake-board").press("ArrowLeft");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect(
    page.getByText("Partida pausada.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nova partida" }).click();
  await expect(
    page.getByRole("button", { name: "Jogar", exact: true }),
  ).toBeEnabled();
});
test("Memory completes all pairs and stores the best score", async ({
  page,
}) => {
  await page.goto("/#/jogar/memoria");
  const cards = page.locator(".memory-card");
  await expect(cards).toHaveCount(16);
  const known = new Map<string, number[]>();
  for (let i = 0; i < 16; i += 2) {
    for (const index of [i, i + 1]) {
      await cards.nth(index).click();
      const name = (await cards.nth(index).getAttribute("aria-label"))!.split(
        ": ",
      )[1];
      known.set(name, [...(known.get(name) || []), index]);
    }
    await expect(
      page.locator(".memory-card.revealed:not(.matched)"),
    ).toHaveCount(0);
  }
  for (const pair of known.values()) {
    if (await cards.nth(pair[0]).isDisabled()) continue;
    await cards.nth(pair[0]).click();
    await cards.nth(pair[1]).click();
    await expect(cards.nth(pair[0])).toBeDisabled();
  }
  await expect(page.getByText(/Todos os pares encontrados/)).toBeVisible();
  await expect(
    page.locator(".scores>div").nth(1).locator("strong"),
  ).not.toHaveText("—");
  await page.reload();
  await expect(
    page.locator(".scores>div").nth(1).locator("strong"),
  ).not.toHaveText("—");
});
for (const width of [320, 390, 1280])
  test(`all eight games render and fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".game-card")).toHaveCount(8);
    for (const id of [
      "2048",
      "snake",
      "memoria",
      "xadrez",
      "futebol",
      "domino",
      "damas",
      "velha",
    ]) {
      await page.goto(`/#/jogar/${id}`);
      await expect(page.locator("[data-arcade-arena]").first()).toBeVisible();
      await expect(page.getByText("Carregando", { exact: false })).toHaveCount(
        0,
      );
      await expect(
        page.getByText("O jogo não carregou.", { exact: true }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
test("blocked storage remains playable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/#/jogar/2048");
  await expect(page.locator(".board2048")).toBeVisible();
  await expect(page.getByText(/O navegador bloqueou/)).toBeVisible();
  await page.locator(".board2048").press("ArrowLeft");
});
