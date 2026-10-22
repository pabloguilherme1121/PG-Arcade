import {describe,expect,it} from "vitest";
import {adjacent,cityIsSolved,createCity,measureCity,nextCity,placeCityZone,resetCity,selectCityZone,undoCity,type CityState,type Zone} from "./rules";
const solutions=[
 [[0,1],[2,1],[3,2],[5,3],[7,4]],
 [[0,1],[1,1],[2,1],[4,2],[6,2],[5,3],[15,4]],
 [[0,1],[1,1],[2,1],[3,1],[5,2],[8,2],[6,3],[7,3],[20,4],[24,4]],
] as const;
function build(g:CityState):CityState{
 for(const [cell,zone] of solutions[g.difficulty]){
  if(g.phase==="won")break;
  g=placeCityZone(selectCityZone(g,zone as Zone),cell);
 }
 return g;
}
describe("Cidade em Miniatura — zoneamento e vizinhança",()=>{
 it("produz 360 desafios determinísticos com bloqueios fora da solução construtiva",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<120;seed++){
   const g=createCity(difficulty,seed);
   expect(g).toEqual(createCity(difficulty,seed));
   expect(g.size).toBe(3+difficulty);
   expect(g.cells).toHaveLength(g.size*g.size);
   expect(g.blocked).toHaveLength(1);
   expect(solutions[difficulty].every(([cell])=>!g.blocked.includes(cell))).toBe(true);
   expect(g.budget).toBeGreaterThan(0);
  }
 });
 it("prova uma solução real para 360 desafios com custo, parques e indústria corretos",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<120;seed++){
   const start=createCity(difficulty,seed),won=build(start);
   const m=measureCity(won);
   expect(cityIsSolved(won)).toBe(true);
   expect(won.phase).toBe("won");
   expect(won.score).toBeGreaterThan(0);
   expect(m.cost).toBeLessThanOrEqual(won.budget);
   expect(m.happyHomes).toBe(m.homes);
   expect(m.pollutedHomes).toBe(0);
   expect(start.cells.every(v=>v===0)).toBe(true);
  }
 });
 it("impede invasão de área protegida e déficit financeiro, sem afetar ações válidas",()=>{
  const game=createCity(0,17);
  expect(placeCityZone(game,game.blocked[0])).toBe(game);
  expect(placeCityZone(game,-1)).toBe(game);
  expect(selectCityZone(game,9 as never)).toBe(game);
  let city=game;
  for(let i=0;i<game.cells.length;i++){
   city=placeCityZone(selectCityZone(city,4),i);
  }
  expect(measureCity(city).cost).toBeLessThanOrEqual(game.budget);
  expect(city.cells.filter(x=>x===4).length).toBeLessThanOrEqual(4);
 });
 it("permite substituir/retirar zonas e desfazer vitória sem perdas de estado",()=>{
  const start=createCity(0,7),first=placeCityZone(start,0);
  expect(first.cells[0]).toBe(1);
  const cleared=placeCityZone(first,0);
  expect(cleared.cells[0]).toBe(0);
  expect(undoCity(cleared).cells).toEqual(first.cells);
  expect(undoCity(first)).toEqual(start);
  const won=build(start);
  expect(undoCity(won).phase).toBe("playing");
  expect(resetCity(won)).toEqual(start);
  expect(nextCity(start).seed).not.toBe(start.seed);
 });
 it("mede somente vizinhança ortogonal e recusa índices inválidos",()=>{
  expect(adjacent(3,0)).toEqual([1,3]);
  expect(adjacent(3,4).sort()).toEqual([1,3,5,7]);
  expect(()=>adjacent(3,-1)).toThrow();
  expect(()=>createCity(4 as never)).toThrow();
  expect(()=>createCity(0,-1)).toThrow();
 });
});