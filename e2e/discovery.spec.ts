import { test, expect } from "@playwright/test";

test("catalog covers and objectives remain usable without optional preview requests", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  // Covers are inline SVGs: failed preview chunks or illustrations cannot blank the catalog.
  await page.route(/\/(?:assets\/GamePreview-[^/]+\.js|previews\/[^/]+\.svg)(?:\?.*)?$/, route => route.abort());
  await page.goto("./");
  await expect(page.locator(".game-card")).toHaveCount(100);
  await expect(page.locator(".game-card [data-game-cover] svg")).toHaveCount(100);
  await expect(page.locator('.game-card [data-game-cover="flood"]')).toBeVisible();
  await page.getByLabel("Buscar jogo").fill("hanoi");
  await expect(page.locator('.game-card [data-game-cover="hanoi"] svg')).toBeVisible();
  await expect(page.locator(".game-card p")).toContainText("Transfira os discos");
  expect(pageErrors).toEqual([]);
});
test("all catalog previews have visible contents across responsive widths", async ({ page }) => {
  for (const width of [320,360,390,430,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto("./");
    await expect(page.locator(".game-card")).toHaveCount(100);
    await expect.poll(() => page.locator(".game-card .preview").evaluateAll(previews => previews.filter(p => {
      const rect=p.getBoundingClientRect();
      const svg=p.querySelector("svg");
      const svgRect=svg?.getBoundingClientRect();
      return rect.width<20 || rect.height<20 || (svgRect && (svgRect.width<20 || svgRect.height<20)) || !p.children.length;
    }).length), { message: `visible previews at ${width}px` }).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
test("combined filters and catalog position survive a game and reload", async ({page}) => {
  await page.goto("./");
  await page.getByLabel("Buscar jogo").fill("   CORES    maré  ");
  await page.getByLabel("Filtrar por modo").selectOption("Solo");
  await page.getByLabel("Ordenar jogos").selectOption("nome");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page.getByRole("link",{name:"Jogar Maré de Cores",exact:true}).evaluate(link =>
    link.scrollIntoView({ block: "center", behavior: "instant" }));
  const scroll=await page.evaluate(() => scrollY);
  await page.getByRole("link",{name:"Jogar Maré de Cores",exact:true}).click();
  await expect(page.locator("[data-arcade-arena] .new-grid")).toBeVisible();
  await expect(page.getByText("última jogada e a resposta do adversário.", {exact:false})).toHaveCount(0);
  await page.reload();
  await page.getByRole("link",{name:"Voltar aos jogos",exact:true}).click();
  await expect(page.getByLabel("Buscar jogo")).toHaveValue("   CORES    maré  ");
  await expect(page.getByLabel("Filtrar por modo")).toHaveValue("Solo");
  await expect(page.getByLabel("Ordenar jogos")).toHaveValue("nome");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(scroll, -1);
  await expect(page.getByRole("link",{name:"Jogar Maré de Cores",exact:true})).toBeFocused();
});
test("secondary utilities remain keyboard accessible and solo help stays correct", async ({page}) => {
  await page.goto("./#/jogar/peg");
  await expect(page.locator("[data-arcade-arena] .new-grid")).toBeVisible();
  await expect(page.getByRole("button",{name:"Reiniciar",exact:true})).toHaveCount(1);
  await expect(page.getByRole("button",{name:"Copiar link do jogo"})).toBeHidden();
  await page.locator(".player-utilities summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button",{name:"Copiar link do jogo"})).toBeVisible();
  await expect(page.getByText("última jogada e a resposta do adversário.", {exact:false})).toHaveCount(0);
  await page.getByRole("link",{name:"Ajustar conforto",exact:true}).click();
  await expect(page.getByLabel("Movimento da interface")).toBeVisible();
});
test.describe("touch recovery", () => {
  test.use({hasTouch:true});
  test("mobile restart has a confirmed touch path and preserves local progress", async ({page}) => {
    await page.setViewportSize({width:320,height:740});
    await page.addInitScript(() => localStorage.setItem("pg-arcade-progress-v1",JSON.stringify({favorites:["peg"],records:{peg:100},visits:{}})));
    await page.goto("./#/jogar/peg");
    await page.locator('[data-index="3"]').tap();
    await page.locator('[data-index="13"]').tap();
    await expect(page.locator(".new-hud strong").first()).toHaveText("1");
    await page.locator(".player-utilities summary").tap();
    const restart=page.getByRole("button",{name:"Reiniciar com confirmação",exact:true});
    await restart.tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button",{name:"Continuar esta partida",exact:true}).tap();
    await expect(page.locator(".new-hud strong").first()).toHaveText("1");
    await expect(restart).toBeFocused();
    await restart.tap();
    await page.getByRole("button",{name:"Confirmar reinício",exact:true}).tap();
    await expect(page.locator(".new-hud strong").first()).toHaveText("0");
    const saved=await page.evaluate(() => JSON.parse(localStorage.getItem("pg-arcade-progress-v1")!));
    expect(saved.records.peg).toBe(100);
    expect(saved.favorites).toContain("peg");
  });
});

