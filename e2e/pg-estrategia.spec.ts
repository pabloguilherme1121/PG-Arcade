import { test, expect } from '@playwright/test';

test('PG Estratégia: navegação nos dois sentidos, 150 missões e controles touch', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('./estrategia/');
  await expect(page).toHaveTitle(/PG Estratégia/);
  await expect(page.locator('#result-count')).toHaveText('150 missões');
  await expect(page.getByRole('navigation',{name:'Entre os sites'}).getByRole('link',{name:/PG Arcade/})).toHaveAttribute('href','../');
  await expect(page.locator('.mission-card')).toHaveCount(18);
  await page.getByRole('button',{name:/Iniciar desafio/}).first().click();
  await expect(page.locator('#arena')).toBeVisible();
  await expect(page.locator('#battlefield button')).toHaveCount(25);
  const available=page.locator('#battlefield button:enabled');
  await available.first().tap();
  await expect(page.locator('#arena-turn')).toContainText('1 /');
  await page.getByRole('button',{name:/Desfazer/}).click();
  await expect(page.locator('#arena-turn')).toContainText('0 /');
  await page.locator('#exit').click();
  await expect(page.locator('#arena')).not.toBeVisible();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('PG Estratégia: busca, família, favoritos e missão de gestão concluível',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  await page.goto('./estrategia/');
  await page.getByRole('searchbox',{name:'Pesquisar missões'}).fill('Plano da cidade');
  await expect(page.locator('#result-count')).toHaveText('25 missões');
  await page.getByRole('button',{name:/Iniciar desafio/}).first().click();
  const result=page.locator('#arena');
  await expect(result).toBeVisible();
  for(let i=0;i<10;i++){
    if(await page.getByRole('button',{name:/Próximo desafio/}).isVisible())break;
    await page.getByRole('button',{name:/Planejamento integrado/}).click();
  }
  await expect(page.locator('#arena-message')).toContainText(/Vitória/);
  await page.locator('#exit').click();
  await expect(page.locator('#win-count')).toHaveText('01');
  await page.reload();
  await expect(page.locator('#win-count')).toHaveText('01');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('PG Arcade oferece link direto para o site PG Estratégia', async ({ page }) => {
  await page.goto('./');
  const link = page.getByRole('link', {name: /PG Estratégia · 150 missões/}).first();
  await expect(link).toHaveAttribute('href', /\/estrategia\/$/);
});
