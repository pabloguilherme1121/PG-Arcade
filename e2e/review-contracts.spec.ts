import { test, expect, type Locator, type Page } from "@playwright/test";
import { actionCollectionGames } from "../src/lib/actionCollection";
import { dealDominoRound, getLegalDominoMoves, drawDominoUntilPlayable, placeDominoTile, getDominoPipTotal, type DominoTile } from "../src/features/portfolio/utils/domino";

test.use({ reducedMotion: "reduce", viewport: { width: 320, height: 740 } });

async function freeze(page: Page) {
  const date = new Date("2026-10-05T12:00:00Z");
  await page.clock.install({ time: date });
  await page.clock.pauseAt(new Date(date.getTime() + 1000));
}
async function swipe(board: Locator, dx: number, dy: number, cancelled = false) {
  await board.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 160, clientY: 220 }] });
  if (cancelled) await board.dispatchEvent("touchcancel");
  await board.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 160 + dx, clientY: 220 + dy }], touches: [] });
}

test("Snake touch queue survives pause and ignores cancelled gestures", async ({ page }) => {
  await page.goto("./#/jogar/snake");
  const board = page.locator(".snake-board");
  await expect(board).toBeVisible();
  await freeze(page);
  await page.getByRole("button", { name: "Jogar", exact: true }).click();
  await swipe(board, 0, -60, true);
  await page.clock.runFor(170);
  const cells = board.locator(":scope > span");
  await expect(cells.nth(8 * 16 + 8)).toHaveClass(/snake-head/);
  await swipe(board, 0, -60);
  await swipe(board, -60, 0);
  await board.press("Space");
  await page.clock.runFor(500);
  await expect(cells.nth(8 * 16 + 8)).toHaveClass(/snake-head/);
  await board.press("Space");
  await page.clock.runFor(170);
  await expect(cells.nth(7 * 16 + 8)).toHaveClass(/snake-head/);
  await page.clock.runFor(170);
  await expect(cells.nth(7 * 16 + 7)).toHaveClass(/snake-head/);
});

for (const id of ["corrida", "rally", "coleta", "orbital"]) {
  test(`${id} swipe steers one lane and ignores cancellation and pinch`, async ({ page }) => {
    await page.goto(`./#/jogar/${id}`);
    const board = page.locator(id === "corrida" ? ".race-board" : ".run-board");
    await expect(board).toBeVisible();
    await freeze(page);
    await page.getByRole("button", { name: id === "corrida" ? "Largar" : "Começar", exact: true }).click();
    const car = page.locator(".race-car");
    await swipe(board, 60, 0, true);
    await expect(car).toHaveAttribute("data-lane", "1");
    await board.dispatchEvent("touchstart", { touches: [{ identifier: 1, clientX: 100, clientY: 220 }, { identifier: 2, clientX: 200, clientY: 220 }] });
    await board.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 260, clientY: 220 }] });
    await expect(car).toHaveAttribute("data-lane", "1");
    await swipe(board, 60, 0);
    await expect(car).toHaveAttribute("data-lane", "2");
    await swipe(board, -60, 0);
    await expect(car).toHaveAttribute("data-lane", "2");
    await page.clock.runFor(210);
    await swipe(board, -60, 0);
    await expect(car).toHaveAttribute("data-lane", "1");
  });
}

test("race pedals release after pointer capture is lost", async ({ page }) => {
  await page.goto("./#/jogar/corrida");
  await expect(page.locator(".race-board")).toBeVisible();
  await freeze(page);
  await page.getByRole("button", { name: "Largar", exact: true }).click();
  const pedal = page.getByRole("button", { name: "Acelerar", exact: true });
  await pedal.hover();
  await page.mouse.down();
  await page.clock.runFor(800);
  const fast = Number.parseInt((await page.locator("[data-race-speed]").textContent())!);
  await pedal.evaluate((el) => el.dispatchEvent(new PointerEvent("lostpointercapture", { bubbles: true, pointerId: 1 })));
  await page.mouse.up();
  await page.clock.runFor(800);
  expect(Number.parseInt((await page.locator("[data-race-speed]").textContent())!)).toBeLessThan(fast);
});

test("runner quick keyboard activation of the mobile button reaches the physics step", async ({ page }) => {
  await page.goto("./#/jogar/runner");
  await expect(page.locator("canvas")).toBeVisible();
  await freeze(page);
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  const jump = page.getByRole("button", { name: "Saltar", exact: true });
  await jump.focus();
  await jump.press("Enter");
  await page.clock.runFor(160);
  expect(Number(await page.locator("canvas").getAttribute("data-player-y"))).toBeLessThan(280);
});

for (const level of ["master", "expert"]) {
  test(`all ten action games advance and pause at ${level}`, async ({ page }) => {
    test.setTimeout(90000);
    for (const { id } of actionCollectionGames) {
      await page.goto(`./#/jogar/${id}`);
      await expect(page.locator("canvas")).toBeVisible();
      await page.getByLabel("Dificuldade", { exact: true }).selectOption(level);
      await page.getByRole("button", { name: "Começar", exact: true }).click();
      await expect(page.locator(".action-hud")).toContainText("1 s");
      await page.getByRole("button", { name: "Pausar", exact: true }).click();
      const hud = await page.locator(".action-hud").textContent();
      await page.waitForTimeout(160);
      await expect(page.locator(".action-hud")).toHaveText(hud!);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test("expert chess responds within the worker budget and remains cancellable", async ({ page }) => {
  await page.goto("./#/jogar/xadrez");
  const game = page.locator('[data-chess-game="true"]');
  await game.getByRole("button", { name: /^especialista$/i }).click();
  const cells = game.getByRole("gridcell");
  await cells.nth(52).click();
  await cells.nth(36).click();
  await expect(game.getByRole("status").first()).toContainText("Sua vez", { timeout: 5000 });
  await game.getByRole("button", { name: "Desfazer jogada", exact: true }).click();
  await cells.nth(52).click();
  await cells.nth(36).click();
  await game.getByRole("button", { name: "Pausar", exact: true }).click();
  const board = await cells.allTextContents();
  await page.waitForTimeout(1600);
  expect(await cells.allTextContents()).toEqual(board);
});

test("checkers forces the capture chain then releases selection for the next turn", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("./#/jogar/damas");
  const game = page.locator('[data-checkers-game="true"]');
  await game.getByRole("button", { name: /1 × 1 local/i }).click();
  const cells = game.getByRole("gridcell");
  const moves = [[53,46],[12,21],[60,53],[14,23],[49,40],[21,28],[46,39],[5,12],[55,46],[28,35],[46,37],[10,19],[51,42],[35,49],[56,42],[3,10],[53,46],[8,17],[58,49],[19,26],[37,28],[12,19],[40,33],[26,40]];
  for (const [from, to] of moves) { await cells.nth(from).click(); await cells.nth(to).click(); }
  await expect(cells.nth(40)).toHaveAttribute("aria-selected", "true");
  await cells.nth(17).click();
  await expect(cells.nth(40)).toHaveAttribute("aria-selected", "true");
  await expect(cells.nth(58)).toHaveAttribute("data-legal-destination", "true");
  await cells.nth(58).click();
  await expect(game.locator('[data-checkers-status="true"]')).toContainText(/jogador 1|azul/i);
  await cells.nth(28).click();
  await expect(cells.nth(28)).toHaveAttribute("aria-selected", "true");
});

for (const [seed, winner, expected] of [[0, "player", 9], [0.1, "opponent", 11]] as const) {
  test(`domino completes a local round and displays ${winner} pip points`, async ({ page }) => {
    test.setTimeout(90000);
    await page.addInitScript((value) => { Math.random = () => value; }, seed);
    await page.goto("./#/jogar/domino");
    const game = page.locator('[data-domino-game="true"]');
    await game.getByRole("button", { name: /1 × 1 local/i }).click();
    const dealt = dealDominoRound(5, () => seed);
    const hands = [dealt.player, dealt.opponent];
    let yard = dealt.boneyard, chain: DominoTile[] = [], turn = 0;
    for (let step = 0; step < 100; step++) {
      const reveal = game.locator('[data-domino-handoff] button');
      if (await reveal.isVisible()) await reveal.click();
      let moves = getLegalDominoMoves(hands[turn], chain);
      if (!moves.length) {
        const drawn = drawDominoUntilPlayable(hands[turn], chain, yard);
        if (drawn.drawn) await game.getByRole("button", { name: "comprar pedra", exact: true }).click();
        hands[turn] = drawn.hand; yard = drawn.boneyard;
        moves = getLegalDominoMoves(hands[turn], chain);
      }
      if (moves.length) {
        const move = moves[0], tile = hands[turn][move.index];
        await game.getByRole("button", { name: `Pedra ${tile[0]} por ${tile[1]}`, exact: true }).click();
        const picker = game.locator('[data-domino-side-picker]');
        if (await picker.isVisible()) await picker.getByRole("button", { name: move.side === "left" ? "esquerda" : "direita", exact: true }).click();
        chain = placeDominoTile(chain, tile, move.side);
        hands[turn].splice(move.index, 1);
        if (!hands[turn].length) {
          expect(turn === 0 ? "player" : "opponent").toBe(winner);
          expect(getDominoPipTotal(hands[1 - turn])).toBe(expected);
          await expect(game.locator(`[data-domino-points="${winner}"]`)).toHaveText(`${expected} pontos`);
          await expect(game.locator('[data-domino-status]')).toContainText("venceu");
          return;
        }
      } else await game.getByRole("button", { name: "passar vez", exact: true }).click();
      turn = 1 - turn;
    }
    throw Error("The seeded round did not finish");
  });
}

for (const difficulty of ["1", "2"]) {
  test(`golf barrier can be cleared and holed at difficulty ${difficulty}`, async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("./#/jogar/golfe");
    await page.locator(".casual-options select").first().selectOption(difficulty);
    await page.getByLabel("Formato da sessão", { exact: true }).selectOption("treino");
    await page.getByRole("button", { name: "Iniciar sessão", exact: true }).click();
    async function range(label: string, value: number) {
      const input = page.getByRole("slider", { name: label, exact: true });
      await input.focus();
      await input.press("Home");
      const min = Number(await input.getAttribute("min"));
      for (let i = min; i < value; i++) await input.press("ArrowRight");
    }
    await range("Mira", 50);
    await range("Força", 80);
    await page.getByRole("button", { name: "Dar tacada", exact: true }).click();
    await expect(page.locator(".sport-scene [role=status]")).toContainText("green");
    await range("Força", 42);
    await page.getByRole("button", { name: "Dar tacada", exact: true }).click();
    await expect(page.locator(".sport-scene [role=status]")).toContainText("Bola no buraco");
  });
}
