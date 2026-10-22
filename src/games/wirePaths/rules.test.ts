import {describe,expect,it} from "vitest";
import {applyWire,isAdjacent,newWireGame,nextWire,ownerAt,restartWire,undoWire} from "./rules";
describe("Fio Condutor: roteamento com caminhos disjuntos",()=>{
 it("gera tabuleiros determinísticos em 3 dificuldades e 150 sementes",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<50;seed++){
   const g=newWireGame(difficulty,seed);
   expect(g).toEqual(newWireGame(difficulty,seed));
   expect(g.size).toBe(5+difficulty);
   expect(g.pairs).toHaveLength(difficulty===0?2:3);
   expect(g.blocked.every(pos=>ownerAt(g,pos)===null)).toBe(true);
   expect(new Set(g.pairs.flatMap(p=>[p.source,p.target])).size).toBe(g.pairs.length*2);
  }
 });
 it("cada desafio pode ser vencido com uma trilha disjunta por cor",()=>{
  for(const difficulty of [0,1,2] as const)for(let seed=0;seed<20;seed++){
   let g=newWireGame(difficulty,seed);
   for(let i=0;i<g.pairs.length;i++){
    const fromLeft=i%2===0,row=i*2,size=g.size,solution:number[]=[];
    if(fromLeft){for(let col=0;col<size;col++)solution.push(row*size+col);}
    else{for(let col=size-1;col>=0;col--)solution.push(row*size+col);}
    solution.push(g.pairs[i].target);
    for(const pos of solution)g=applyWire(g,pos);
    expect(g.paths[i]).toEqual(solution);
   }
   expect(g.phase).toBe("won");expect(g.score).toBeGreaterThan(0);
   expect(applyWire(g,0)).toBe(g);
  }
 });
 it("bloqueia saltos, cruzamentos, obstáculos e destinos alheios",()=>{
  const g=newWireGame(1,16);
  expect(isAdjacent(g.size,0,1)).toBe(true);
  expect(isAdjacent(g.size,0,g.size)).toBe(true);
  expect(isAdjacent(g.size,g.size-1,g.size)).toBe(false);
  expect(applyWire(g,1)).toBe(g);
  const start=applyWire(g,g.pairs[0].source);
  expect(applyWire(start,g.pairs[1].target)).toBe(start);
  const p=applyWire(start,g.pairs[0].source+1);
  expect(p.paths[0].length).toBe(2);
  expect(undoWire(p).paths[0]).toEqual([g.pairs[0].source]);
  expect(g.paths[0]).toEqual([]);
 });
 it("reinicia e muda semente sem perder a dificuldade",()=>{
  const g=newWireGame(2,25),started=applyWire(g,g.pairs[0].source);
  expect(restartWire(started)).toEqual(g);
  expect(nextWire(g).difficulty).toBe(2);
  expect(nextWire(g).seed).not.toBe(g.seed);
 });
 it("rejeita parâmetros inválidos",()=>{
  expect(()=>newWireGame(9 as never)).toThrow();
  expect(()=>newWireGame(0,-1)).toThrow();
 });
});