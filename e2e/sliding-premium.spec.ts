import { test, expect } from "@playwright/test";

test("Quebra-cabeça premium desfaz jogadas sem criar pontuação e mostra a distância", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.setViewportSize({width:320,height:740});
  await page.goto("./#/jogar/puzzle");
  const board=page.locator(".sliding-board");
  await expect(board).toBeVisible();
  const undo=page.getByRole("button",{name:"Desfazer jogada",exact:true});
  await expect(undo).toBeDisabled();
  const distance=page.locator("[data-puzzle-distance]");
  const before=await distance.textContent();
  const legal=board.locator("button:not([disabled])").first();
  await legal.click();
  await expect(page.locator("[data-puzzle-last]")).toBeVisible();
  await expect(page.locator(".scores")).toContainText("1");
  await expect(undo).toBeEnabled();
  await expect(distance).not.toHaveText(before || "");
  await undo.click();
  await expect(distance).toHaveText(before || "");
  await expect(undo).toBeDisabled();
  await expect(page.locator("[data-puzzle-last]")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Quebra-cabeça mantém a opção de embaralhamento e setas no móvel",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./#/jogar/puzzle");
  const board=page.locator(".sliding-board");
  await page.getByLabel("Dificuldade do Quebra-cabeça").selectOption("12");
  await expect(page.locator("[data-puzzle-placed]")).toBeVisible();
  await board.focus();
  const moves=page.locator(".scores strong").first();
  await board.press("ArrowLeft");
  // Some boundary arrows cannot move the tile; remaining inputs must still be usable.
  await page.getByRole("button",{name:"Embaralhar novamente",exact:true}).click();
  await expect(moves).toHaveText("0");
  await expect(page.getByRole("button",{name:"Desfazer jogada",exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
