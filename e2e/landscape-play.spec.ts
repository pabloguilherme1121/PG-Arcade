import { expect, test } from '@playwright/test';

for (const size of [{width:844,height:390},{width:568,height:320}]) {
  test(`landscape keeps running arenas and controls visible at ${size.width}px`, async ({page}) => {
    test.setTimeout(120_000);
    await page.setViewportSize(size);
    await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('fallback'));});
    await page.clock.install();
    for(const id of ['snake','asteroides','runner','turret','crossroad','rhythm']) {
      await page.clock.resume();
      await page.goto(`./#/jogar/${id}`);
      await expect(page.locator('[data-arcade-arena]').first()).toBeVisible();
      if (await page.locator(".player-utilities:not([open]) summary").count()) {
    await page.locator(".player-utilities summary").click();
  }
      await page.getByRole('button',{name:'Tela cheia',exact:true}).click();
      await page.clock.pauseAt(await page.evaluate(()=>Date.now()+10_000));
      await page.getByRole('button',{name:id==='snake'?'Jogar':'Começar',exact:true}).click();
      // Keep an idle round alive while WebKit waits for layout stability.
      await page.clock.runFor(100);
      await expect.poll(()=>page.evaluate(()=>{
        const selectors=['canvas,.snake-board','.dpad,.action-controls,.motion-controls'];
        const toolbar=document.querySelector('.player-toolbar')!.getBoundingClientRect();
        return selectors.every(selector=>{
          const rect=document.querySelector(selector)!.getBoundingClientRect();
          return rect.top>=toolbar.bottom-1 && rect.bottom<=innerHeight+1 && rect.left>=0 && rect.right<=innerWidth;
        });
      }),{message:`${id}: arena and controls must fit above the fold`}).toBe(true);
      const pause=page.getByRole('button',{name:'Pausar',exact:true});
      await expect(pause).toBeEnabled();
      const rect=await pause.boundingBox();
      expect(rect!.y+rect!.height,`${id}: pause must be reachable without scrolling`).toBeLessThanOrEqual(size.height+1);
      await pause.click();
      await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeVisible();
      await page.getByRole('button',{name:'Continuar',exact:true}).click();
      await page.clock.runFor(100);
      await expect(pause).toBeEnabled();
      await page.getByRole('button',{name:'Sair da tela cheia',exact:true}).click();
      await expect(page.locator('.player')).toHaveAttribute('data-immersive','false');
    }
  });
}

test('rotating a paused landscape game preserves its round and controls', async ({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('fallback'));});
  await page.goto('./#/jogar/turret');
  if (await page.locator(".player-utilities:not([open]) summary").count()) {
    await page.locator(".player-utilities summary").click();
  }
  await page.getByRole('button',{name:'Tela cheia',exact:true}).click();
  await page.getByRole('button',{name:'Começar',exact:true}).click();
  await page.getByRole('button',{name:'Pausar',exact:true}).click();
  const hud=await page.locator('.new-hud').textContent();
  await page.setViewportSize({width:390,height:844});
  await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeVisible();
  await expect(page.locator('.new-hud')).toHaveText(hud);
  await page.setViewportSize({width:844,height:390});
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pausar',exact:true})).toBeEnabled();
});
