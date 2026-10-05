import { test, expect } from "@playwright/test";
import { newGames, type BoardId } from "../src/lib/newCatalog";
import {
  newBoard,
  neighbors,
  pegMoves,
  knightMoves,
  strategyMoves,
} from "../src/lib/boardExpansion";
import { question } from "../src/lib/quizExpansion";
test("board keyboard navigation crosses clues safely and enlarged cells remain inside the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#/jogar/latin");
  const game = page.locator('[data-new-game="latin"]');
  await expect(game).toBeVisible();
  await page
    .getByRole("button", { name: "Ir para o tabuleiro", exact: true })
    .click();
  await page.keyboard.press("ArrowRight");
  await expect(game.locator('[data-index="0"]')).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  const clue = game.locator('[data-index="2"]');
  await expect(clue).toBeFocused();
  const content = await clue.textContent();
  await page.keyboard.press("1");
  await expect(clue).toHaveText(content!);
  await expect(game.locator('.new-grid button[tabindex="0"]')).toHaveCount(1);
  await page.goto("./#/jogar/queens");
  const queens = page.locator('[data-new-game="queens"]');
  await queens.getByRole("button", { name: "Ampliar tabuleiro" }).click();
  expect(
    (await queens.locator('[data-index="0"]').boundingBox())!.width,
  ).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
for (const game of newGames)
  test(`${game.id}: real input, pause, reset and mobile layout`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`./#/jogar/${game.id}`);
    const arena = page.locator(`[data-new-game="${game.id}"]`);
    await expect(arena).toBeVisible();
    await expect(page.locator(".player > h1")).toHaveText(game.name);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (game.family === "board") {
      const s = newBoard(game.id as BoardId),
        cell = (i: number) => arena.locator(`[data-index="${i}"]`);
      if (game.id === "flood")
        await arena
          .locator(".value-picker button")
          .filter({ hasText: String((s.cells[0] % 4) + 1) })
          .click();
      else if (game.id === "peg") {
        const [from, , to] = pegMoves(s.cells, s.size)[0];
        await cell(from).click();
        await cell(to).click();
      } else if (game.id === "knight")
        await cell(knightMoves(s.selected, s.cells, s.size)[0]).click();
      else if (
        ["latin", "takuzu", "sky", "futoshiki", "magic"].includes(game.id)
      ) {
        const i = s.fixed.findIndex((v) => !v);
        await arena
          .locator(".value-picker button")
          .filter({
            hasText: new RegExp(
              `^${game.id === "takuzu" ? s.goal[i] - 1 : s.goal[i]}$`,
            ),
          })
          .click();
        await cell(i).click();
      } else if (game.id === "fifteen")
        await cell(neighbors(s.cells.indexOf(0), s.size)[0]).click();
      else if (game.id === "pipes" || game.id === "laser")
        await cell(s.cells.findIndex((v, i) => v !== s.goal[i])).click();
      else if (game.id === "loop")
        await arena
          .getByRole("button", { name: "Segmento 1 a 2", exact: true })
          .click();
      else if (["colorsort", "watersort"].includes(game.id)) {
        await arena.getByRole("button", { name: /Pilha 1:/ }).click();
        await arena.getByRole("button", { name: /Pilha 5:/ }).click();
      } else if (game.id === "memorypath") {
        await arena.getByRole("button", { name: "Ocultar trilha" }).click();
        await cell(s.goal[0]).click();
      } else if (game.id === "slideblock") {
        await cell(21).click();
        await arena.getByRole("button", { name: "Deslizar →" }).click();
      } else if (game.id === "links") {
        const t = s.fixed.findIndex((v) => v === 1);
        await cell(t).click();
        await cell(
          neighbors(t, 4).find((i) => s.goal[i] === 1 && !s.fixed[i])!,
        ).click();
      } else if (
        [
          "gomoku",
          "hex",
          "ataxx",
          "isolation",
          "breakthrough",
          "mancala",
          "chomp",
          "territory",
        ].includes(game.id)
      ) {
        const move = strategyMoves(s, 1).find(
          ([, b]) => game.id !== "chomp" || b !== 0,
        )!;
        if (["ataxx", "isolation", "breakthrough"].includes(game.id))
          await cell(move[0]).click();
        await cell(move[1]).click();
      } else await cell(0).click();
      await expect(
        arena.getByRole("button", { name: "Desfazer", exact: true }),
      ).toBeEnabled();
      await arena
        .getByRole("button", { name: "Desfazer", exact: true })
        .click();
    } else if (game.family === "quiz") {
      const q = question(game.id, 1, 1, 0);
      if (game.id === "hangman")
        await arena
          .getByRole("button", { name: q.answer[0], exact: true })
          .click();
      else if (game.id === "wordsearch") {
        await arena.locator(".wordsearch-grid button").nth(0).click();
        await arena.locator(".wordsearch-grid button").nth(2).click();
        await expect(arena.getByRole("status")).toContainText("SOL encontrada");
      } else if (q.choices.length) {
        await arena
          .getByRole("button", { name: q.answer, exact: true })
          .click();
        await expect(arena.getByRole("status")).toContainText("Resposta certa");
      } else {
        if (game.id === "estimate")
          await arena.getByRole("button", { name: "Ocultar pontos" }).click();
        await arena
          .getByLabel(
            game.id === "twentyfour"
              ? "Expressão usando + - * / e parênteses"
              : "Sua resposta",
            { exact: true },
          )
          .fill(game.id === "twentyfour" ? "8/(3-8/3)" : q.answer);
        await arena.getByRole("button", { name: "Confirmar resposta" }).click();
        await expect(
          arena.getByRole("button", { name: "Próxima rodada" }),
        ).toBeVisible();
      }
    } else {
      const epoch = Date.now();
      await page.clock.install({ time: epoch });
      await page.clock.pauseAt(epoch + 1000);
      await arena.getByRole("button", { name: "Começar", exact: true }).click();
      await expect(arena.locator("canvas")).toBeFocused();
      await page.keyboard.down("ArrowRight");
      await page.clock.runFor(game.id === "stack" ? 1100 : 250);
      await page.keyboard.up("ArrowRight");
      if (["rhythm", "balloons"].includes(game.id))
        await arena
          .getByRole("button", { name: "Faixa 1", exact: true })
          .click();
      else if (["stack", "rope", "turret", "ricochet"].includes(game.id))
        await arena.getByRole("button", { name: "Ação", exact: true }).click();
      await page.clock.runFor(120);
      await page.evaluate(() =>
        window.dispatchEvent(new Event("pg-arcade-pause")),
      );
      await expect(arena.getByRole("status")).toHaveText("Partida pausada");
      const frozen = await arena.locator(".new-hud").textContent();
      await page.clock.runFor(2000);
      await expect(arena.locator(".new-hud")).toHaveText(frozen!);
      await arena
        .getByRole("button", { name: "Continuar", exact: true })
        .click();
      await page.clock.runFor(120);
      await expect(arena.getByRole("status")).toHaveText(
        "Partida em andamento.",
      );
    }
    await arena.getByRole("button", { name: "Reiniciar", exact: true }).click();
    if (game.family === "board")
      await expect(arena.locator(".new-hud strong").first()).toHaveText("0");
    if (game.family === "motion")
      await expect(
        arena.getByRole("button", { name: "Começar", exact: true }),
      ).toBeVisible();
    if (game.family === "quiz")
      await expect(arena.locator(".new-hud strong").first()).toHaveText("0");
    expect(errors).toEqual([]);
  });

test("eight queens saves a genuine victory, undo cannot award it twice, and reload preserves record", async ({
  page,
}) => {
  await page.goto("./#/jogar/queens");
  const game = page.locator('[data-new-game="queens"]');
  for (const [r, c] of [0, 4, 7, 5, 2, 6, 1, 3].entries())
    await game.locator(`[data-index="${r * 8 + c}"]`).click();
  await expect(game.getByRole("status")).toHaveText("Desafio concluído!");
  await expect(game.locator(".new-hud strong").nth(1)).not.toHaveText("0");
  const record = await game.locator(".new-hud strong").nth(1).textContent();
  expect(Number(record)).toBeGreaterThan(0);
  await game.getByRole("button", { name: "Desfazer", exact: true }).click();
  await game.locator('[data-index="59"]').click();
  await expect(game.locator(".new-hud strong").nth(1)).toHaveText(record!);
  await page.reload();
  await expect(game.locator(".new-hud strong").nth(1)).toHaveText(record!);
});

const scoredQuizIds = [
  "arithmetic",
  "fractions",
  "primes",
  "equation",
  "numsequence",
  "anagram",
  "stroop",
  "oddone",
  "estimate",
] as const;

for (const id of scoredQuizIds)
  test(`${id}: all quiz rounds score, complete and persist`, async ({ page }) => {
    test.setTimeout(45000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`./#/jogar/${id}`);
    const arena = page.locator(`[data-new-game="${id}"]`);
    for (let r = 0; r < 10; r++) {
      const q = question(id, 1, 1, r);
      if (q.choices.length)
        await arena
          .getByRole("button", { name: q.answer, exact: true })
          .click();
      else {
        if (id === "estimate")
          await arena.getByRole("button", { name: "Ocultar pontos" }).click();
        await arena.getByLabel("Sua resposta", { exact: true }).fill(q.answer);
        await arena.getByRole("button", { name: "Confirmar resposta" }).click();
      }
      if (r < 9)
        await arena.getByRole("button", { name: "Próxima rodada" }).click();
    }
    await expect(
      arena.getByRole("heading", { name: "Sessão concluída" }),
    ).toBeVisible();
    await expect(arena.locator(".new-hud strong").nth(1)).not.toHaveText("0");
    await page.reload();
    await expect(arena.locator(".new-hud strong").nth(1)).not.toHaveText("0");
  });

test("hangman and word search reach actual victory without timers", async ({
  page,
}) => {
  await page.goto("./#/jogar/hangman");
  let game = page.locator('[data-new-game="hangman"]');
  for (const ch of new Set(question("hangman", 1, 1, 0).answer))
    await game.getByRole("button", { name: ch, exact: true }).click();
  await expect(game.getByRole("status")).toHaveText("Palavra descoberta!");
  await page.goto("./#/jogar/wordsearch");
  game = page.locator('[data-new-game="wordsearch"]');
  for (const [a, b] of [
    [0, 2],
    [9, 21],
    [30, 32],
    [18, 20],
  ]) {
    await game.locator(".wordsearch-grid button").nth(a).click();
    await game.locator(".wordsearch-grid button").nth(b).click();
  }
  await expect(game.getByRole("status")).toHaveText(
    "Todas as palavras encontradas!",
  );
});
