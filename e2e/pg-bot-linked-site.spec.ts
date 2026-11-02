import {test,expect} from '@playwright/test';
for(const width of [320,390]){
 test('central independente do PG Bot abre pelo catálogo e pelo jogo em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:800});
  await page.goto('./');
  const catalog=page.locator('[data-pg-bot="catalog-help"]');
  await catalog.locator('summary').click();
  await expect(catalog.getByRole('link',{name:/site completo do PG Bot/i})).toHaveAttribute('href','https://pabloguilherme1121.github.io/PG-Bot/?projeto=arcade');
  await page.goto('./#/jogar/snake');
  const help=page.locator('[data-pg-bot="game-help"]');
  await help.locator('summary').click();
  await expect(help.getByRole('link',{name:/PG Bot completo/}))
   .toHaveAttribute('href','https://pabloguilherme1121.github.io/PG-Bot/?projeto=arcade&jogo=snake');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
