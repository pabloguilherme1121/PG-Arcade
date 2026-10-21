import {describe,expect,it} from "vitest";
import {applyGate,cycleGate,evaluateCircuit,generatedSolution,getTruthTable,matchesCircuit,newLogicGame,nextLogic,restartLogic,toggleOutput,undoLogic} from "./rules";
describe("Portas Lógicas — simulação booleana com tabela-verdade",()=>{
 it("calcula operações booleanas corretas e rejeita tipos inexistentes",()=>{
  expect([0,1,2,3].map(op=>applyGate(op as 0|1|2|3,false,false))).toEqual([false,false,false,true]);
  expect([0,1,2,3].map(op=>applyGate(op as 0|1|2|3,true,true))).toEqual([true,true,false,false]);
  expect([0,1,2,3].map(op=>applyGate(op as 0|1|2|3,true,false))).toEqual([false,true,true,true]);
  expect(()=>applyGate(4 as never,false,true)).toThrow();
  expect(()=>evaluateCircuit([],false,true,true)).toThrow();
 });
 it("gera 300 desafios determinísticos com solução completa não trivial",()=>{
  for(const d of [0,1,2] as const)for(let seed=0;seed<100;seed++){
   const game=newLogicGame(d,seed),solution=generatedSolution(d,seed);
   expect(game).toEqual(newLogicGame(d,seed));
   expect(game.gates).toHaveLength(d+1);
   expect(game.target).toEqual(getTruthTable(solution.gates,solution.invert));
   expect(game.target).toHaveLength(4);
   expect(matchesCircuit(game)).toBe(false);
  }
 });
 it("rota tipos, altera inversor, desfaz, e preserva o original",()=>{
  const game=newLogicGame(0,13),a=cycleGate(game,0),b=toggleOutput(a);
  expect(a.gates[0]).toBe(1);
  expect(b.invert).toBe(true);
  expect(undoLogic(b).gates).toEqual(a.gates);
  expect(undoLogic(b).invert).toBe(false);
  expect(game.gates[0]).toBe(0);
  expect(cycleGate(game,-1)).toBe(game);
  expect(cycleGate(game,9)).toBe(game);
  expect(restartLogic(a)).toEqual(game);
  expect(nextLogic(game).seed).not.toBe(game.seed);
 });
 it("vence reproduzindo a tabela de quatro saídas com comandos legítimos",()=>{
  for(const d of [0,1,2] as const){
   const game=newLogicGame(d,19),secret=generatedSolution(d,19);
   let playing=game;
   for(let i=0;i<secret.gates.length&&playing.phase==="playing";i++){
    for(let n=0;n<secret.gates[i]&&playing.phase==="playing";n++)playing=cycleGate(playing,i);
   }
   if(secret.invert&&playing.phase==="playing")playing=toggleOutput(playing);
   expect(playing.phase).toBe("won");
   expect(playing.score).toBeGreaterThan(0);
   expect(matchesCircuit(playing)).toBe(true);
   expect(toggleOutput(playing)).toBe(playing);
   expect(undoLogic(playing).phase).toBe("playing");
  }
 });
 it("rejeita dificuldade ou semente inválida",()=>{
  expect(()=>newLogicGame(3 as never)).toThrow();
  expect(()=>newLogicGame(0,-1)).toThrow();
 });
});