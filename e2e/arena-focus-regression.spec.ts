import {test,expect} from "@playwright/test";
for(const id of ["passagem","cofre"] as const){
 test(`${id}: botão e atalho de foco levam à arena mesmo com gridcell não interativo`,async({page})=>{
   await page.setViewportSize({width:320,height:740});
   await page.goto(`./#/jogar/${id}`);
   await expect(page.locator("[data-arcade-arena]")).toBeVisible();
   await page.getByRole("button",{name:"Ir para o tabuleiro",exact:true}).click();
   expect(await page.evaluate(()=>Boolean(document.activeElement?.closest("[data-arcade-arena]")))).toBe(true);
   await page.getByRole("button",{name:"Ir para o tabuleiro",exact:true}).focus();
   await page.keyboard.press("Alt+Shift+b");
   await expect.poll(()=>page.evaluate(()=>Boolean(document.activeElement?.closest("[data-arcade-arena]")))).toBe(true);
 });
}