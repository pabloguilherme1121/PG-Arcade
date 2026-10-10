import {test,expect} from '@playwright/test';

test('memory keeps board focus when help pauses its cards during a shortcut sequence',async({page})=>{
  await page.goto('./#/jogar/memoria');
  await page.locator('.memory-card').first().waitFor();
  await page.getByRole('button',{name:'Ir para o tabuleiro',exact:true}).focus();
  await page.evaluate(()=>{
    for(const code of ['KeyH','KeyH','KeyB']) document.activeElement!.dispatchEvent(new KeyboardEvent('keydown',{code,altKey:true,shiftKey:true,bubbles:true}));
  });
  await expect(page.getByRole('button',{name:'Continuar',exact:true})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>Boolean(document.activeElement?.closest('[data-arcade-arena]')))).toBe(true);
});
