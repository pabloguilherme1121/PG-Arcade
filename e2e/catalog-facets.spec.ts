import { expect, test } from '@playwright/test';
for (const width of [320,390]) {
 test(`category counts follow players and search at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});await page.goto('./');
  await page.getByLabel('Filtrar por modo',{exact:true}).selectOption('Dupla local');
  const categories=page.getByRole('group',{name:'Categorias',exact:true});
  const strategy=categories.getByRole('button',{name:'Estratégia',exact:true});
  await expect(strategy).toHaveAttribute('title','5 jogos com os outros filtros atuais');
  await expect(categories.getByRole('button',{name:'Carros e corrida',exact:true})).toBeDisabled();
  await strategy.click();await expect(page.locator('.game-grid .game-card')).toHaveCount(5);
  await page.getByLabel('Buscar jogo',{exact:true}).fill('xadrez');
  await expect(strategy).toHaveAttribute('title','1 jogo com os outros filtros atuais');
 });
 test(`stored facets restore and reset at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.addInitScript(()=>{if(!sessionStorage.getItem('pg-arcade-catalog-v1'))sessionStorage.setItem('pg-arcade-catalog-v1',JSON.stringify({query:'xadrez',category:'Estratégia',mode:'Dupla local'}));});
  await page.goto('./');await page.reload();await expect(page.locator('.game-grid .game-card')).toHaveCount(1);
  await page.getByRole('button',{name:'Zerar filtros',exact:true}).click();await expect(page.locator('.game-grid .game-card')).toHaveCount(102);
  await expect(page.getByRole('group',{name:'Categorias',exact:true}).getByRole('button',{name:'Carros e corrida',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}
