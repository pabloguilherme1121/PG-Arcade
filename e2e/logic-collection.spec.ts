import { test, expect } from "@playwright/test";
import { sudokuSolution, maze, path, fleet } from "../src/lib/logicCollection";
import type { Page } from "@playwright/test";
async function open(page: Page, id: string) {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto(`./#/jogar/${id}`);
  await page
    .locator(".logic-collection")
    .getByLabel("Dificuldade")
    .selectOption("0");
}
async function won(page: Page) {
  await expect(page.locator(".lc-success")).toContainText("Desafio vencido");
  await expect(page.locator(".lc-stats")).toContainText("Pontos 100");
}
test("Sudoku accepts a completed board and records the victory", async ({
  page,
}) => {
  await open(page, "sudoku");
  const values = sudokuSolution(4, 1),
    cells = page.locator(".lc-grid button");
  for (let i = 0; i < 16; i++) {
    if ((await cells.nth(i).getAttribute("aria-label"))!.includes("pista fixa"))
      continue;
    await cells.nth(i).click();
    await page
      .locator(".lc-actions")
      .getByRole("button", { name: String(values[i]), exact: true })
      .click();
  }
  await won(page);
  await page.reload();
  await expect(page.locator(".lc-stats")).toContainText("Recorde 100");
});
test("Nonogram solves a figure with clues and advances the series", async ({
  page,
}) => {
  await open(page, "nonograma");
  await page
    .locator(".logic-collection")
    .getByLabel("Modo", { exact: true })
    .selectOption("serie");
  for (let i = 0; i < 25; i++)
    if ((Math.floor(i / 5) * 3 + (i % 5) * 5 + 1) % 7 < 3)
      await page.locator(".lc-grid button").nth(i).click();
  await won(page);
  await page
    .getByRole("button", { name: "Próximo desafio", exact: true })
    .click();
  await expect(page.locator(".lc-stats")).toContainText("Desafio 2 / 5");
});
test("Maze WASD path reaches the actual exit", async ({ page }) => {
  await open(page, "labirinto");
  const route = path(maze(9, 13), 9, 10, 70);
  const board = page.locator(".lc-grid");
  await board.focus();
  for (let i = 1; i < route.length; i++) {
    const delta = route[i] - route[i - 1];
    await board.press(
      delta === 1 ? "d" : delta === -1 ? "a" : delta === 9 ? "s" : "w",
    );
  }
  await won(page);
});
test("Sokoban rejects a wall then pushes a box onto its depot", async ({
  page,
}) => {
  await open(page, "sokoban");
  const board = page.locator(".lc-grid");
  await board.focus();
  await board.press("ArrowUp");
  await expect(
    page.getByRole("status").filter({ hasText: "Movimentos:" }),
  ).toContainText("Movimentos: 0");
  for (let i = 0; i < 3; i++) await board.press("ArrowLeft");
  await won(page);
});
test("Hanoi transfers three discs with seven legal moves", async ({ page }) => {
  await open(page, "hanoi");
  const towers = page.locator(".lc-towers button");
  for (const [a, b] of [
    [0, 2],
    [0, 1],
    [2, 1],
    [0, 2],
    [1, 0],
    [1, 2],
    [0, 2],
  ]) {
    await towers.nth(a).click();
    await towers.nth(b).click();
  }
  await won(page);
  await expect(towers.nth(2)).toHaveAttribute(
    "aria-label",
    "Torre 3, discos 3, 2, 1",
  );
});
test("Secret code gives a real exact-match victory", async ({ page }) => {
  await open(page, "senha");
  await page
    .getByRole("button", { name: "Testar código", exact: true })
    .click();
  await expect(page.locator(".lc-history")).toContainText(
    "3 exatos, 0 deslocados",
  );
  await won(page);
});
test("Nim enforces reverse-last-piece mode and reaches a terminal result", async ({
  page,
}) => {
  await open(page, "nim");
  await page
    .locator(".logic-collection")
    .getByLabel("Modo", { exact: true })
    .selectOption("reverso");
  for (let round = 0; round < 20; round++) {
    const controls = page.locator(".lc-nim button:enabled");
    if (!(await controls.count())) break;
    await controls.first().click();
  }
  await expect(
    page.getByRole("status").filter({ hasText: /última/ }),
  ).toBeVisible();
  await expect(page.locator(".lc-nim button:enabled")).toHaveCount(0);
});
test("Reversi places and brackets pieces, then completes a full match", async ({
  page,
}) => {
  await open(page, "reversi");
  const moves = page.locator('.lc-grid button[aria-label$="jogada legal"]');
  await expect(moves).toHaveCount(4);
  await moves.first().click();
  await expect(
    page.getByRole("status").filter({ hasText: /Adversário/ }),
  ).toBeVisible();
  for (let turn = 0; turn < 36; turn++) {
    if (!(await moves.count())) break;
    await moves.first().click();
  }
  await expect(
    page.getByRole("status").filter({ hasText: /venceu|Empate/ }),
  ).toBeVisible();
});
test("Naval hits every real fleet segment and stores a win", async ({
  page,
}) => {
  await open(page, "batalha");
  for (const i of fleet(6, 3, 1))
    await page.locator(".lc-grid button").nth(i).click();
  await won(page);
  await expect(
    page.getByRole("status").filter({ hasText: "Frota inteira" }),
  ).toBeVisible();
});
test("Dots and boxes captures territory and finishes a complete board", async ({
  page,
}) => {
  await open(page, "pontes");
  for (let turn = 0; turn < 12; turn++) {
    const free = page.locator(".lc-territory button:enabled");
    if (!(await free.count())) break;
    await free.first().click();
  }
  await expect(
    page.getByRole("status").filter({ hasText: /venceu|Empate/ }),
  ).toBeVisible();
  await expect(page.locator(".lc-owned:not(.lc-owner-0)")).toHaveCount(4);
});
