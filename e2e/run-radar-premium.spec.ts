import { expect, test } from "@playwright/test";
for(const game of ["rally","coleta","orbital"] as const) {
  test(`${game}: radar por faixa, barra de tempo e direção no celular`,async({page})=>{
    await page.addInitScript(()=>{Math.random=()=>0;});
    await page.clock.install();
    await page.setViewportSize({width:320,height:740});
    await page.goto(`./#/jogar/${game}`);
    const board=page.locator(".run-board");
    await expect(board).toBeVisible();
    await expect(page.locator("[data-run-radar-lane]")).toHaveCount(3);
    await expect(page.getByRole("progressbar",{name:"Progresso da expedição"})).toHaveAttribute("aria-valuenow","0");
    await expect(page.locator("[data-run-lives]")).toHaveText("3");
    await page.getByRole("button",{name:"Começar",exact:true}).click();
    await page.clock.runFor(4100);
    await expect(page.locator('[data-run-radar-lane="0"]')).toHaveAttribute("data-state","danger");
    await expect(page.getByRole("progressbar",{name:"Progresso da expedição"})).not.toHaveAttribute("aria-valuenow","0");
    await board.press("ArrowRight");
    await expect(board.locator(".race-car")).toHaveAttribute("data-lane","2");
    await page.getByRole("button",{name:"Pausar",exact:true}).click();
    await expect(page.locator(".race-lives")).toContainText("pausada");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
test("Modo sobrevivência não exibe barra de tempo finita",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./#/jogar/coleta");
  await page.getByLabel("Modo da expedição").selectOption("Infinity");
  await expect(page.getByRole("progressbar",{name:"Progresso da expedição"})).toHaveCount(0);
  await expect(page.locator("[data-run-radar-lane]")).toHaveCount(3);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
