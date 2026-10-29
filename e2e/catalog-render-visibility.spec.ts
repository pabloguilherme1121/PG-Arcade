import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for (const width of [320,390]) {
 test('catálogo preserva touch, foco e renderização sob demanda em '+width+'px',async({page})=>{
   await page.setViewportSize({width,height:780});
   await page.goto('./');
   const cards=page.locator('.game-grid .game-card');
   expect(await cards.count()).toBeGreaterThan(80);
   const supports=await page.evaluate(()=>CSS.supports('content-visibility','auto'));
   if(supports) {
     await expect.poll(()=>cards.first().evaluate(el=>getComputedStyle(el).contentVisibility)).toBe('visible');
     await expect.poll(()=>cards.nth(4).evaluate(el=>getComputedStyle(el).contentVisibility)).toBe('auto');
   }
   const target=cards.last();
   await target.scrollIntoViewIfNeeded();
   const favorite=target.locator('button.favorite');
   await favorite.tap();
   await expect(favorite).toHaveAttribute('aria-pressed','true');
   await favorite.focus();
   await expect(favorite).toBeFocused();
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}