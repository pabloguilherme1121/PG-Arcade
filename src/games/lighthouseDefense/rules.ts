export type Difficulty=0|1|2;
export type BeaconDefense=Readonly<{
 difficulty:Difficulty;seed:number;size:number;slots:readonly number[];routes:readonly number[];
 budget:number;radius:number;overlapLimit:number;selected:readonly number[];
 history:readonly (readonly number[])[];moves:number;phase:"playing"|"won";score:number;
}>;
const next=(x:number)=>(Math.imul(x,1664525)+1013904223)>>>0;
export function distance(size:number,a:number,b:number):number{
 if(!Number.isInteger(size)||size<3||!Number.isInteger(a)||!Number.isInteger(b)||
    a<0||b<0||a>=size*size||b>=size*size)throw Error("Casa inválida");
 return Math.abs(Math.floor(a/size)-Math.floor(b/size))+Math.abs(a%size-b%size);
}
export function coverage(g:Pick<BeaconDefense,"size"|"slots"|"selected"|"routes"|"radius">):number[]{
 return g.routes.map(cell=>g.selected.reduce((count,slot)=>
   count+(distance(g.size,g.slots[slot],cell)<=g.radius?1:0),0));
}
export function redundancy(values:readonly number[]):number{
 return values.reduce((total,coverage)=>total+Math.max(0,coverage-1),0);
}
export function missionCompleted(g:BeaconDefense):boolean{
 const counts=coverage(g);
 return counts.length>0&&counts.every(count=>count>=1)&&redundancy(counts)<=g.overlapLimit;
}
export function newBeaconDefense(difficulty:Difficulty=0,seed=43):BeaconDefense {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Dificuldade ou semente inválida");
 const size=5+2*difficulty,r=[1,Math.floor(size/2),size-2];
 const slots=r.flatMap(row=>r.map(col=>row*size+col));
 const budget=2+difficulty,radius=2;
 let rng=seed>>>0;
 const permutation=slots.map((_,i)=>i);
 for(let i=permutation.length-1;i>0;i--){rng=next(rng);const j=rng%(i+1);
  [permutation[i],permutation[j]]=[permutation[j],permutation[i]];}
 const solution=permutation.slice(0,budget);
 const routeSet=new Set<number>();
 for(const slot of solution){
  const cell=slots[slot],row=Math.floor(cell/size);
  routeSet.add(cell);
  routeSet.add(row>0?cell-size:cell+size);
 }
 const routes=[...routeSet].sort((a,b)=>a-b);
 const skeleton={difficulty,seed,size,slots,routes,budget,radius,selected:solution,overlapLimit:0,history:[],moves:0,phase:"playing" as const,score:0};
 const overlapLimit=redundancy(coverage(skeleton));
 return {...skeleton,selected:[],overlapLimit};
}
export function toggleBeacon(g:BeaconDefense,slot:number):BeaconDefense {
 if(g.phase!=="playing"||!Number.isInteger(slot)||slot<0||slot>=g.slots.length)return g;
 const selected=g.selected.includes(slot)?g.selected.filter(i=>i!==slot):
  g.selected.length>=g.budget?null:[...g.selected,slot];
 if(!selected)return g;
 const draft={...g,selected,moves:g.moves+1,history:[...g.history,g.selected]};
 const won=missionCompleted(draft);
 return {...draft,phase:won?"won":"playing",
  score:won?Math.max(100,1200+g.difficulty*160-draft.moves*25-redundancy(coverage(draft))*30):0};
}
export function undoBeacon(g:BeaconDefense):BeaconDefense {
 if(!g.history.length)return g;
 return {...g,selected:g.history[g.history.length-1],history:g.history.slice(0,-1),
  moves:Math.max(0,g.moves-1),phase:"playing",score:0};
}
export const resetBeacon=(g:BeaconDefense)=>newBeaconDefense(g.difficulty,g.seed);
export const nextBeacon=(g:BeaconDefense)=>newBeaconDefense(g.difficulty,next(g.seed));
