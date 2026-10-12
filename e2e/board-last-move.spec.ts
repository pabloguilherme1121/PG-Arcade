import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const width of [320,390]) test(`board move feedback and undo at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('./#/jogar/gomoku');
  const arena=page.locator('[data-new-game="gomoku"]');
  await arena.locator('[data-index="0"]').click();
  await expect(arena.locator('[data-last-move]')).toHaveCount(2);
  await expect(arena.locator('.board-move-feedback')).toContainText('2 casas alteradas');
  await arena.getByRole('button',{name:'Desfazer',exact:true}).click();
  await expect(arena.locator('[data-last-move][data-value="0"]')).toHaveCount(2);
  await arena.getByRole('button',{name:'Reiniciar',exact:true}).click();
  await expect(arena.locator('[data-last-move]')).toHaveCount(0);
  expect((await new AxeBuilder({page}).include('[data-new-game="gomoku"]').analyze()).violations).toEqual([]);
});
