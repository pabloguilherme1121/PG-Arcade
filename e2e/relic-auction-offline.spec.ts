import {expect,test} from '@playwright/test';
test('a cached auction resumes and accepts a bid after an offline reload',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Service worker lifecycle is checked in Chromium.');
 await page.goto('./');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));});
 await page.goto('./#/jogar/leilao');
 const game=page.getByRole('region',{name:'Leilão de Relíquias',exact:true});
 await game.getByRole('button',{name:'Começar leilão',exact:true}).click();
 await expect.poll(()=>page.evaluate(async()=>{
  const requests=(await Promise.all((await caches.keys()).filter(key=>key.startsWith('pg-arcade-')).map(async key=>(await(await caches.open(key)).keys()).map(r=>r.url)))).flat();
  return requests.some(url=>/\/RelicAuction-[^/]+\.js$/.test(url));
 })).toBe(true);
 await context.setOffline(true);
 try{
  await page.reload();await game.getByRole('button',{name:'Retomar leilão salvo',exact:true}).click();
  await game.getByRole('button',{name:'Continuar leilão',exact:true}).click();
  await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).click();
  await expect(game.getByRole('heading',{name:'Lances revelados',exact:true})).toBeVisible();
  await expect(game).toHaveCSS('max-width','620px');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }finally{await context.setOffline(false);}
});
test('unavailable storage does not block playing or hide the recovery limitation',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('blocked','QuotaExceededError');}});});
 await page.goto('./#/jogar/leilao');const game=page.getByRole('region',{name:'Leilão de Relíquias',exact:true});
 await game.getByRole('button',{name:'Começar leilão',exact:true}).click();
 await expect(game.getByRole('status')).toContainText('Não foi possível salvar');
 await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).click();
 await expect(game.getByRole('heading',{name:'Lances revelados',exact:true})).toBeVisible();
});
