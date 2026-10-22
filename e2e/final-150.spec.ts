import { test,expect } from '@playwright/test';
import { finalGames, type FinalId } from '../src/lib/finalCatalog';
import { initial, act, won, solutions } from '../src/games/finalCollection/rules';
function sequence(id:FinalId){
 const queue=[{state:initial(id),path:[] as number[]}],seen=new Set<string>();
 for(let n=0;n<queue.length&&n<10000;n++){
  const {state,path}=queue[n];if(won(id,state.cells))return path;
  for(let i=0;i<(id==='baldes'?6:5);i++){
   const next=act(id,state,i),key=next.cells.join(',');
   if(!seen.has(key)){seen.add(key);queue.push({state:{...next,history:[]},path:[...path,i]})}
  }
 }throw Error('Unreachable victory '+id);
}
for(const game of finalGames){
 test(`${game.id}: mobile, landscape, legal victory, undo and persistent record`,async({page})=>{
  test.setTimeout(60000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`./#/jogar/${game.id}`);
  const panel=page.locator(`[data-final-game="${game.id}"]`);
  await expect(panel).toBeVisible();
  for(const viewport of [{width:320,height:740},{width:844,height:390},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await panel.getByRole('button',{name:'Reiniciar',exact:true}).scrollIntoViewIfNeeded();
   await expect(panel.getByRole('button',{name:'Reiniciar',exact:true})).toBeVisible();
  }
  const click=async(i:number)=>{
   if(game.id==='baldes')await panel.locator('.final-actions').first().getByRole('button').nth(i).click();
   else if(game.id==='panquecas')await panel.getByRole('button',{name:`Inverter ${i} do topo`}).click();
   else if(game.id==='sapos')await panel.locator('.final-frogs button').nth(i).click();
   else if(game.id==='restos')await panel.getByRole('button',{name:new RegExp(`^Disco ${'ABC'[i]}:`)}).click();
   else if(game.id==='dominosa')await panel.locator('.final-dominos button').nth(i).click();
   else if(game.id==='mochila')await panel.getByRole('button',{name:new RegExp(`^Item ${i+1}:`)}).click();
   else await panel.locator(`[data-cell="${i}"]`).click();
  };
  if(['baldes','panquecas','sapos'].includes(game.id))for(const i of sequence(game.id))await click(i);
  else for(const [i,value] of solutions[game.id]!.entries()){
   if(game.id==='restos'){for(let n=0;n<value;n++)await click(i)}
   else if(value){if(game.id==='retangulos')await panel.getByRole('button',{name:`Grupo ${'ABCD'[value-1]}`,exact:true}).click();await click(i)}
  }
  await expect(panel.getByRole('status')).toContainText('Vitória!');
  await expect.poll(()=>page.evaluate(id=>JSON.parse(localStorage.getItem('pg-arcade-progress-v1')||'{}').records?.[id]||0,game.id)).toBeGreaterThan(0);
  await panel.getByRole('button',{name:'Desfazer ação'}).click();
  await expect(panel.getByRole('status')).not.toContainText('Vitória!');
  await page.reload();await expect(panel).toBeVisible();
  await expect(panel.getByRole('status')).toContainText(/Recorde: [1-9]/);
  expect(errors).toEqual([]);
 });
}
test('150 catalog entries, 96 turn-based games and local covers',async({page})=>{
 await page.goto('./');
 await expect(page.locator('.game-grid .game-card')).toHaveCount(150);
 const filter=page.getByRole('button',{name:/^Por turnos/});await filter.scrollIntoViewIfNeeded();await filter.click();
 await expect(page.locator('.game-grid .game-card')).toHaveCount(96);
 for(const game of finalGames){const res=await page.request.get(`./covers/${game.id}.svg`);expect(res.ok()).toBe(true);expect(await res.text()).toContain('<svg')}
});
