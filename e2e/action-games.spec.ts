import { test, expect } from "@playwright/test";
import { games } from "../src/lib/catalog";
import { parkingLevels, moveParking } from "../src/lib/actionGames";
import type { Direction } from "../src/lib/engines";
test("Racing steers, pauses on blur, resets safely and saves game-over record", async ({
  page,
}) => {
  await page.goto("./#/jogar/corrida");
  await page.clock.install();
  await page.getByRole("button", { name: "Largar", exact: true }).click();
  await page.locator(".race-board").press("ArrowLeft");
  await expect(page.locator(".race-car")).toHaveAttribute("data-lane", "0");
  await page.clock.runFor(210);
  await page.getByRole("button", { name: "Dirigir para direita" }).click();
  await expect(page.locator(".race-car")).toHaveAttribute("data-lane", "1");
  await page.clock.runFor(2000);
  await expect(page.locator(".traffic-car").first()).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(
    page.getByRole("button", { name: "Continuar", exact: true }),
  ).toBeVisible();
  const score = await page.locator(".scores strong").first().textContent();
  await page.clock.runFor(2000);
  await expect(page.locator(".scores strong").first()).toHaveText(score!);
  await page
    .getByRole("button", { name: "Reiniciar jogo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Continuar esta partida", exact: true })
    .click();
  await expect(page.locator(".scores strong").first()).toHaveText(score!);
  await page.getByRole("button", { name: "Nova corrida", exact: true }).click();
  await expect(page.locator(".scores strong").first()).toHaveText("0");
  await page.evaluate(() => {
    Math.random = () => 0.5;
  });
  await page.getByRole("button", { name: "Largar", exact: true }).click();
  await page.clock.runFor(10000);
  await expect(
    page.getByText("Fim da corrida", { exact: false }),
  ).toBeVisible();
  const record = await page.locator(".scores strong").nth(1).textContent();
  expect(Number(record)).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator(".scores strong").nth(1)).toHaveText(record!);
});
test("All parking courses finish using keyboard and touch and retain a record", async ({
  page,
}) => {
  await page.goto("./#/jogar/estacionamento");
  for (let l = 0; l < parkingLevels.length; l++) {
    await page
      .getByLabel("Estacionamento", { exact: true })
      .selectOption(String(l));
    const config = parkingLevels[l];
    const queue = [config.start];
    const parents = new Map<number, { prev: number; d: Direction }>();
    parents.set(config.start, { prev: -1, d: "up" });
    for (let h = 0; h < queue.length && !parents.has(config.goal); h++)
      for (const d of ["up", "down", "left", "right"] as Direction[]) {
        const next = moveParking(queue[h], d, config.walls);
        if (!parents.has(next)) {
          parents.set(next, { prev: queue[h], d });
          queue.push(next);
        }
      }
    const path: Direction[] = [];
    for (let at = config.goal; at !== config.start; ) {
      const n = parents.get(at)!;
      path.push(n.d);
      at = n.prev;
    }
    for (const [i, d] of path.reverse().entries()) {
      if (i % 2 === 0)
        await page.locator(".parking-board").press(
          {
            up: "ArrowUp",
            down: "ArrowDown",
            left: "ArrowLeft",
            right: "ArrowRight",
          }[d],
        );
      else
        await page
          .getByRole("button", {
            name: {
              up: "Mover para cima",
              down: "Mover para baixo",
              left: "Mover para esquerda",
              right: "Mover para direita",
            }[d],
            exact: true,
          })
          .click();
    }
    await expect(page.getByText("Estacionou!", { exact: false })).toBeVisible();
  }
  const record = await page.locator(".scores strong").nth(2).textContent();
  await page.reload();
  await expect(page.locator(".scores strong").nth(2)).toHaveText(record!);
});
test("Lights Out solves, undoes and changes challenges", async ({ page }) => {
  await page.goto("./#/jogar/luzes");
  await page.getByRole("button", { name: "Luz 1:", exact: false }).click();
  await page.getByRole("button", { name: "Desfazer toque" }).click();
  await expect(page.locator(".scores strong").first()).toHaveText("0");
  for (const n of [7, 13, 19])
    await page.getByRole("button", { name: new RegExp(`^Luz ${n}:`) }).click();
  await expect(
    page.getByText("Todas apagadas!", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".scores strong").nth(1)).toHaveText("97");
  await page.reload();
  await expect(page.locator(".scores strong").nth(1)).toHaveText("97");
  await page.getByLabel("Desafio", { exact: true }).selectOption("1");
  await expect(page.locator(".light-on")).not.toHaveCount(0);
});
for (const [id, prefix, duration] of [
  ["tiro", "Alvo", 30],
  ["estrelas", "Estrela", 20],
] as const)
  test(`${id} scores by touch and keyboard, freezes while paused and saves at timeout`, async ({
    page,
  }) => {
    await page.goto(`./#/jogar/${id}`);
    await page.clock.install();
    await page.getByRole("button", { name: "Começar rodada" }).click();
    await page
      .getByRole("button", { name: new RegExp(`^${prefix} [1-9]: presente$`) })
      .first()
      .click();
    const label = await page
      .getByRole("button", { name: new RegExp(`^${prefix} [1-9]: presente$`) })
      .first()
      .getAttribute("aria-label");
    await page.locator(".targets-board").press(label!.match(/[1-9]/)![0]);
    const score = await page.locator(".scores strong").first().textContent();
    expect(Number(score)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Pausar", exact: true }).click();
    const pausedTime = await page.locator(".scores strong").nth(1).textContent();
    await page.clock.runFor(3000);
    await expect(page.locator(".scores strong").nth(1)).toHaveText(
      pausedTime!,
    );
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.clock.runFor(duration * 1000 + 100);
    await expect(
      page.getByText(`Fim da rodada: ${score} pontos.`, { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator(".instructions")).toContainText(
      `Recorde: ${score} pontos`,
    );
  });

test("Target games apply difficulty to round time and active targets", async ({ page }) => {
  await page.goto("./#/jogar/tiro");
  await page.getByLabel("Dificuldade", { exact: true }).selectOption("hard");
  await page.getByRole("button", { name: "Começar rodada", exact: true }).click();
  await expect(page.locator(".scores strong").nth(1)).toHaveText("25s");
  await expect(page.locator(".target-present")).toHaveCount(2);

  await page.goto("./#/jogar/estrelas");
  await page.getByLabel("Dificuldade", { exact: true }).selectOption("hard");
  await page.getByRole("button", { name: "Começar rodada", exact: true }).click();
  await expect(page.locator(".scores strong").nth(1)).toHaveText("15s");
  await expect(page.locator(".target-present")).toHaveCount(1);
});

test("All games offer keyboard focus, specific help, focus mode and safe restart", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const { id, name } of games) {
    await page.goto(`./#/jogar/${id}`);
    await expect(page.locator(".player > h1")).toHaveText(name);
    const arena = page.locator("[data-arcade-arena]").first();
    await expect(arena).toBeVisible();
    const motion = await arena.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        animationDuration: style.animationDuration,
      };
    });
    expect(motion.animationName).toContain("arcade-board-enter");
    expect(motion.animationDuration).not.toBe("0s");
    await page.getByText("Ajuda rápida e controles", { exact: true }).click();
    await expect(
      page.locator(".experience-tools details[open] p").first(),
    ).not.toBeEmpty();
    await page
      .getByRole("button", { name: "Ir para o tabuleiro", exact: true })
      .click();
    expect(
      await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        const arena = active?.closest("[data-arcade-arena]");
        return Boolean(arena || active?.matches("[data-arcade-arena]"));
      }),
    ).toBe(true);
    await page.getByRole("button", { name: "Modo foco", exact: true }).click();
    await expect(page.locator(".site-header")).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Sair do modo foco", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Reiniciar jogo", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: `Reiniciar ${name}?` }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog")).not.toBeVisible();
    await page
      .getByRole("button", { name: "Reiniciar jogo", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirmar reinício", exact: true })
      .click();
    await expect(
      page.getByText("Jogo reiniciado. Você pode começar outra partida.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator("[data-arcade-arena]").first()).toBeVisible();
  }
});

test("Memory observation speed changes the mismatch delay and Puzzle shows a reference", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("./#/jogar/memoria");
  await page.clock.install();
  await page
    .getByLabel("Tempo para observar cartas diferentes")
    .selectOption("1500");
  const cards = page.locator(".memory-card");
  await cards.nth(0).click();
  await cards.nth(1).click();
  await page.clock.runFor(1000);
  await expect(page.locator(".memory-card.revealed")).toHaveCount(2);
  await page.clock.runFor(600);
  await expect(page.locator(".memory-card.revealed")).toHaveCount(0);
  await page.goto("./#/jogar/puzzle");
  await page
    .getByRole("button", { name: "Mostrar modelo", exact: true })
    .click();
  await expect(page.locator(".puzzle-goal span")).toHaveCount(9);
  await page
    .getByRole("button", { name: "Ocultar modelo", exact: true })
    .click();
  await expect(page.locator(".puzzle-goal")).toHaveCount(0);
});
test("Damas uses one tab stop and arrow navigation without wrapping", async ({
  page,
}) => {
  await page.goto("./#/jogar/damas");
  const cells = page.locator('[data-checkers-board] [role="gridcell"]');
  await expect(cells).toHaveCount(64);
  await page
    .getByRole("button", { name: "Ir para o tabuleiro", exact: true })
    .click();
  await expect(cells.nth(40)).toBeFocused();
  await cells.nth(40).press("ArrowRight");
  await expect(cells.nth(41)).toBeFocused();
  await expect(
    page.locator('[data-checkers-board] [tabindex="0"]'),
  ).toHaveCount(1);
  await cells.nth(41).press("Home");
  await expect(cells.nth(40)).toBeFocused();
  await cells.nth(40).press("ArrowLeft");
  await expect(cells.nth(40)).toBeFocused();
});
