import {test,expect} from '@playwright/test';
const url='/estrategia/independentes/moinhos-pedra/';
for(const width of [320,390]){
 test('Moinhos: toque, pausa, desfazer e bot em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:760});
  await page.goto(url);
  await expect(page.getByRole('heading',{name:'Moinhos de Pedra'})).toBeVisible();
  await expect(page.locator('.point')).toHaveCount(24);
  await page.locator('.point').nth(0).click();
  await expect(page.locator('#human-pieces')).toHaveText('1/6');
  await expect(page.locator('#bot-pieces')).toHaveText('1/6');
  await page.locator('#pause').click();
  await expect(page.getByText('Partida pausada.')).toBeVisible();
  await expect(page.locator('.point').nth(1)).toBeDisabled();
  await page.locator('#pause').click();
  await page.locator('#undo').click();
  await expect(page.locator('#human-pieces')).toHaveText('0/6');
  await page.locator('#pg-bot summary').click();
  await page.getByRole('button',{name:'Situação'}).click();
  await expect(page.locator('#bot-answer')).toContainText('Você tem 0 pedras');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  expect(overflow).toBe(false);
 });
}
test('Moinhos: dois modos, três dificuldades e navegação de retorno',async({page})=>{
 await page.goto(url);
 await page.locator('#mode').selectOption('classico');
 await expect(page.locator('#human-pieces')).toHaveText('0/9');
 await page.locator('#difficulty').selectOption('veterano');
 await page.locator('.point').nth(0).focus();
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('.point').nth(1)).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#human-pieces')).toHaveText('1/9');
 await page.reload();
 await expect(page.locator('#mode')).toHaveValue('classico');
 await expect(page.locator('#difficulty')).toHaveValue('veterano');
 await page.getByRole('link',{name:'Jogos originais'}).first().click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/#frota-oculta$/);
});
test('Moinhos: portal aponta para o 26º jogo',async({page})=>{
 await page.goto('/estrategia/');
 await page.getByRole('link',{name:/Moinhos de Pedra/}).click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/moinhos-pedra\/$/);
});
