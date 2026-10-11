import {test,expect} from "@playwright/test";
import {games} from "../src/lib/catalog";
import {modeTags} from "../src/lib/smartDiscovery";

test("Filtro de modos reais, reset e capas continuam íntegros no celular",async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto("./");
  const cards=page.locator(".game-card");
  const mode=page.getByRole("button",{name:"Dupla local",exact:true});
  await mode.click();
  await expect(mode).toHaveAttribute("aria-pressed","true");
  await expect(cards).toHaveCount(5);
  await expect(page.locator(".game-card [data-game-cover]")).toHaveCount(5);
  await expect(page.getByRole("status").filter({hasText:"5 jogos encontrados"})).toBeVisible();
  await page.getByRole("button",{name:"Zerar filtros",exact:true}).click();
  await expect(cards).toHaveCount(games.length);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Filtros rápidos e favoritos persistem sem inventar modos",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./");
  await page.getByRole("button",{name:"Partidas rápidas",exact:true}).click();
  const expected=games.filter(g=>modeTags(g).includes("rapido")).length;
  await expect(page.locator(".game-card")).toHaveCount(expected);
  await page.getByRole("button",{name:"Zerar filtros",exact:true}).click();
  await page.getByRole("button",{name:"Ainda não joguei",exact:true}).click();
  await expect(page.locator(".game-card")).toHaveCount(games.length);
  await page.getByRole("button",{name:"Zerar filtros",exact:true}).click();
  await page.getByRole("combobox",{name:"Ordenar jogos"}).selectOption("recomendados");
  await expect(page.locator(".game-card")).toHaveCount(games.length);
  const first=page.locator(".game-card").first();
  await expect(first.locator("[data-game-mode]")).toBeVisible();
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
  const chips = page.locator(".smart-mode-chips");
  await expect(chips).toBeVisible();
  await expect.poll(() => chips.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Sobrevivência", exact: true }).focus();
  await expect(page.getByRole("button", { name: "Sobrevivência", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
