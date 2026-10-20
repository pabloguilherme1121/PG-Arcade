import {test,expect} from "@playwright/test";
import {games} from "../src/lib/catalog";
import {modeTags} from "../src/lib/smartDiscovery";

test("Filtro de modos reais, reset e capas continuam íntegros no celular",async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto("./");
  const cards=page.locator(".game-card");
  const mode=page.getByRole("combobox",{name:"Filtrar por modo",exact:true});
  await mode.selectOption("Dupla local");
  await expect(mode).toHaveValue("Dupla local");
  await expect(cards).toHaveCount(9);
  const ids=await cards.evaluateAll(elements=>elements.map(el=>el.getAttribute("data-catalog-game")).sort());
  expect(ids).toEqual(["cofre","comum","damas","domino","leilao","liga4","passagem","velha","xadrez"]);
  await expect(page.locator(".game-card [data-game-cover]")).toHaveCount(9);
  await expect(page.getByRole("status").filter({hasText:"9 jogos encontrados"})).toBeVisible();
  await page.getByRole("button",{name:"Zerar filtros",exact:true}).click();
  await expect(cards).toHaveCount(games.length);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Filtros rápidos e favoritos persistem sem inventar modos",async({page,browserName})=>{
  // Full catalog reorders are slower in Firefox under heavy parallel browser CI.
  if (browserName === "firefox") test.slow();
  await page.setViewportSize({width:390,height:844});
  await page.goto("./");
  await page.getByRole("button",{name:"Partidas rápidas",exact:true}).click();
  const expected=games.filter(g=>modeTags(g).includes("rapido")).length;
  await expect(page.locator(".game-card")).toHaveCount(expected);
  const quick = page.getByRole("button", { name: "Partidas rápidas", exact: true });
  await expect(quick).toHaveAttribute("aria-pressed", "true");
  await expect(quick).toHaveAttribute("aria-description", new RegExp(`${expected} jogos`));
  await quick.click();
  await expect(quick).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".game-card")).toHaveCount(games.length);
  await page.getByRole("button",{name:"Ainda não joguei",exact:true}).click();
  await expect(page.locator(".game-card")).toHaveCount(games.length);
  await page.getByRole("button",{name:"Zerar filtros",exact:true}).click();
  await page.getByRole("combobox",{name:"Ordenar jogos"}).selectOption("recomendados");
  await expect(page.locator(".game-card")).toHaveCount(games.length);
  // Check the rendered catalog, not an incidental first-card position.
  await expect(page.locator(".game-card [data-game-mode]").first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Destaques dos modos da arena mantêm ajuda e controls visíveis",async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto("./#/jogar/xadrez");
  const display=page.locator("[data-player-modes]");
  await expect(display).toContainText("Dupla local");
  await expect(display).toContainText("Contra o bot");
  await expect(page.getByRole("button",{name:"Ir para o tabuleiro"})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("chips percorrem a tela pequena sem overflow da página", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./");
  // One in-browser observation avoids the repeated full 103-cover snapshots
  // produced by Firefox protocol calls while retaining every layout/focus check.
  const observation = await page.waitForFunction(() => {
    const row = document.querySelector<HTMLElement>(".smart-mode-chips");
    if (!row) return false;
    const style = getComputedStyle(row);
    if (!row.getClientRects().length || style.visibility === "hidden" || style.display === "none")
      return false;
    if (row.scrollWidth <= row.clientWidth) return false;
    const chip = [...row.querySelectorAll<HTMLButtonElement>("button")]
      .find(button => button.textContent?.trim().startsWith("Sobrevivência"));
    if (!chip) return false;
    chip.focus();
    return {
      visible: true,
      scrollable: row.scrollWidth > row.clientWidth,
      focused: document.activeElement === chip,
      noPageOverflow: document.documentElement.scrollWidth <= innerWidth,
    };
  }, undefined, { timeout: 5_000 });
  const facts = await observation.jsonValue();
  await observation.dispose();
  expect(facts).toEqual({
    visible: true,
    scrollable: true,
    focused: true,
    noPageOverflow: true,
  });
});

test("faixa de modos não ocupa a área do canvas imersivo", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(Error("viewport"));
  });
  await page.goto("./#/jogar/breakout");
  await expect(page.locator("[data-player-modes]")).toBeVisible();
  if (await page.locator(".player-utilities:not([open]) summary").count()) {
    await page.locator(".player-utilities summary").click();
  }
  await page.getByRole("button", { name: "Tela cheia", exact: true }).click();
  await expect(page.locator(".player")).toHaveAttribute("data-immersive", "true");
  await expect(page.locator("[data-player-modes]")).toBeHidden();
  await expect.poll(() => page.locator("canvas").evaluate(
    element => element.getBoundingClientRect().bottom - innerHeight
  )).toBeLessThanOrEqual(1);
});

test("modo inteligente e ordem personalizada sobrevivem ao reload da partida", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("combobox", { name: "Filtrar por modo", exact: true }).selectOption("Dupla local");
  await page.getByRole("combobox", { name: "Ordenar jogos" }).selectOption("recomendados");
  await expect(page.locator(".game-card")).toHaveCount(9);
  await page.getByRole("link", { name: /^Jogar Xadrez/ }).click();
  await page.reload();
  await page.getByRole("link", { name: "Voltar aos jogos", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Filtrar por modo", exact: true })).toHaveValue("Dupla local");
  await expect(page.getByRole("combobox", { name: "Ordenar jogos" })).toHaveValue("recomendados");
  await expect(page.locator(".game-card")).toHaveCount(9);
});

for (const width of [320, 390]) {
  test(`busca rápida e limpeza preservam foco a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const search = page.getByRole("textbox", { name: "Buscar jogo", exact: true });
    await search.fill("xad");
    await search.fill("xadrez");
    await expect(page.locator(".game-card")).toHaveCount(1);
    await expect(page.locator(".game-grid")).toHaveAttribute("aria-busy", "false");
    await expect(page.getByRole("link", { name: /^Jogar Xadrez/ })).toBeVisible();
    await page.getByRole("button", { name: "Limpar busca", exact: true }).click();
    // Poll inside the browser: repeated protocol assertions snapshot all 102
    // SVG cards and can spend the entire deadline in Firefox instrumentation.
    await page.waitForFunction(expectedCards => {
      const input = document.querySelector<HTMLInputElement>('input[aria-label="Buscar jogo"]');
      return !!input && document.activeElement === input && input.value === ""
        && document.querySelectorAll(".game-grid .game-card").length === expectedCards
        && document.documentElement.scrollWidth <= innerWidth;
    }, games.length, { timeout: 5_000 });
  });

  // Search/reset and category toggling are independent user journeys. Keeping
  // separate contexts also avoids carrying scroll and deferred-search state
  // into the category contract while retaining traces and the default timeout.
  test(`categoria reversível mantém o catálogo a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    const category = page.getByRole("group", { name: "Categorias", exact: true }).getByRole("button", { name: "Estratégia", exact: true });
    await category.click();
    await expect(category).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".game-card")).toHaveCount(games.filter(g => g.category === "Estratégia").length);
    await category.click();
    await page.waitForFunction(expectedCards => {
      const button = [...document.querySelectorAll(".filters button")]
        .find(element => element.textContent?.trim().startsWith("Estratégia"));
      return button?.getAttribute("aria-pressed") === "false"
        && document.querySelectorAll(".game-grid .game-card").length === expectedCards
        && document.documentElement.scrollWidth <= innerWidth;
    }, games.length, { timeout: 5_000 });
  });
}
