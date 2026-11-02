import {test,expect} from '@playwright/test';
import { readdirSync, existsSync } from 'node:fs';
test.use({hasTouch:true});
const dir='public/estrategia/independentes/';
const games=readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory()&&existsSync(dir+x.name+'/index.html')).map(x=>x.name);
test('todos os jogos independentes com página estão incluídos na cobertura',()=>expect(games).toHaveLength(27));
for(const game of games){
 test('perguntas sem rede usam a resposta real do PG Bot em '+game,async({page})=>{
  const pageErrors:string[]=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  await page.setViewportSize({width:320,height:780});
  await page.goto('./estrategia/independentes/'+game+'/');
  const panel=page.locator('#pg-bot');
  await expect(panel).toBeVisible();
  await panel.locator('summary').click();
  const field=panel.getByRole('searchbox',{name:'Pergunte ao PG Bot sobre este jogo'});
  await expect(field).toBeVisible();
  await field.fill('qual é a situação da partida?');
  await panel.getByRole('button',{name:'Perguntar',exact:true}).tap();
  const answer=panel.locator('#bot-answer,#bot-response,#market-bot-answer');
  await expect(answer).not.toBeEmpty();
  await expect(panel.locator('.pg-bot-ask-status')).toBeEmpty();
  await field.fill('funciona sem internet?');
  await panel.getByRole('button',{name:'Perguntar',exact:true}).tap();
  await expect(panel.locator('.pg-bot-ask-status')).toContainText(/offline|internet|cache/i);
  await field.fill('<img src=x onerror=alert(1)>');
  await panel.getByRole('button',{name:'Perguntar',exact:true}).tap();
  await expect(panel.locator('.pg-bot-ask-status')).toContainText('objetivo');
  await expect(panel.locator('.pg-bot-ask-status')).not.toContainText('<img');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(pageErrors).toEqual([]);
 });
}
for(const game of ['cofre-codigos','conselho-de-reinos','mercado-de-rotas']){
 test('teclado e estratégia do bot independente '+game,async({page})=>{
  await page.setViewportSize({width:390,height:790});
  await page.goto('./estrategia/independentes/'+game+'/');
  const panel=page.locator('#pg-bot');await panel.locator('summary').click();
  const field=panel.getByRole('searchbox',{name:'Pergunte ao PG Bot sobre este jogo'});
  await field.focus();await page.keyboard.type('qual a melhor estratégia?');
  await page.keyboard.press('Enter');
  await expect(panel.locator('.pg-bot-ask-status')).toBeEmpty();
  await expect(panel.locator('#bot-answer,#bot-response,#market-bot-answer')).not.toBeEmpty();
  await expect(field).toHaveAttribute('maxlength','240');
 });
}
test('campo de perguntas funciona após recarregar offline, com recursos armazenados',async({page,context})=>{
 await page.goto('./estrategia/independentes/cofre-codigos/');
 await page.waitForFunction(()=>navigator.serviceWorker?.controller?.scriptURL.includes('cofre-codigos/sw.js'));
 await page.reload();
 await context.setOffline(true);
 await page.reload();
 const panel=page.locator('#pg-bot');await panel.locator('summary').click();
 await panel.getByRole('searchbox',{name:'Pergunte ao PG Bot sobre este jogo'}).fill('controles');
 await panel.getByRole('button',{name:'Perguntar',exact:true}).click();
 await expect(panel.locator('#bot-answer')).toContainText(/posição|símbolo|controles|selecion/i);
 await context.setOffline(false);
});
