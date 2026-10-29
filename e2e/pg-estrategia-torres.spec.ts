import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
for (const width of [320,390]) {
  test('PG Estratégia: Muralha das Torres jogável por toque em '+width+'px', async({page})=>{
    await page.setViewportSize({width,height:780});
    await page.goto('./estrategia/independentes/#muralha-das-torres');
    await expect(page.getByRole('heading',{name:'Muralha das Torres'})).toBeVisible();
    await expect(page.locator('#board .tower-cell')).toHaveCount(36);
    await expect(page.getByLabel('Modo das torres')).toHaveValue('defesa');
    await expect(page.getByLabel('Tipo de torre')).toHaveValue('laser');
    await expect(page.locator('#board [data-tower="0"]')).toBeDisabled();
    await page.locator('#board [data-tower="6"]').tap();
    await expect(page.locator('#metrics')).toContainText('13');
    await expect(page.locator('#board [data-tower="6"]')).toHaveAttribute('data-kind','laser');
    await page.locator('#board [data-tower="6"]').tap();
    await expect(page.locator('#metrics')).toContainText('9');
    await page.getByRole('button',{name:'Iniciar onda 1'}).click();
    await page.getByRole('button',{name:'Avançar combate'}).click();
    await expect(page.locator('#metrics')).toContainText('1 / 3');
    await page.getByRole('button',{name:'Pausar defesa'}).click();
    await expect(page.getByRole('button',{name:'Avançar combate'})).toBeDisabled();
    await page.getByRole('button',{name:'Retomar defesa'}).click();
    await expect(page.getByRole('button',{name:'Avançar combate'})).toBeEnabled();
    await page.getByRole('button',{name:/Reiniciar partida/}).click();
    await expect(page.locator('#board [data-tower="6"]')).toHaveAttribute('data-kind','free');
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
test('PG Estratégia: operação Maratona e dificuldade Veterano usam regras distintas',async({page})=>{
 await page.goto('./estrategia/independentes/#muralha-das-torres');
 await page.getByLabel('Modo das torres').selectOption('maratona');
 await page.getByLabel('Dificuldade').selectOption('veterano');
 await expect(page.locator('#metrics')).toContainText('1 / 7');
 await expect(page.locator('#metrics')).toContainText('12');
 await page.getByLabel('Tipo de torre').selectOption('gelo');
 await page.locator('#board [data-tower="6"]').click();
 await expect(page.locator('#board [data-tower="6"]')).toHaveAttribute('data-kind','gelo');
 await expect(page.getByRole('navigation',{name:'Navegação entre os sites'}).getByRole('link',{name:'PG Arcade'})).toHaveAttribute('href','../../');
});
