import {expect,test} from '@playwright/test';
test('a native fullscreen request completed after leaving the game releases its owned element',async({page})=>{
 await page.addInitScript(()=>{
  let fullscreen:Element|null=null;
  Object.assign(window,{lateFullscreenExits:0});
  Object.defineProperty(document,'fullscreenEnabled',{get:()=>true});
  Object.defineProperty(document,'fullscreenElement',{get:()=>fullscreen});
  Element.prototype.requestFullscreen=function(){
   return new Promise<void>(resolve=>{
    Object.assign(window,{finishDelayedFullscreen:()=>{fullscreen=this;document.dispatchEvent(new Event('fullscreenchange'));resolve();}});
   });
  };
  document.exitFullscreen=async()=>{
   fullscreen=null;
   (window as unknown as {lateFullscreenExits:number}).lateFullscreenExits++;
   document.dispatchEvent(new Event('fullscreenchange'));
  };
 });
 await page.goto('./#/jogar/2048');
 if(await page.locator('.player-utilities:not([open]) summary').count())await page.locator('.player-utilities summary').click();
 await page.getByRole('button',{name:'Tela cheia',exact:true}).click();
 await page.getByRole('link',{name:'Voltar aos jogos',exact:true}).click();
 await expect(page.locator('.game-card').first()).toBeVisible();
 await page.evaluate(()=>(window as unknown as {finishDelayedFullscreen:()=>void}).finishDelayedFullscreen());
 await page.waitForFunction(()=>!document.fullscreenElement&&document.body.style.overflow!=='hidden'&&(window as unknown as {lateFullscreenExits:number}).lateFullscreenExits===1);
 await expect(page.locator('.site-header')).not.toHaveAttribute('inert');
});
