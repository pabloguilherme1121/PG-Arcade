import {test,expect} from '@playwright/test';
test('previously visited common word plays after offline reload',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Service worker lifecycle is checked in Chromium.');
 await page.goto('./');
 await page.evaluate(async()=>{
  await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));
 });
 await page.goto('./#/jogar/comum');
 const game=page.getByRole('region',{name:'Palavra em Comum',exact:true});
 await expect(game.getByRole('button',{name:'Começar partida',exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(async()=>{
  const entries=await Promise.all((await caches.keys()).filter(k=>k.startsWith('pg-arcade-')).map(async k=>(await(await caches.open(k)).keys()).map(r=>r.url)));
  return entries.flat().some(url=>/\/CommonWord-[^/]+\.js$/.test(url));
 })).toBe(true);
 await context.setOffline(true);
 try{
  await page.reload();
  await game.getByRole('button',{name:'Começar partida',exact:true}).click();
  await game.locator('.cw-options button').first().click();
  await expect(game.getByRole('heading',{name:'Revelação',exact:true})).toBeVisible();
  await expect(game.locator('.cw-results')).toContainText('Bot aleatório');
 }finally{await context.setOffline(false);}
});
