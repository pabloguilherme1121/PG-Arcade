export type Difficulty=0|1|2;
export type IrrigationGame=Readonly<{
 difficulty:Difficulty;seed:number;size:number;source:number;fields:readonly number[];
 demands:readonly number[];supply:number;pipeBudget:number;edges:readonly string[];
 selected:number|null;history:readonly (readonly string[])[];moves:number;
 phase:"playing"|"won";score:number;
}>;
export type FlowMetrics=Readonly<{watered:number;need:number;leaks:number;used:number;available:number;reachable:readonly number[]}>;
const fieldPositions=[[5,9],[6,12,17],[7,14,26,33]] as const;
const witness=[
 [[0,1],[1,5],[5,9]],
 [[0,1],[1,6],[6,11],[11,12],[12,17]],
 [[0,1],[1,7],[7,13],[13,14],[14,20],[20,26],[26,27],[27,33]]
] as const;
const next=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function edgeKey(a:number,b:number):string{return Math.min(a,b)+"-"+Math.max(a,b)}
export function areNeighbors(size:number,a:number,b:number):boolean{
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=size*size||b>=size*size)return false;
 return (Math.floor(a/size)===Math.floor(b/size)&&Math.abs(a-b)===1)||Math.abs(a-b)===size;
}
export function newIrrigationGame(difficulty:Difficulty=0,seed=23):IrrigationGame{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Parâmetros inválidos");
 const fields=[...fieldPositions[difficulty]],demands=fields.map((_,i)=>1+((seed+i)%2));
 return {difficulty,seed,size:4+difficulty,source:0,fields,demands,supply:[6,9,11][difficulty],
  pipeBudget:[3,5,8][difficulty],edges:[],selected:null,history:[],moves:0,phase:"playing",score:0};
}
export function measureFlow(g:IrrigationGame):FlowMetrics {
 const network=new Map<number,number[]>();
 for(const key of g.edges){
  const parts=key.split("-").map(Number),a=parts[0],b=parts[1];
  if(!areNeighbors(g.size,a,b))continue;
  network.set(a,[...(network.get(a)??[]),b]);
  network.set(b,[...(network.get(b)??[]),a]);
 }
 const visited=new Set<number>([g.source]),queue=[g.source];
 while(queue.length){
  const cell=queue.shift()!;
  for(const next of network.get(cell)??[]){
   if(!visited.has(next)){visited.add(next);queue.push(next)}
  }
 }
 const reaches=[...visited];
 const leaks=reaches.filter(cell=>cell!==g.source&&!g.fields.includes(cell)&&(network.get(cell)?.length??0)===1).length;
 const watered=g.fields.filter(i=>visited.has(i)).length;
 const need=g.fields.reduce((n,index,i)=>n+(visited.has(index)?g.demands[i]:0),0);
 const used=need+leaks;
 return {watered,need,leaks,used,available:Math.max(0,g.supply-used),reachable:reaches};
}
export const irrigationSolved=(g:IrrigationGame)=>{
 const m=measureFlow(g);
 return m.watered===g.fields.length&&m.leaks===0&&m.used<=g.supply&&g.edges.length<=g.pipeBudget;
};
export function togglePipe(g:IrrigationGame,a:number,b:number):IrrigationGame{
 if(g.phase!=="playing"||!areNeighbors(g.size,a,b))return g;
 const key=edgeKey(a,b),exists=g.edges.includes(key);
 if(!exists&&g.edges.length>=g.pipeBudget)return g;
 const edges=exists?g.edges.filter(e=>e!==key):[...g.edges,key].sort();
 const candidate:IrrigationGame={...g,edges,selected:null,moves:g.moves+1,
  history:[...g.history,g.edges],phase:"playing",score:0};
 return irrigationSolved(candidate)?{...candidate,phase:"won",
  score:Math.max(100,1500+g.difficulty*160-candidate.moves*25-measureFlow(candidate).used*10)}:candidate;
}
export function tapIrrigationCell(g:IrrigationGame,index:number):IrrigationGame{
 if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.size*g.size)return g;
 if(g.selected===null)return {...g,selected:index};
 if(g.selected===index)return {...g,selected:null};
 if(!areNeighbors(g.size,g.selected,index))return {...g,selected:index};
 return togglePipe(g,g.selected,index);
}
export function undoIrrigation(g:IrrigationGame):IrrigationGame{
 if(!g.history.length)return g;
 return {...g,edges:g.history[g.history.length-1],history:g.history.slice(0,-1),
  moves:Math.max(0,g.moves-1),selected:null,phase:"playing",score:0};
}
export function solutionPipes(difficulty:Difficulty):readonly (readonly [number,number])[]{
 return witness[difficulty];
}
export const resetIrrigation=(g:IrrigationGame)=>newIrrigationGame(g.difficulty,g.seed);
export const nextIrrigation=(g:IrrigationGame)=>newIrrigationGame(g.difficulty,next(g.seed));
