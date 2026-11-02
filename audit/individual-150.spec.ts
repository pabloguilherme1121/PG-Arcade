import {test,expect} from '@playwright/test';
import {games} from '../src/lib/catalog';

// Cada jogo tem execução isolada: apenas abrir o catálogo não é suficiente.
test('o catálogo mantém exatamente 150 IDs distintos',()=>{
 expect(games).toHaveLength(150);
 expect(new Set(games.map(g=>g.id)).size).toBe(150);
});
for(const game of games){
 test('jogo '+game.id+': carrega motor, aceita toque e não estoura 320/390 px',async({page})=>{
  test.setTimeout(40000);
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto('./#/jogar/'+game.id);
  const player=page.locator('[data-current-game="'+game.id+'"]');
  await expect(player).toBeVisible();
  await expect(player.locator('h1')).toHaveText(game.name);
  const arena=player.locator('[data-arcade-arena][data-game-id="'+game.id+'"]');
  await expect(arena).toBeVisible({timeout:20000});
  const actions=arena.locator('button:visible:not([disabled]),[role="button"]:visible:not([aria-disabled="true"]),input:visible:not([disabled]),select:visible:not([disabled]),canvas:visible');
  await expect.poll(async()=>actions.count(),{timeout:15000}).toBeGreaterThan(0);
  // A ação é específica do motor, não o botão global de favoritar ou tela cheia.
  const button=arena.locator('button:visible:not([disabled])').first();
  if(await button.count()){
   await button.click({timeout:5000});
   await expect(arena).toBeVisible();
  }
  expect(errors,'erro JavaScript em '+game.id).toEqual([]);
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   expect(overflow,'overflow de '+game.id+' em '+width+'px').toBeLessThanOrEqual(1);
  }
 });
}
