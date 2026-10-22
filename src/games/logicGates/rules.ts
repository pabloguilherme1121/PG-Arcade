export type Difficulty=0|1|2;
export type Operator=0|1|2|3;
export type CircuitSnapshot=Readonly<{gates:readonly Operator[];invert:boolean}>;
export type LogicGame=Readonly<{
 difficulty:Difficulty;seed:number;gates:readonly Operator[];invert:boolean;
 target:readonly boolean[];history:readonly CircuitSnapshot[];moves:number;
 phase:"playing"|"won";score:number;
}>;
export const operators=["E","OU","XOU","NÃO-E"] as const;
const next=(seed:number)=>(Math.imul(seed,1664525)+1013904223)>>>0;
export function applyGate(op:Operator,a:boolean,b:boolean):boolean {
 switch(op){
  case 0:return a&&b;
  case 1:return a||b;
  case 2:return a!==b;
  case 3:return !(a&&b);
  default:throw Error("Porta lógica inválida");
 }
}
export function evaluateCircuit(gates:readonly Operator[],invert:boolean,a:boolean,b:boolean):boolean {
 if(!gates.length)throw Error("Circuito sem portas");
 let output=applyGate(gates[0],a,b);
 for(let i=1;i<gates.length;i++)output=applyGate(gates[i],output,i%2===1?a:b);
 return invert?!output:output;
}
export function getTruthTable(gates:readonly Operator[],invert:boolean):boolean[]{
 return [[false,false],[false,true],[true,false],[true,true]].map(([a,b])=>evaluateCircuit(gates,invert,a,b));
}
export function generatedSolution(difficulty:Difficulty,seed:number):CircuitSnapshot {
 const count=1+difficulty;let rng=seed>>>0;
 const gates:Array<Operator>=Array.from({length:count},()=>{
  rng=next(rng);
  return ((rng>>>17)%4) as Operator;
 });
 rng=next(rng);let invert=(rng&8)!==0;
 const initial=Array(count).fill(0) as Operator[];
 if(getTruthTable(gates,invert).every((v,i)=>v===getTruthTable(initial,false)[i]))invert=!invert;
 return {gates,invert};
}
export function newLogicGame(difficulty:Difficulty=0,seed=61):LogicGame {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const solution=generatedSolution(difficulty,seed);
 return {difficulty,seed,gates:Array(1+difficulty).fill(0) as Operator[],invert:false,
  target:getTruthTable(solution.gates,solution.invert),history:[],moves:0,
  phase:"playing",score:0};
}
export function matchesCircuit(game:LogicGame):boolean {
 const output=getTruthTable(game.gates,game.invert);
 return output.every((v,i)=>v===game.target[i]);
}
function applyChange(game:LogicGame,gates:readonly Operator[],invert:boolean):LogicGame {
 const draft={...game,gates,invert,moves:game.moves+1,history:[...game.history,{gates:game.gates,invert:game.invert}]};
 const won=matchesCircuit(draft);
 return {...draft,phase:won?"won":"playing",score:won?Math.max(100,1200+game.difficulty*200-draft.moves*25):0};
}
export function cycleGate(game:LogicGame,index:number):LogicGame {
 if(game.phase!=="playing"||!Number.isInteger(index)||index<0||index>=game.gates.length)return game;
 return applyChange(game,game.gates.map((op,i)=>i===index?((op+1)%4 as Operator):op),game.invert);
}
export function toggleOutput(game:LogicGame):LogicGame {
 return game.phase==="playing"?applyChange(game,game.gates,!game.invert):game;
}
export function undoLogic(game:LogicGame):LogicGame {
 if(!game.history.length)return game;
 const previous=game.history[game.history.length-1];
 return {...game,...previous,history:game.history.slice(0,-1),moves:Math.max(0,game.moves-1),phase:"playing",score:0};
}
export const restartLogic=(game:LogicGame)=>newLogicGame(game.difficulty,game.seed);
export const nextLogic=(game:LogicGame)=>newLogicGame(game.difficulty,next(game.seed));
