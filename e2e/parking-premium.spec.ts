import { expect, test } from "@playwright/test";

test("Estacionamento mostra saídas e dica opcional, desfaz manobra com estado completo",async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto("./#/jogar/estacionamento");
  const board=page.locator(".parking-board");
  await expect(board).toBeVisible();
  const undo=page.getByRole("button",{name:"Desfazer manobra",exact:true});
  await expect(undo).toBeDisabled();
  await expect(page.locator("[data-parking-exits]")).toHaveText("2");
  const before=await page.locator("[data-parking-distance]").textContent();
  await page.getByRole("button",{name:"Mostrar dica de caminho",exact:true}).click();
  await expect(page.locator("[data-parking-hint='true']")).toHaveCount(1);
  await expect(page.locator("[data-parking-available='true']")).toHaveCount(2);
  await page.getByRole("button",{name:"Mover para cima",exact:true}).click();
  await expect(undo).toBeEnabled();
  await expect(page.locator(".scores strong").first()).toHaveText("1");
  await expect(page.locator("[data-parking-car='true']")).toHaveAttribute("data-cell","24");
  await undo.click();
  await expect(page.locator("[data-parking-car='true']")).toHaveAttribute("data-cell","30");
  await expect(page.locator(".scores strong").first()).toHaveText("0");
  await expect(page.locator("[data-parking-distance]")).toHaveText(before || "");
  await expect(undo).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Estacionamento mantém teclado, toque, 3 fases e reinício responsivo",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./#/jogar/estacionamento");
  const board=page.locator(".parking-board");
  await board.focus();
  await board.press("ArrowUp");
  await expect(page.locator("[data-parking-car='true']")).toHaveAttribute("data-cell","24");
  await page.getByRole("button",{name:"Tentar novamente",exact:true}).click();
  await expect(page.locator("[data-parking-car='true']")).toHaveAttribute("data-cell","30");
  await expect(page.getByRole("button",{name:"Desfazer manobra",exact:true})).toBeDisabled();
  await page.getByLabel("Estacionamento",{exact:true}).selectOption("2");
  await expect(page.locator("[data-parking-stage]")).toHaveText("3 de 3");
  await expect(page.locator(".scores strong").first()).toHaveText("0");
  await expect(page.locator("[data-parking-hint='true']")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
