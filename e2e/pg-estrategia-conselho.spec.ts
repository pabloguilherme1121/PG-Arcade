import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for(const width of [320,390]){
 test('Conselho de Alianças: toque, teclado, dicas e sem overflow em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.addInitScript(()=>{Math.random=()=>1/0x7fffffff;});
  await page.goto('./estrategia/independentes/conselho-de-aliancas/');
  await expect(page.getByRole('heading',{name:'Conselho de Alianças'})).toBeVisible();
  await expect(page.locator('.faction')).toHaveCount(3);
  await expect(page.locator('#votes')).toContainText('7 cadeiras');
  await page.locator('#pg-bot summary').click();
  await page.locator('[data-help="situation"]').click();
  await expect(page.locator('#bot-answer')).toContainText('Rodada 0');
  await page.locator('#pause').click();
  await expect(page.locator('#pause')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-action="negotiate"]').first()).toBeDisabled();
  await page.locator('#pause').press('Enter');
  await expect(page.locator('#pause')).toHaveAttribute('aria-pressed','false');
  await page.locator('[data-action="negotiate"][data-faction="1"]').tap();
  await page.locator('[data-action="propose"]').tap();
  await page.locator('[data-action="negotiate"][data-faction="0"]').tap();
  await page.locator('[data-action="propose"]').tap();
  await page.locator('[data-action="negotiate"][data-faction="2"]').tap();
  await page.locator('[data-action="propose"]').tap();
  await expect(page.locator('#status')).toContainText('Vitória');
  await expect(page.locator('#record')).toContainText('Melhor pontuação');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#restart').click();
  await expect(page.locator('#round')).toHaveText(/Rodada 0/);
 });
}
test('Conselho: modo estabilidade, dificuldade Veterano e derrota por confiança',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('./estrategia/independentes/conselho-de-aliancas/');
 await page.locator('#mode').selectOption('estabilidade');
 await page.locator('#difficulty').selectOption('veterano');
 await expect(page.locator('#objective')).toContainText('confiança');
 for(let i=0;i<12;i++){
  if(await page.locator('#status').getAttribute('data-phase')==='lost')break;
  await page.locator('[data-action="fund"]').click();
 }
 await expect(page.locator('#status')).toContainText(/Derrota|Fim do prazo/);
 await expect(page.locator('[data-action="fund"]')).toBeDisabled();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
