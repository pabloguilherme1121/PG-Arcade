export type Difficulty = 0 | 1 | 2;
export type SwitchMode = 0 | 1 | 2;
export type RailState = Readonly<{
  difficulty: Difficulty; seed: number; switches: readonly SwitchMode[]; target: readonly number[];
  attempts: number; edits: number; phase: "planning" | "won";
  lastRoute: readonly number[] | null; score: number;
}>;
const next = (n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export const modeNames = ["Reto", "Trocar trilhos 1 e 2", "Trocar trilhos 2 e 3"] as const;
export function routeTrains(switches: readonly SwitchMode[]): number[] {
 const lanes=[0,1,2];
 for(const mode of switches){
  if(mode!==0&&mode!==1&&mode!==2)throw Error("Desvio inválido");
  const a=mode-1,b=mode;
  if(mode){for(let i=0;i<3;i++){if(lanes[i]===a)lanes[i]=b;else if(lanes[i]===b)lanes[i]=a;}}
 }
 return lanes;
}
export function createRails(difficulty:Difficulty=0,seed=31):RailState {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Parâmetros inválidos");
 const count=[3,4,5][difficulty];
 let random=seed,secret:SwitchMode[]=Array.from({length:count},()=>{
  random=next(random);return (random%3) as SwitchMode;
 });
 if(routeTrains(secret).every((lane,i)=>lane===i))secret=[1,...secret.slice(1)];
 let target=routeTrains(secret);
 if(target.every((lane,i)=>lane===i)){secret=[2,1,...secret.slice(2)];target=routeTrains(secret);}
 if(target.every((lane,i)=>lane===i))throw Error("Alvo trivial");
 return {difficulty,seed,switches:Array(count).fill(0) as SwitchMode[],target,attempts:0,edits:0,phase:"planning",lastRoute:null,score:0};
}
export function changeSwitch(g:RailState,index:number):RailState {
 if(g.phase!=="planning"||!Number.isInteger(index)||index<0||index>=g.switches.length)return g;
 return {...g,switches:g.switches.map((m,i)=>i===index?((m+1)%3 as SwitchMode):m),
   edits:g.edits+1,lastRoute:null};
}
export function testRoute(g:RailState):RailState {
 if(g.phase!=="planning")return g;
 const lastRoute=routeTrains(g.switches),success=lastRoute.every((lane,i)=>lane===g.target[i]);
 const attempts=g.attempts+1;
 return {...g,lastRoute,attempts,phase:success?"won":"planning",
  score:success?Math.max(100,1100+g.difficulty*100-attempts*70-g.edits*10):0};
}
export function resetRails(g:RailState):RailState{return createRails(g.difficulty,g.seed);}
export function nextRails(g:RailState):RailState{return createRails(g.difficulty,next(g.seed));}
