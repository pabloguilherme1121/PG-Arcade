import {test,expect} from "@playwright/test";

for(const width of [320,390,1200]){
 test("Capas: pintura isolada preserva links e dimensões em "+width+"px",async({page})=>{
   await page.setViewportSize({width,height:820});
   await page.goto("./");
   const cards=page.locator(".game-grid .game-card");
   expect(await cards.count()).toBeGreaterThan(80);
   const cover=cards.nth(4).locator(".game-cover");
   const result=await cover.evaluate((el)=>{
     const style=getComputedStyle(el),rect=el.getBoundingClientRect();
     return {contain:style.contain,width:rect.width,height:rect.height};
   });
   expect(result.contain).toContain("layout");
   expect(result.contain).toContain("paint");
   expect(result.width).toBeGreaterThan(100);
   expect(result.height).toBeGreaterThan(20);
   const last=cards.last();
   await last.scrollIntoViewIfNeeded();
   const favorite=last.getByRole("button",{name:/favoritos/i});
   await favorite.click();
   await expect(favorite).toHaveAttribute("aria-pressed","true");
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
