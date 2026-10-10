import { expect, test } from "@playwright/test";

test("Campo Minado move o foco com setas, marca com F e mantém primeiro toque seguro", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.setViewportSize({width:320,height:740});
  await page.goto("./#/jogar/minas");
  const cells=page.locator(".mines-board button");
  await expect(cells).toHaveCount(64);
  await expect(page.locator("[data-mines-safe]")).toHaveText("0/54");
  await expect(page.locator("[data-mines-remaining]")).toHaveText("10");
  await cells.nth(0).focus();
  await cells.nth(0).press("ArrowRight");
  await expect(cells.nth(1)).toBeFocused();
  await cells.nth(1).press("f");
  await expect(cells.nth(1)).toHaveAttribute("aria-label","Casa 2: marcada");
  await expect(page.locator("[data-mines-remaining]")).toHaveText("9");
  await cells.nth(1).press("F");
  await expect(cells.nth(1)).toHaveAttribute("aria-label","Casa 2: fechada");
  await cells.nth(1).press("ArrowLeft");
  await expect(cells.nth(0)).toBeFocused();
  await cells.nth(0).press("Enter");
  await expect(cells.nth(0)).toHaveClass(/mine-open/);
  await expect(page.locator("[data-mines-safe]")).not.toHaveText("0/54");
  await expect(page.getByRole("progressbar",{name:"Casas seguras reveladas"})).not.toHaveAttribute("aria-valuenow","0");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("Campo Minado mantém toque, modo bandeira e reset do progresso", async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./#/jogar/minas");
  const cells=page.locator(".mines-board button");
  const flag=page.getByRole("button",{name:"Modo revelar",exact:true});
  await flag.click();
  await expect(page.getByRole("button",{name:"Modo bandeira",exact:true})).toHaveAttribute("aria-pressed","true");
  await cells.nth(5).click();
  await expect(cells.nth(5)).toHaveAttribute("aria-label","Casa 6: marcada");
  await page.getByRole("button",{name:"Novo campo",exact:true}).click();
  await expect(page.locator("[data-mines-remaining]")).toHaveText("10");
  await expect(page.locator("[data-mines-safe]")).toHaveText("0/54");
  await page.getByLabel("Dificuldade do Campo Minado").selectOption("6");
  await expect(page.locator("[data-mines-safe]")).toHaveText("0/58");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
