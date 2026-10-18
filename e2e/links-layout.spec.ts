import {expect,test} from '@playwright/test';
test('links shows the complete board and number picker in landscape',async({page},info)=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./#/jogar/links');
  const game=page.locator('.board-expansion');
  await game.getByLabel('Dificuldade',{exact:true}).selectOption('2');
  await expect(game.locator('.new-grid button')).toHaveCount(36);
  const wrap=game.locator('.new-board-wrap');
  expect((await wrap.boundingBox())!.height).toBeLessThanOrEqual(390);
  await wrap.scrollIntoViewIfNeeded();
  const box=(await wrap.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.y+box.height).toBeLessThanOrEqual(391);
  const key=(await game.locator('.links-value-picker button').first().boundingBox())!;
  expect(key.width).toBeGreaterThanOrEqual(44); expect(key.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({path:info.outputPath('links-landscape-fit.png')});
});

test('links desktop board and picker fit the viewport without repeated scrolling',async({page})=>{
  await page.setViewportSize({width:1280,height:720});
  await page.goto('./#/jogar/links');
  const game=page.locator('.board-expansion');
  await game.getByLabel('Dificuldade',{exact:true}).selectOption('2');
  await expect(game.locator('.new-grid button')).toHaveCount(36);
  const wrap=game.locator('.new-board-wrap');
  expect((await wrap.boundingBox())!.height).toBeLessThanOrEqual(720);
  await wrap.scrollIntoViewIfNeeded();
  const bounds=(await wrap.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(-1);
  expect(bounds.y+bounds.height).toBeLessThanOrEqual(721);
});
