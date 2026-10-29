import {test,expect} from '@playwright/test';
test.use({hasTouch:true});

for(const width of [320,390]){
  test('PG Bot responde sem servidor e não estoura largura em '+width+'px', async({page})=>{
    await page.setViewportSize({width,height:780});
    await page.goto('./estrategia/');
    const bot=page.locator('#pg-bot-portal');
    await expect(bot.getByRole('heading',{name:'PG Bot'})).toBeVisible();
    await bot.getByLabel('Sua pergunta').fill('São 150 jogos diferentes?');
    await bot.getByRole('button',{name:'Perguntar'}).click();
    await expect(bot.locator('.pg-bot-answer')).toContainText('150 missões');
    await bot.getByRole('button',{name:'Meu progresso fica salvo?'}).click();
    await expect(bot.locator('.pg-bot-answer')).toContainText('navegador');
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}

test('PG Bot dá dica contextual no jogo sem sobrepor o tabuleiro',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  await page.goto('./estrategia/#est-001');
  await expect(page.locator('#arena')).toBeVisible();
  await page.locator('.pg-bot-details summary').click();
  const bot=page.locator('#pg-bot-arena');
  await bot.getByRole('button',{name:'Me dê uma dica'}).click();
  await expect(bot.locator('.pg-bot-answer')).toContainText('áreas');
  await expect(page.locator('#battlefield button')).toHaveCount(25);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('PG Estratégia permite retomar a última missão após recarregar',async({page})=>{
  await page.goto('./estrategia/');
  await expect(page.locator('#resume')).toBeHidden();
  await page.locator('[data-open="est-001"]').click();
  await page.locator('#exit').click();
  await expect(page.locator('#resume')).toBeVisible();
  await page.reload();
  await page.locator('#resume').click();
  await expect(page.locator('#arena')).toBeVisible();
  await expect(page.locator('#arena-id')).toHaveText('EST-001');
});
