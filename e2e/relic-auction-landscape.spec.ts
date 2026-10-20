import {expect,test} from '@playwright/test';

test.use({viewport:{width:844,height:390},hasTouch:true});
test('auction landscape keeps the lot and secret bid controls in the viewport',async({page},info)=>{
 await page.goto('./#/jogar/leilao');
 const game=page.getByRole('region',{name:'Leilão de Relíquias',exact:true});
 await game.getByLabel('Modo de jogo',{exact:true}).selectOption('local');
 await game.getByLabel('Participantes',{exact:true}).selectOption('4');
 await game.getByRole('button',{name:'Começar leilão',exact:true}).tap();
 await game.getByRole('button',{name:'Estou pronto',exact:true}).tap();
 await expect(game.getByRole('heading',{name:'Lote 1 de 9',exact:true})).toBeFocused();
 const controls=await page.evaluate(()=>{
  const root=document.querySelector('.relic-auction')!;
  return [...root.querySelectorAll('.ra-lot,select[aria-label="Valor do lance"],button')]
   .filter(node=>node.matches('.ra-lot,select')||node.textContent==='Confirmar lance secreto')
   .map(node=>{const r=node.getBoundingClientRect();return {name:node.textContent?.trim(),visible:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth};});
 });
 expect(controls).toHaveLength(3);
 expect(controls.filter(control=>!control.visible)).toEqual([]);
 await page.screenshot({path:info.outputPath('auction-landscape.png')});
 await game.getByLabel('Valor do lance',{exact:true}).selectOption('1');
 await game.getByRole('button',{name:'Confirmar lance secreto',exact:true}).tap();
 await expect(game.locator('.ra-curtain')).toBeVisible();
 await expect(game.getByLabel('Valor do lance',{exact:true})).toHaveCount(0);
});
