import { expect, test } from "@playwright/test";
import {games} from '../src/lib/catalog';
for(const width of [320,390]) {
 test(`catalog preserves ${games.length} covers and keyboard activation at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('./');
  await page.waitForFunction(count=>document.querySelectorAll('.game-grid [data-catalog-game]').length===count,games.length);
  // Focus and inspect in one browser turn; Locator.evaluate first resolves a
  // handle, adding a second full SVG snapshot in Firefox tracing.
  const metrics=await page.evaluate(()=>{
   const card=[...document.querySelectorAll('.game-grid [data-catalog-game]')].at(-1)!;
   const link=card.querySelector<HTMLAnchorElement>('a.game-link')!;
   link.focus();
   const bounds=card.querySelector('.game-cover')!.getBoundingClientRect();
   return {id:card.getAttribute('data-catalog-game'),focused:document.activeElement===link,width:bounds.width,height:bounds.height,count:document.querySelectorAll('.game-grid [data-catalog-game]').length,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  expect(metrics.count).toBe(games.length);expect(metrics.focused).toBe(true);
  expect(metrics.width).toBeGreaterThan(1);expect(metrics.height).toBeGreaterThan(1);expect(metrics.overflow).toBe(false);
  expect(metrics.id).toBeTruthy();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp('#/jogar/'+metrics.id+'$'));
  await expect(page.locator(`[data-arcade-arena][data-game-id="${metrics.id}"]`)).toBeVisible();
  await page.goto('./');
  await page.waitForFunction(count=>document.querySelectorAll('.game-grid [data-catalog-game]').length===count && document.documentElement.scrollWidth<=innerWidth+1,games.length);
 });
}
