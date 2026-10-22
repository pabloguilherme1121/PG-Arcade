export type Difficulty=0|1|2;
export type ClockGame=Readonly<{
 difficulty:Difficulty;seed:number;periods:readonly number[];target:number;time:number;
 moves:number;phase:"playing"|"won";score:number;history:readonly number[];
}>;
const PERIODS=[3,4,5,7,8] as const;
const nextSeed=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export const pointerPhase=(period:number,time:number,target:number)=>{
 if(!Number.isInteger(period)||period<=1)throw Error("Ciclo inválido");
 return ((time-target)%period+period)%period;
};
export function createClocks(difficulty:Difficulty=0,seed=29):ClockGame {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Configuração inválida");
 const periods=PERIODS.slice(0,3+difficulty),limit=[58,150,380][difficulty];
 const target=5+(nextSeed(seed)%(limit-4));
 return {difficulty,seed,periods,target,time:0,moves:0,phase:"playing",score:0,history:[]};
}
export const aligned=(g:ClockGame)=>g.periods.every(period=>pointerPhase(period,g.time,g.target)===0);
export function moveClocks(g:ClockGame,delta:-1|1|5|10):ClockGame {
 if(g.phase!=="playing"||![-1,1,5,10].includes(delta))return g;
 const time=g.time+delta;
 if(time<0||time>840)return g;
 const draft={...g,time,moves:g.moves+1,history:[...g.history,g.time]};
 const won=aligned(draft);
 return {...draft,phase:won?"won":"playing",score:won?Math.max(100,1400+g.difficulty*120-draft.moves*20-time*2):0};
}
export function undoClocks(g:ClockGame):ClockGame {
 if(!g.history.length)return g;
 return {...g,time:g.history[g.history.length-1],history:g.history.slice(0,-1),moves:g.moves-1,phase:"playing",score:0};
}
export const resetClocks=(g:ClockGame)=>createClocks(g.difficulty,g.seed);
export const nextClocks=(g:ClockGame)=>createClocks(g.difficulty,nextSeed(g.seed));
