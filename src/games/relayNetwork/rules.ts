export type Difficulty=0|1|2;
export type RelayGame=Readonly<{
 difficulty:Difficulty;seed:number;size:number;base:number;slots:readonly number[];
 devices:readonly number[];selected:readonly number[];budget:number;energy:number;
 history:readonly (readonly number[])[];moves:number;phase:"playing"|"won";score:number;
}>;
export type RelayMetrics=Readonly<{linked:readonly number[];covered:readonly number[];unlinked:number;energyUsed:number}>;
const solutions=[[2,12,22],[2,14,26,28],[2,16,30,32,46]] as const;
const deviceSets=[[14,24],[16,34,35],[18,34,47,48]] as const;
const seedNext=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
const manhattan=(size:number,a:number,b:number)=>Math.abs(Math.floor(a/size)-Math.floor(b/size))+Math.abs(a%size-b%size);
export function createRelayGame(difficulty:Difficulty=0,seed=39):RelayGame{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Parâmetros inválidos");
 const size=5+difficulty,devices:number[]=[...deviceSets[difficulty]],primary:number[]=[...solutions[difficulty]];
 const pool=Array.from({length:size*size},(_,i)=>i).filter(i=>i!==0&&!devices.includes(i)&&!primary.includes(i));
 let rng=seed>>>0;
 for(let i=pool.length-1;i>0;i--){rng=seedNext(rng);const j=rng%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
 const slots=[...primary,...pool.slice(0,5)].sort((a,b)=>a-b);
 return {difficulty,seed,size,base:0,slots,devices,selected:[],budget:primary.length,
  energy:primary.length*2,history:[],moves:0,phase:"playing",score:0};
}
export function relayMetrics(g:RelayGame):RelayMetrics{
 const linked=new Set<number>(),queue=[g.base],visited=new Set<number>([g.base]);
 while(queue.length){
  const current=queue.shift()!;
  for(const candidate of g.selected){
   if(!visited.has(candidate)&&manhattan(g.size,current,candidate)<=3){
    visited.add(candidate);linked.add(candidate);queue.push(candidate);
   }
  }
 }
 const online=[...linked];
 const covered=g.devices.filter(device=>online.some(relay=>manhattan(g.size,device,relay)<=2));
 return {linked:online,covered,unlinked:g.selected.length-linked.size,energyUsed:g.selected.length*2};
}
export function networkSolved(g:RelayGame):boolean{
 const m=relayMetrics(g);
 return m.covered.length===g.devices.length&&m.unlinked===0&&g.selected.length<=g.budget&&m.energyUsed<=g.energy;
}
export function toggleRelay(g:RelayGame,slot:number):RelayGame{
 if(g.phase!=="playing"||!Number.isInteger(slot)||!g.slots.includes(slot))return g;
 const has=g.selected.includes(slot);
 if(!has&&g.selected.length>=g.budget)return g;
 const selected=has?g.selected.filter(c=>c!==slot):[...g.selected,slot].sort((a,b)=>a-b);
 const next:RelayGame={...g,selected,moves:g.moves+1,history:[...g.history,g.selected],phase:"playing",score:0};
 if(!networkSolved(next))return next;
 return {...next,phase:"won",score:Math.max(100,1600+g.difficulty*180-next.moves*30-relayMetrics(next).energyUsed*15)};
}
export function undoRelay(g:RelayGame):RelayGame{
 if(!g.history.length)return g;
 return {...g,selected:g.history[g.history.length-1],history:g.history.slice(0,-1),
  moves:Math.max(0,g.moves-1),phase:"playing",score:0};
}
export const solutionRelays=(difficulty:Difficulty):readonly number[]=>solutions[difficulty];
export const restartRelay=(g:RelayGame)=>createRelayGame(g.difficulty,g.seed);
export const nextRelay=(g:RelayGame)=>createRelayGame(g.difficulty,seedNext(g.seed));
