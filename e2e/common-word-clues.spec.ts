import {expect,test} from '@playwright/test';
test('solo rewards interpreting a visible clue rather than guessing',async({page})=>{
 await page.addInitScript(()=>{
  const original=crypto.getRandomValues.bind(crypto);
  Object.defineProperty(crypto,'getRandomValues',{value:(array:ArrayBufferView)=>{
   if(array instanceof Uint32Array && array.length===1){array[0]=42;return array;}
   return original(array);
  }});
 });
 await page.goto('./#/jogar/comum');
 const game=page.getByRole('region',{name:'Palavra em Comum',exact:true});
 await game.getByRole('button',{name:'Começar partida',exact:true}).click();
 await expect(game.locator('.cw-clue')).toContainText('Grãos que ficam nos pés depois de caminhar na praia.');
 await game.getByRole('button',{name:'Areia',exact:true}).click();
 await expect(game.getByRole('heading',{name:'Revelação',exact:true})).toBeVisible();
 await expect(game.locator('.cw-results strong').first()).toHaveText('100 pontos');
 await expect(game.locator('.cw-results')).toContainText('Bot de pistas: Areia');
});

test('the player can repeat the same local challenge without drawing a new seed',async({page})=>{
 await page.addInitScript(()=>{
  Object.assign(window,{seedRequests:0});
  const original=crypto.getRandomValues.bind(crypto);
  Object.defineProperty(crypto,'getRandomValues',{value:(array:ArrayBufferView)=>{
   if(array instanceof Uint32Array && array.length===1){(window as unknown as {seedRequests:number}).seedRequests++;array[0]=42;return array;}
   return original(array);
  }});
 });
 await page.goto('./#/jogar/comum');
 const game=page.getByRole('region',{name:'Palavra em Comum',exact:true});
 await game.getByLabel('Duração',{exact:true}).selectOption('5');
 await game.getByRole('button',{name:'Começar partida',exact:true}).click();
 const firstHint=await game.locator('.cw-clue').innerText();
 for(let round=0;round<5;round++){
  await game.locator('.cw-options button').first().click();
  await game.getByRole('button',{name:round===4?'Ver resultado':'Próxima rodada',exact:true}).click();
 }
 await game.getByRole('button',{name:'Repetir os mesmos temas',exact:true}).click();
 await expect(game.locator('.cw-clue')).toHaveText(firstHint);
 expect(await page.evaluate(()=>(window as unknown as {seedRequests:number}).seedRequests)).toBe(1);
 await game.locator('.cw-options button').first().click();
 await expect(game.locator('.cw-results strong').first()).toHaveText('0 pontos');
});
