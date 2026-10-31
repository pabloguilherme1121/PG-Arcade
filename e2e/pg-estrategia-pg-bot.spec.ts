import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for(const width of [320,390]){
 test('PG Bot contextual acompanha o jogo no celular '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto('./estrategia/independentes/#patrulha-tatica');
  const toggle=page.getByRole('button',{name:/PG Bot Ajuda durante a partida/});
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.tap();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  const answer=page.locator('#pg-bot-answer');
  await expect(answer).toContainText('neutralize os drones');
  await page.getByRole('button',{name:'Controles'}).click();
  await expect(answer).toContainText('kit médico');
  await page.getByRole('button',{name:'Situação'}).click();
  await expect(answer).toContainText('Partida em andamento');
  await page.getByLabel('Objetivo tático').selectOption('extracao');
  await page.getByRole('button',{name:'Objetivo',exact:true}).click();
  await expect(answer).toContainText('sinal central');
  await toggle.click();
  await expect(page.locator('#pg-bot-body')).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('PG Bot atualiza resultado após trocar jogo e suporta teclado',async({page})=>{
 await page.goto('./estrategia/independentes/#frota-oculta');
 const toggle=page.locator('#pg-bot-toggle');
 await toggle.focus();
 await page.keyboard.press('Enter');
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#pg-bot-answer')).toContainText('embarcações inimigas');
 await page.locator('[data-select="hex-conexao"]').click();
 await expect(page.locator('#pg-bot-answer')).toContainText('Conecte suas pedras');
 await expect(page.locator('#pg-bot-answer')).not.toContainText('embarcações');
});