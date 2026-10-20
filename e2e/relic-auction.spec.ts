import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const openGame=async(page:import('@playwright/test').Page)=>{
 await page.goto('./#/jogar/leilao');
 return page.getByRole('region',{name:'Leilão de Relíquias',exact:true});
};
// Separate complete journeys keep each fixture within the default deadline;
// real touch actions, all nine lots and privacy assertions remain covered.
for(const width of [320,390,844])test.describe(`auction touch at ${width}px`,()=>{
 test.use({viewport:{width,height:width===844?390:844},hasTouch:true});
 test('completes a solo match',async({page})=>{
  const game=await openGame(page);
  await game.getByRole('button',{name:'Começar leilão',exact:true}).tap();
  for(let r=0;r<9;r++){
   await expect(game.getByRole('heading',{name:`Lote ${r+1} de 9`,exact:true})).toBeVisible();
   await game.getByLabel('Valor do lance',{exact:true}).selectOption('0');
   await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).tap();
   await expect(game.getByRole('heading',{name:'Lances revelados',exact:true})).toBeVisible();
   await expect(game.getByLabel('Lances da rodada')).toContainText('Você: 0 moedas');
   await game.getByRole('button',{name:r===8?'Ver resultado':'Próximo lote',exact:true}).tap();
  }
  await expect(game.getByRole('heading',{name:'Leilão concluído',exact:true})).toBeVisible();
  await expect(game.locator('.ra-outcome')).toContainText('Bot colecionador venceu');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
 test('completes a four-player match and restarts',async({page})=>{
  const game=await openGame(page);
  await game.getByLabel('Modo de jogo',{exact:true}).selectOption('local');
  await game.getByLabel('Participantes',{exact:true}).selectOption('4');
  await game.getByRole('button',{name:'Começar leilão',exact:true}).tap();
  for(let r=0;r<9;r++){
   for(let player=0;player<4;player++){
    await expect(game.locator('.ra-curtain')).toBeVisible();
    await expect(game.getByLabel('Valor do lance',{exact:true})).toHaveCount(0);
    await game.getByRole('button',{name:'Estou pronto',exact:true}).tap();
    await game.getByLabel('Valor do lance',{exact:true}).selectOption('1');
    await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).tap();
   }
   await expect(game.getByRole('heading',{name:'Lances revelados',exact:true})).toBeVisible();
   await expect(game.getByLabel('Lances da rodada').locator('li')).toHaveCount(4);
   await game.getByRole('button',{name:r===8?'Ver resultado':'Próximo lote',exact:true}).tap();
  }
  await expect(game.getByRole('heading',{name:'Leilão concluído',exact:true})).toBeVisible();
  const outcome=await game.locator('.ra-scoreboard section').allTextContents();
  await game.getByRole('button',{name:'Repetir os mesmos lotes',exact:true}).tap();
  await expect(game.locator('.ra-scoreboard section')).not.toHaveText(outcome);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
});
test('reload resumes a private local bid paused and charges it only once',async({page})=>{
 const game=await openGame(page);
 await game.getByLabel('Modo de jogo',{exact:true}).selectOption('local');
 await game.getByRole('button',{name:'Começar leilão',exact:true}).click();
 await game.getByRole('button',{name:'Estou pronto',exact:true}).click();
 await game.getByLabel('Valor do lance',{exact:true}).selectOption('5');
 await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).click();
 await page.reload();
 await game.getByRole('button',{name:'Retomar leilão salvo',exact:true}).click();
 await expect(game.getByRole('heading',{name:'Leilão pausado',exact:true})).toBeVisible();
 await game.getByRole('button',{name:'Continuar leilão',exact:true}).click();
 await expect(game.getByLabel('Valor do lance',{exact:true})).toHaveCount(0);
 await game.getByRole('button',{name:'Estou pronto',exact:true}).click();
 await game.getByLabel('Valor do lance',{exact:true}).selectOption('0');
 await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).click();
 await expect(game.locator('.ra-scoreboard')).toContainText('25 moedas');
 const before=await game.locator('.ra-scoreboard section').allTextContents();
 await page.reload();await game.getByRole('button',{name:'Retomar leilão salvo',exact:true}).click();
 await game.getByRole('button',{name:'Continuar leilão',exact:true}).click();
 await expect(game.locator('.ra-scoreboard section')).toHaveText(before);
});
test('keyboard, pause, accessible controls and three truthful bot levels',async({page},info)=>{
 await page.setViewportSize({width:320,height:740});
 const game=await openGame(page);
 await expect(game.getByLabel('Dificuldade do bot',{exact:true}).locator('option')).toHaveCount(3);
 await game.getByLabel('Dificuldade do bot',{exact:true}).selectOption('hard');
 await expect(game).toContainText('O orçamento é igual para todos');
 await game.getByRole('button',{name:'Começar leilão',exact:true}).focus();await page.keyboard.press('Enter');
 await game.getByLabel('Valor do lance',{exact:true}).selectOption('3');
 await page.evaluate(()=>window.dispatchEvent(new Event('pg-arcade-pause')));
 await expect(game.getByRole('heading',{name:'Leilão pausado',exact:true})).toBeVisible();
 await game.getByRole('button',{name:'Continuar leilão',exact:true}).click();
 await expect(game.getByLabel('Valor do lance',{exact:true})).toHaveValue('3');
 await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(game.getByLabel('Lances da rodada')).toContainText('Você: 3 moedas');
 const audit=await new AxeBuilder({page}).include('.relic-auction').analyze();expect(audit.violations).toEqual([]);
 const badTargets=await game.locator('button').evaluateAll(buttons=>buttons.filter(b=>{const r=b.getBoundingClientRect();return r.width<44||r.height<44;}).map(b=>b.textContent));
 expect(badTargets).toEqual([]);
 await page.screenshot({path:info.outputPath('auction-320.png')});
 await expect(page.getByRole('button',{name:/^(Sprint|Maratona):/})).toHaveCount(0);
});
