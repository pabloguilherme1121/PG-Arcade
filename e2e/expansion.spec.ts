import { test, expect } from "@playwright/test";
import { games } from "../src/lib/catalog";
test("Liga 4 wins, locks columns, undoes and resets", async ({ page }) => {
  await page.goto("./#/jogar/liga4");
  for (const n of [1, 2, 1, 2, 1, 2, 1])
    await page
      .getByRole("button", { name: `Jogar na coluna ${n}`, exact: true })
      .click();
  await expect(
    page.getByText("Jogador 1 venceu!", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Jogar na coluna 3" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Desfazer jogada" }).click();
  await expect(
    page.getByText("Vez do jogador 1 — coral", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nova partida" }).click();
  await expect(
    page.getByRole("group", { name: /Tabuleiro Liga 4.*Tabuleiro vazio/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Jogar na coluna 1" }).press("Enter");
  await expect(
    page.getByText("Vez do jogador 2 — lima", { exact: true }),
  ).toBeVisible();
});
test("Sliding puzzle moves with touch and keyboard and resets", async ({
  page,
}) => {
  await page.goto("./#/jogar/puzzle");
  const board = page.locator(".sliding-board");
  await expect(board.getByRole("button")).toHaveCount(8);
  await board
    .getByRole("button")
    .filter({ visible: true })
    .evaluateAll((nodes) => nodes.length);
  const enabled = board.locator("button:not(:disabled)").first();
  await enabled.click();
  await expect(page.locator(".scores strong").first()).toHaveText("1");
  const empty = await board
    .locator("span")
    .evaluate((el) => Array.from(el.parentElement!.children).indexOf(el));
  await board.press(empty >= 3 ? "ArrowDown" : "ArrowUp");
  await expect(page.locator(".scores strong").first()).toHaveText("2");
  await page.getByRole("button", { name: "Embaralhar novamente" }).click();
  await expect(page.locator(".scores strong").first()).toHaveText("0");
});
test("Catalog sorts, clears filters and selects surprise within results", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByLabel("Ordenar jogos").selectOption("nome");
  const names = await page.locator(".game-card h3").allTextContents();
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pt-BR")));
  await page.getByLabel("Buscar jogo").fill("inexistente");
  await expect(
    page.getByRole("button", { name: "Jogo surpresa" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Limpar filtros e ver todos" })
    .click();
  await expect(page.locator(".game-card")).toHaveCount(games.length);
  await page.getByLabel("Buscar jogo").fill("Liga 4");
  await page.getByRole("button", { name: "Jogo surpresa" }).click();
  await expect(page).toHaveURL(/#\/jogar\/liga4$/);
});

test("Solved sliding puzzle saves a best record across reload", async ({
  page,
}) => {
  await page.goto("./#/jogar/puzzle");
  await expect(page.locator(".sliding-board button")).toHaveCount(8);
  const start = await page.locator(".sliding-board").evaluate((el) =>
    Array.from(el.children)
      .map((n) => (n.tagName === "BUTTON" ? n.textContent!.trim() : "0"))
      .join(""),
  );
  const goal = "123456780";
  const queue = [start];
  const parents = new Map<string, { prev: string; tile: string }>();
  parents.set(start, { prev: "", tile: "" });
  for (let head = 0; head < queue.length && !parents.has(goal); head++) {
    const key = queue[head],
      empty = key.indexOf("0");
    for (const i of [empty - 3, empty + 3, empty - 1, empty + 1]) {
      if (
        i < 0 ||
        i >= 9 ||
        Math.abs(Math.floor(i / 3) - Math.floor(empty / 3)) +
          Math.abs((i % 3) - (empty % 3)) !==
          1
      )
        continue;
      const chars = key.split("");
      [chars[i], chars[empty]] = [chars[empty], chars[i]];
      const next = chars.join("");
      if (!parents.has(next)) {
        parents.set(next, { prev: key, tile: key[i] });
        queue.push(next);
      }
    }
  }
  const path: string[] = [];
  for (let key = goal; key !== start; ) {
    const entry = parents.get(key)!;
    path.push(entry.tile);
    key = entry.prev;
  }
  for (const tile of path.reverse())
    await page
      .getByRole("button", { name: `Peça ${tile}`, exact: true })
      .click();
  await expect(
    page.getByText("Você organizou todas as peças!", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".scores strong").nth(1)).toHaveText(
    String(path.length),
  );
  await page.reload();
  await expect(page.locator(".scores strong").nth(1)).toHaveText(
    String(path.length),
  );
  await page.getByRole("link", { name: "Meu progresso", exact: true }).click();
  await expect(page.locator(".record-list").first()).toContainText(
    `${path.length} jogadas`,
  );
});
