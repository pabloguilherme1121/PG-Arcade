import {test,expect} from '@playwright/test';

test.use({hasTouch:true});

for(const width of [320,390]){
 test('PG Estratégia: Patrulha Tática tem controles touch e modo de extração '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:780});
  await page.goto('./estrategia/independentes/#patrulha-tatica');
  await expect(page.getByRole('heading',{name:'Patrulha Tática'})).toBeVisible();
  await expect(page.locator('#board .squad-cell')).toHaveCount(25);
  await expect(page.getByLabel('Dificuldade')).toHaveValue('recruta');
  await expect(page.getByLabel('Objetivo tático')).toHaveValue('combate');
  const target=page.locator('#board [data-squad="15"]');
  await expect(target).toBeEnabled();
  await target.tap();
  await expect(page.locator('#metrics')).toContainText('1 / 30');
  await page.getByLabel('Objetivo tático').selectOption('extracao');
  await expect(page.locator('#metrics')).toContainText('0 / 30');
  await expect(page.locator('#actions')).toContainText(/sinal/i);
  const defend=page.getByRole('button',{name:'Defender posição'});
  await defend.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#metrics')).toContainText('1 / 30');
  await page.getByRole('button',{name:/Reiniciar partida/}).click();
  await expect(page.locator('#metrics')).toContainText('0 / 30');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('navigation',{name:'Navegação entre os sites'}).getByRole('link',{name:'PG Arcade'})).toHaveAttribute('href','../../');
 });
}

test('PG Estratégia: terceiro jogo tem motor próprio e troca dificuldade',async({page})=>{
 await page.goto('./estrategia/independentes/');
 const squad=page.getByRole('button',{name:/Patrulha Tática/});
 await squad.click();
 await expect(squad).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#board .squad-cell')).toHaveCount(25);
 await page.getByLabel('Dificuldade').selectOption('veterano');
 await expect(page.locator('#metrics')).toContainText('0 / 22');
 await expect(page.getByRole('button',{name:'Aplicar kit médico (1)'})).toBeDisabled();
 await expect(page.getByRole('heading',{name:'Patrulha Tática'})).toBeVisible();
});
