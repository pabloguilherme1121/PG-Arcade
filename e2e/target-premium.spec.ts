import { expect, test } from "@playwright/test";

for (const game of ["tiro", "estrelas"] as const) {
  test(`${game}: precisão, setas, temporizador e foco responsivo`, async ({page}) => {
    await page.addInitScript(() => { Math.random = () => 0; });
    await page.setViewportSize({width:320,height:740});
    await page.goto(`./#/jogar/${game}`);
    const board=page.locator(".targets-board");
    await expect(board).toBeVisible();
    await expect(page.getByRole("progressbar", {name:"Tempo restante da rodada"})).toHaveAttribute("aria-valuenow",game==="tiro"?"30":"20");
    await page.getByRole("button",{name:"Começar rodada",exact:true}).click();
    await expect(page.locator("[data-target-accuracy]")).toHaveText("0%");
    await board.focus();
    await board.press("ArrowRight");
    await expect(board).toHaveAttribute("data-target-selected","6");
    await expect(board.locator("button").nth(5)).toBeFocused();
    await board.press("1");
    await expect(page.locator("[data-target-accuracy]")).toHaveText("100%");
    await expect(page.locator("[data-target-combo]")).toHaveText("1");
    await board.press("9");
    await expect(page.locator("[data-target-accuracy]")).toHaveText("50%");
    await expect(page.locator("[data-target-combo]")).toHaveText("0");
    await page.getByRole("button",{name:"Nova rodada",exact:true}).click();
    await expect(page.locator("[data-target-accuracy]")).toHaveText("0%");
    await expect(page.locator("[data-target-combo]")).toHaveText("0");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
