import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const width of [320,390]) test(`active filters can be removed individually at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('./');
  const catalog=page.locator('#catalogo');
  await catalog.getByRole('button',{name:'Estratégia',exact:true}).click();
  await catalog.getByLabel('Buscar jogo',{exact:true}).fill('xadrez');
  await catalog.getByLabel('Filtrar por modo',{exact:true}).selectOption('Dupla local');
  const chips=catalog.getByRole('group',{name:'Filtros ativos'});
  await expect(chips.getByRole('button')).toHaveCount(3);
  await chips.getByRole('button',{name:'Remover categoria: Estratégia',exact:true}).click();
  await expect(catalog.getByLabel('Buscar jogo',{exact:true})).toHaveValue('xadrez');
  await expect(chips.getByRole('button')).toHaveCount(2);
  await expect(page.locator('.discovery')).toHaveCount(0);
  await page.reload();
  await expect(catalog.getByLabel('Buscar jogo',{exact:true})).toHaveValue('xadrez');
  await expect(chips.getByRole('button')).toHaveCount(2);
  await chips.getByRole('button',{name:'Remover busca: xadrez',exact:true}).click();
  await expect(catalog.locator('[data-catalog-game]')).toHaveCount(11);
  const ids=await catalog.locator('[data-catalog-game]').evaluateAll(cards=>
    cards.map(card=>card.getAttribute('data-catalog-game')).sort()
  );
  expect(ids).toEqual(['cofre','comum','contrato','damas','domino','leilao','liga4','passagem','velha','xadrez']);
  expect((await new AxeBuilder({page}).include('#catalogo').analyze()).violations).toEqual([]);
});
test('progress loads on demand, keeps real results and exposes a records-only view',async({page})=>{
  const progressRequests:string[]=[];
  page.on('request',r=>{if(/\/ProgressPage-.*\.js/.test(r.url()))progressRequests.push(r.url())});
  await page.goto('./');
  expect(progressRequests).toHaveLength(0);
  await page.goto('./#/jogar/snake');
  // A hash-only navigation can finish before React commits the game route.
  await expect(page.locator('.player h1')).toHaveText('Snake');
  await page.getByRole('link',{name:'Meu progresso',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Meu progresso',exact:true})).toBeFocused();
  await expect(page.getByRole('progressbar',{name:'Jogos explorados no catálogo'})).toHaveAttribute('value','1');
  expect(progressRequests).toHaveLength(1);
  await page.getByRole('button',{name:'Com recorde (0)',exact:true}).click();
  await expect(page.getByText('Seu primeiro recorde começa com uma partida.')).toBeVisible();
  await page.getByLabel('Restaurar cópia do progresso',{exact:true}).setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({favorites:['xadrez'],records:{snake:12},visits:{snake:4}}))});
  await expect(page.getByRole('button',{name:'Com recorde (1)',exact:true})).toBeVisible();
  await expect(page.locator('.record-list').first().getByRole('link')).toHaveCount(1);
  await expect(page.locator('.record-list').first()).toContainText('12');
});
