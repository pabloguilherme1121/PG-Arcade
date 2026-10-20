import {expect,test} from '@playwright/test';
test('sound is opt-in and an unavailable audio device never blocks playing',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  Object.assign(window,{audioAttempts:0});
  Object.defineProperty(window,'AudioContext',{value:class{constructor(){(window as unknown as {audioAttempts:number}).audioAttempts++;throw new Error('Audio unavailable');}}});
 });
 await page.goto('./#/jogar/comum');
 const game=page.getByRole('region',{name:'Palavra em Comum',exact:true});
 const toggle=game.getByRole('checkbox',{name:'Ativar sons de feedback (opcional)',exact:true});
 await expect(toggle).not.toBeChecked();
 expect(await page.evaluate(()=>(window as unknown as {audioAttempts:number}).audioAttempts)).toBe(0);
 await toggle.check();
 await game.getByRole('button',{name:'Começar partida',exact:true}).click();
 await game.locator('.cw-options button').first().click();
 await expect(game.getByRole('heading',{name:'Revelação',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as {audioAttempts:number}).audioAttempts)).toBe(1);
 expect(errors).toEqual([]);
});
