import {describe,expect,it} from "vitest";
import {buyCargo,cargoCount,cityNames,moveTrader,netProfit,newTradeGame,nextTrade,refuel,restartTrade,routeFuel,sellCargo} from "./rules";
describe("Mercadores de Rotas — economia e planejamento",()=>{
 it("gera 180 cenários reproduzíveis com preços de compra menores que de venda",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   const g=newTradeGame(d,seed);
   expect(g).toEqual(newTradeGame(d,seed));
   expect(g.inventory).toEqual([0,0,0]);
   expect(g.buyPrices).toHaveLength(3);
   expect(g.sellPrices.every((price,i)=>price>g.buyPrices[i])).toBe(true);
   expect(g.fuel).toBe([10,13,16][d]);expect(cityNames).toHaveLength(4);
  }
 });
 it("realiza compras e deslocamentos válidos sem inventar recursos",()=>{
  const base=newTradeGame(0,14);
  expect(sellCargo(base)).toBe(base);
  expect(moveTrader(base,0)).toBe(base);
  expect(routeFuel(0,3)).toBe(3);
  expect(routeFuel(0,2)).toBe(2);
  const bought=buyCargo(base,2);
  expect(cargoCount(bought)).toBe(2);
  expect(bought.credits).toBe(base.credits-2*base.buyPrices[0]);
  expect(buyCargo(bought,2)).toBe(bought);
  expect(base.inventory).toEqual([0,0,0]);
  const delivered=moveTrader(bought,3);
  expect(delivered.fuel).toBe(base.fuel-3);
  const sold=sellCargo(delivered);
  expect(cargoCount(sold)).toBe(0);
  expect(netProfit(sold)).toBe(2*(base.sellPrices[0]-base.buyPrices[0]));
 });
 it("vence todos os níveis com operações honestas e limite de turnos",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<40;seed++){
   let g=newTradeGame(d,seed);
   for(let trip=0;trip<3&&g.phase==="playing";trip++){
    g=buyCargo(g,2);g=buyCargo(g,1);
    g=moveTrader(g,3);g=sellCargo(g);
    if(g.phase==="playing")g=moveTrader(g,0);
   }
   expect(g.phase).toBe("won");
   expect(g.score).toBeGreaterThan(0);
   expect(netProfit(g)).toBeGreaterThanOrEqual(g.goal);
   expect(g.turns).toBeLessThanOrEqual(g.maxTurns);
   expect(moveTrader(g,0)).toBe(g);
  }
 });
 it("impede ações que ultrapassam combustível ou recursos e permite reiniciar",()=>{
  const start=newTradeGame(2,11);
  let g=moveTrader(start,3);
  g=moveTrader(g,1);
  g=moveTrader(g,0);
  g=moveTrader(g,3);
  expect(g.fuel).toBe(5);
  expect(refuel(g)).toBe(g);
  expect(sellCargo(g)).toBe(g);
  const a=restartTrade(g);
  expect(a).toEqual(start);
  expect(nextTrade(g).seed).not.toBe(g.seed);
 });
 it("recusa parâmetros inválidos",()=>{
  expect(()=>newTradeGame(7 as never)).toThrow();
  expect(()=>newTradeGame(0,-1)).toThrow();
 });
});