import {expect,test} from "@playwright/test";

test("Luzes Out mostra a prévia exata e joga com setas no mobile",async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto("./#/jogar/luzes");
  const cells=page.locator(".lights-board button");
  await expect(cells).toHaveCount(25);
  await expect(page.locator("[data-lights-affected='true']")).toHaveCount(5);
  await cells.nth(12).focus();
  await expect(cells.nth(12)).toBeFocused();
  await cells.nth(12).press("ArrowLeft");
  await expect(cells.nth(11)).toBeFocused();
  await expect(cells.nth(11)).toHaveAttribute("data-lights-selected","true");
  await expect(page.locator("[data-lights-affected='true']")).toHaveCount(5);
  await expect(page.locator("[data-lights-impact]")).toContainText(/acendem.*apagam/);
  await cells.nth(11).press("Enter");
  await expect(page.locator(".scores strong").first()).toHaveText("1");
  await expect(page.locator("[data-lights-last='true']")).toHaveCount(1);
  await page.getByRole("button",{name:"Desfazer toque",exact:true}).click();
  await expect(page.locator(".scores strong").first()).toHaveText("0");
  await expect(page.locator("[data-lights-last='true']")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Luzes Out respeita toque, prévia de canto e mudança de desafio",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./#/jogar/luzes");
  const cells=page.locator(".lights-board button");
  await cells.nth(0).focus();
  await expect(page.locator("[data-lights-affected='true']")).toHaveCount(3);
  await cells.nth(0).click();
  await expect(page.locator(".scores strong").first()).toHaveText("1");
  await page.getByLabel("Desafio").selectOption("1");
  await expect(page.locator(".scores strong").first()).toHaveText("0");
  await expect(page.locator("[data-lights-last='true']")).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Desfazer toque",exact:true})).toBeDisabled();
  await expect(cells).toHaveCount(25);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
