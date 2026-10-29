import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for(const width of [320,390]){
 test('Cifras Reais: dedução, PG Bot e controles em '+width+'px sem overflow',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto('./estrategia/independentes/cifras-reais/?seed=42');
  await expect(page.getByRole('heading',{name:'Cifras Reais'})).toBeVisible();
  await expect(page.locator('#slots select')).toHaveCount(4);
  await page.locator('#pg-bot summary').click();
  await page.locator('[data-help="situacao"]').click();
  await expect(page.locator('#bot-answer')).toContainText('0/11');
  await page.locator('#hint').tap();
  await expect(page.locator('#hints')).toContainText('Posição 1: Lua');
  await page.locator('#pause').click();
  await expect(page.locator('#pause')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#submit')).toBeDisabled();
  await page.locator('#pause').press('Enter');
  await expect(page.locator('#pause')).toHaveAttribute('aria-pressed','false');
  for(const [i,token] of ['lua','vento','mar','fogo'].entries())
   await page.locator('#symbol-'+i).selectOption(token);
  await page.locator('#submit').tap();
  await expect(page.locator('#status')).toHaveAttribute('data-status','won');
  await expect(page.locator('#status')).toContainText('Vitória');
  await expect(page.locator('#record')).toContainText('Melhor pontuação');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('Cifras Reais: derrota por limite, entrada repetida e modo Expedição',async({page})=>{
 await page.setViewportSize({width:390,height:780});
 await page.goto('./estrategia/independentes/cifras-reais/?seed=42');
 await page.locator('#difficulty').selectOption('veterano');
 await page.locator('#symbol-1').selectOption('sol');
 await page.locator('#submit').click();
 await expect(page.locator('#status')).toContainText('símbolos diferentes');
 for(const [i,token] of ['sol','lua','terra','vento'].entries())
  await page.locator('#symbol-'+i).selectOption(token);
 for(let i=0;i<7;i++)await page.locator('#submit').click();
 await expect(page.locator('#status')).toHaveAttribute('data-status','lost');
 await expect(page.locator('#status')).toContainText('A sequência era:');
 await expect(page.locator('#submit')).toBeDisabled();
 await page.locator('#mode').selectOption('expedicao');
 await expect(page.locator('#slots select')).toHaveCount(5);
 await expect(page.locator('#status')).toHaveAttribute('data-status','playing');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});