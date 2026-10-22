import {describe,expect,it} from "vitest";
import {canCraft,craftElement,newAlchemyGame,nextAlchemy,recipes,restartAlchemy,undoAlchemy} from "./rules";
const solutions=[[3,4,6],[4,5,7],[3,4,6,4,5,7,8]] as const;
describe("Alquimia de Elementos: elaboração com reagentes finitos",()=>{
 it("cria 300 bancadas reproduzíveis com estoque suficiente para uma receita",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<100;seed++){
   const g=newAlchemyGame(d,seed);
   expect(g).toEqual(newAlchemyGame(d,seed));
   expect(g.inventory).toHaveLength(9);
   expect(g.inventory.every(i=>Number.isInteger(i)&&i>=0)).toBe(true);
   expect(Object.keys(recipes)).toHaveLength(6);
   expect(g.goal).toBe([6,7,8][d]);
   expect(g.moves).toBe(0);
  }
 });
 it("as três dificuldades possuem solução por crafting real em 180 seeds",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<60;seed++){
   let g=newAlchemyGame(d,seed);
   for(const id of solutions[d]){
    expect(canCraft(g,id)).toBe(true);
    g=craftElement(g,id);
   }
   expect(g.phase).toBe("won");
   expect(g.inventory[g.goal]).toBeGreaterThan(0);
   expect(g.score).toBeGreaterThan(0);
   expect(g.moves).toBe(solutions[d].length);
   expect(craftElement(g,3)).toBe(g);
  }
 });
 it("consome reagentes exatos, rejeita receita impossível e desfaz sem mutar estado",()=>{
  const start=newAlchemyGame(0,17);
  expect(canCraft(start,6)).toBe(false);
  expect(craftElement(start,6)).toBe(start);
  const made=craftElement(start,3);
  expect(made.inventory[0]).toBe(start.inventory[0]-1);
  expect(made.inventory[1]).toBe(start.inventory[1]-1);
  expect(made.inventory[3]).toBe(1);
  expect(undoAlchemy(made)).toEqual(start);
  expect(start.inventory[3]).toBe(0);
  expect(restartAlchemy(made)).toEqual(start);
  expect(nextAlchemy(start).seed).not.toBe(start.seed);
 });
 it("rejeita receitas e configurações inválidas",()=>{
  const game=newAlchemyGame();
  expect(canCraft(game,9 as never)).toBe(false);
  expect(craftElement(game,9 as never)).toBe(game);
  expect(()=>newAlchemyGame(5 as never)).toThrow();
  expect(()=>newAlchemyGame(0,-1)).toThrow();
 });
});