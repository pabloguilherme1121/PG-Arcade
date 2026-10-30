import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for(const width of [320,390]){
 test('Mercado de Sombras: lances, pausa, objetivo e celular '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto('./estrategia/independentes/#mercado-de-sombras');
  await expect(page.getByRole('heading',{name:'Mercado de Sombras'})).toBeVisible();
  await expect(page.locator('.market-lot')).toContainText('Lance mínimo');
  await expect(page.locator('#actions .market-bid')).toHaveCount(3);
  await page.getByLabel('Dificuldade').selectOption('tatico');
  await page.getByRole('button',{name:'Pausar leilão'}).click();
  await expect(page.locator('#actions .market-bid').first()).toBeDisabled();
  await page.getByRole('button',{name:'Retomar leilão'}).click();
  await page.locator('#actions .market-bid').first().tap();
  await expect(page.locator('#metrics')).toContainText('1 / 8');
  await page.getByLabel('Objetivo do mercado').selectOption('patrimonio');
  await expect(page.locator('#metrics')).toContainText('0 / 8');
  await page.locator('#pg-bot-toggle').click();
  await expect(page.locator('#pg-bot-answer')).toContainText('oito rodadas');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('Mercado de Sombras: perder ao passar todos os leilões e reiniciar',async({page})=>{
 await page.goto('./estrategia/independentes/#mercado-de-sombras');
 for(let round=0;round<8;round++) await page.getByRole('button',{name:'Passar este lote'}).click();
 await expect(page.locator('#message')).toHaveAttribute('data-phase','lost');
 await expect(page.locator('#actions .market-bid')).toHaveCount(0);
 await page.getByRole('button',{name:/Reiniciar partida/}).click();
 await expect(page.locator('#metrics')).toContainText('0 / 8');
 await expect(page.locator('#message')).toHaveAttribute('data-phase','playing');
});