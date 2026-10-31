import {test,expect} from '@playwright/test';
const url='./estrategia/independentes/sudoku-fortaleza/?seed=7';

for(const width of [320,390]){
 test('Sudoku: controle por toque, pausa, desfazer e PG Bot em '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:760});
  await page.goto(url);
  await expect(page.getByRole('heading',{name:'Sudoku da Fortaleza'})).toBeVisible();
  await expect(page.locator('.cell')).toHaveCount(16);
  const editable=page.locator('.cell[data-fixed="false"]').first();
  await editable.click();
  await page.locator('#keypad [data-digit="1"]').click();
  await expect(page.locator('#moves')).toHaveText('1');
  await page.locator('#pause').click();
  await expect(page.locator('#phase')).toHaveText('Pausado');
  await expect(page.locator('.cell').first()).toBeDisabled();
  await page.locator('#pause').click();
  await page.locator('#undo').click();
  await expect(page.locator('#moves')).toHaveText('0');
  await page.locator('#pg-bot summary').click();
  await page.getByRole('button',{name:'Situação'}).click();
  await expect(page.locator('#bot-answer')).toContainText('tentativas');
  const usable=await page.locator('#keypad [data-digit="1"]').boundingBox();
  expect(usable).not.toBeNull();
  expect(usable!.height).toBeGreaterThanOrEqual(44);
  const clippedControls=await page.evaluate(()=>Array.from(document.querySelectorAll('#keypad, #keypad button, .selectors, .selectors label, .selectors select')).filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.id||el.className||el.tagName));
  expect(clippedControls).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 });
}
test('Sudoku: vitória por dica lógica, recorde e persistência após recarregar',async({page})=>{
 await page.goto(url);
 for(let n=0;n<16;n++){
  if(await page.locator('#phase').textContent()==='Vitória')break;
  await page.locator('#hint').click();
 }
 await expect(page.locator('#phase')).toHaveText('Vitória');
 await expect(page.locator('#record')).toContainText('pts');
 await expect(page.locator('#hint')).toBeDisabled();
 await page.reload();
 await expect(page.locator('#record')).toContainText('pts');
 await expect(page.locator('#phase')).toHaveText('Em andamento');
});
test('Sudoku: modo diagonal 9×9, teclado e ausência de overflow',async({page})=>{
 await page.setViewportSize({width:320,height:800});
 await page.goto(url);
 await page.locator('#mode').selectOption('diagonal');
 await page.locator('#difficulty').selectOption('veterano');
 await expect(page.locator('.cell')).toHaveCount(81);
 await expect(page.locator('#keypad [data-digit="9"]')).toBeVisible();
 const cell=page.locator('.cell[data-fixed="false"]').first();
 await cell.focus();
 await page.keyboard.press('9');
 await expect(page.locator('#moves')).toHaveText('1');
 await expect(page.locator('#errors')).not.toHaveText('0/3');
 await expect(page.locator('#mode')).toHaveValue('diagonal');
 await expect(page.locator('#difficulty')).toHaveValue('veterano');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.reload();
 await expect(page.locator('#mode')).toHaveValue('diagonal');
 await expect(page.locator('#difficulty')).toHaveValue('veterano');
});
test('Sudoku: limite de tentativas termina em derrota e novo jogo reinicia',async({page})=>{
 await page.goto(url);
 const details=await page.evaluate(async()=>{
  const {createSudoku}=await import('./engine.mjs');
  const game=createSudoku({difficulty:'recruta',mode:'classico',seed:7});
  const index=game.values.findIndex(v=>v===0);
  return {index,wrong:game.solution[index]%game.size+1};
 });
 await page.locator('.cell').nth(details.index).click();
 for(let n=0;n<3;n++)await page.locator('#keypad [data-digit="'+details.wrong+'"]').click();
 await expect(page.locator('#phase')).toHaveText('Derrota');
 await expect(page.locator('#errors')).toHaveText('3/3');
 await expect(page.locator('#hint')).toBeDisabled();
 await page.getByRole('button',{name:'Nova partida'}).click();
 await expect(page.locator('#phase')).toHaveText('Em andamento');
 await expect(page.locator('#errors')).toHaveText('0/3');
});
test('Sudoku: catálogo abre o novo jogo e permite voltar',async({page})=>{
 await page.goto('./estrategia/independentes/');
 await page.getByRole('link',{name:/Sudoku da Fortaleza/}).click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/sudoku-fortaleza\/$/);
 await page.getByRole('link',{name:'Jogos independentes'}).first().click();
 await expect(page).toHaveURL(/\/estrategia\/independentes\/#frota-oculta$/);
});
