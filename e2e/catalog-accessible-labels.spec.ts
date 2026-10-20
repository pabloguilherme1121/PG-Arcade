import { expect, test } from "@playwright/test";
import axe from 'axe-core';
import {games} from '../src/lib/catalog';

test(`all ${games.length} catalog links use their visible label in their accessible name`,async({page})=>{
 await page.setViewportSize({width:320,height:844});
 // The pinned axe engine and the same rule run in the real page. Inject before
 // rendering: repeated builder/protocol snapshots of 102 SVG cards cost several
 // seconds each in Firefox, independently of the rule's actual execution time.
 await page.addInitScript(axe.source);
 await page.goto('./');
 await page.waitForFunction(count=>document.querySelectorAll('.game-grid a.game-link').length===count,games.length);
 await expect(page.locator('.game-grid a.game-link').first()).toHaveAccessibleName(/^Jogar .+/);
 const result=await page.evaluate(async()=>{
  const grid=document.querySelector('.game-grid')!;
  const audit=await (window as unknown as {axe:typeof axe}).axe.run(grid,{runOnly:{type:'rule',values:['label-content-name-mismatch']}});
  return {overrides:grid.querySelectorAll('a.game-link[aria-label]').length,violations:audit.violations};
 });
 expect(result.overrides).toBe(0);
 expect(result.violations).toEqual([]);
});
