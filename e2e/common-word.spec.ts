import {expect,test} from '@playwright/test';
test.use({hasTouch:true});
for(const width of [320,390,844]) test(`common word local complete match at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width===844?390:740});
 await page.goto('./#/jogar/comum');
 const game=page.getByRole('region',{name:'Palavra em Comum',exact:true});
 await game.getByLabel('Modo de jogo').selectOption('local');
 await game.getByLabel('Participantes',{exact:true}).selectOption('4');
 await game.getByLabel('Duração',{exact:true}).selectOption('5');
 await game.getByRole('button',{name:'Começar partida',exact:true}).tap();
 for(let round=0;round<5;round++){
  for(let player=0;player<4;player++){
   await expect(game.locator('.cw-options')).toHaveCount(0);
   await game.getByRole('button',{name:'Estou pronto',exact:true}).tap();
   await game.locator('.cw-options button').first().tap();
  }
  await expect(game.getByRole('heading',{name:'Revelação',exact:true})).toBeVisible();
  await expect(game.locator('.cw-results li')).toHaveCount(4);
  await expect(game.locator('.cw-results strong').first()).toHaveText(`${(round+1)*300} pontos`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await game.getByRole('button',{name:round===4?'Ver resultado':'Próxima rodada',exact:true}).tap();
 }
 await expect(game.getByRole('heading',{name:'Partida concluída',exact:true})).toBeVisible();
 await game.getByRole('button',{name:'Alterar configuração',exact:true}).tap();
 await game.getByLabel('Modo de jogo').selectOption('solo');
 await game.getByRole('button',{name:'Começar partida',exact:true}).tap();
 await game.getByRole('button',{name:'Pausar partida',exact:true}).tap();
 await expect(game.locator('.cw-options')).toHaveCount(0);
 await game.getByRole('button',{name:'Continuar partida',exact:true}).tap();
 for(let round=0;round<5;round++){
  await game.locator('.cw-options button').first().tap();
  await expect(game.locator('.cw-results')).toContainText('Bot aleatório');
  await game.getByRole('button',{name:round===4?'Ver resultado':'Próxima rodada',exact:true}).tap();
 }
 await expect(game.getByRole('heading',{name:'Partida concluída',exact:true})).toBeVisible();
 await game.getByRole('button',{name:'Jogar novamente',exact:true}).tap();
 await expect(game.locator('.cw-options button')).toHaveCount(4);
});
