export type Difficulty=0|1|2;
export type Pair=Readonly<{source:number;target:number;name:string}>;
export type WireGame=Readonly<{
  difficulty:Difficulty;seed:number;size:number;pairs:readonly Pair[];
  blocked:readonly number[];paths:readonly (readonly number[])[];active:number|null;
  moves:number;phase:"playing"|"won";score:number;
}>;
const nextSeed=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
const names=["Âmbar","Ciano","Jade"] as const;
export function newWireGame(difficulty:Difficulty=0,seed=17):WireGame {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const size=5+difficulty,pairs:Pair[]=[],blocked:number[]=[];
 for(let i=0;i<(difficulty===0?2:3);i++){
  const top=i*2,fromLeft=i%2===0;
  const source=top*size+(fromLeft?0:size-1);
  const target=(top+1)*size+(fromLeft?size-1:0);
  pairs.push({source,target,name:names[i]});
  for(let col=0;col<size;col++){
   if(col===target%size)continue;
   if(nextSeed(seed+i*997+col)%3===0)blocked.push((top+1)*size+col);
  }
 }
 return {difficulty,seed,size,pairs,blocked,paths:pairs.map(()=>[]),active:null,moves:0,phase:"playing",score:0};
}
export function ownerAt(g:WireGame,index:number):number|null {
 for(let i=0;i<g.pairs.length;i++){
  const pair=g.pairs[i];
  if(pair.source===index||pair.target===index||g.paths[i].includes(index))return i;
 }
 return null;
}
export function isAdjacent(size:number,a:number,b:number):boolean {
 return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<size*size&&b<size*size&&
  Math.abs(Math.floor(a/size)-Math.floor(b/size))+Math.abs(a%size-b%size)===1;
}
export function applyWire(g:WireGame,index:number):WireGame {
 if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.size*g.size||g.blocked.includes(index))return g;
 const owner=ownerAt(g,index);
 if(g.active===null){
  const pair=g.pairs.findIndex((p,i)=>p.source===index && g.paths[i].length===0);
  if(pair<0)return g;
  return {...g,active:pair,paths:g.paths.map((p,i)=>i===pair?[index]:p)};
 }
 const p=g.active,route=g.paths[p],last=route[route.length-1],target=g.pairs[p].target;
 if(index===last)return g;
 if(route.length>1&&index===route[route.length-2]){
  return {...g,paths:g.paths.map((path,i)=>i===p?route.slice(0,-1):path),moves:g.moves+1};
 }
 if(!isAdjacent(g.size,last,index))return g;
 if(owner!==null&&!(owner===p&&index===target&&!route.includes(target)))return g;
 if(route.includes(index))return g;
 const path=[...route,index],paths=g.paths.map((r,i)=>i===p?path:r);
 const finished=index===target;
 const won=finished&&paths.every((r,i)=>r.length>=2&&r[0]===g.pairs[i].source&&r[r.length-1]===g.pairs[i].target);
 const moves=g.moves+1;
 return {...g,paths,active:finished?null:p,moves,phase:won?"won":"playing",
  score:won?Math.max(100,1200+g.difficulty*160-moves*10):0};
}
export function undoWire(g:WireGame):WireGame {
 if(g.phase==="won"){
  const p=g.paths.findIndex((r,i)=>r.length>=2&&r[r.length-1]===g.pairs[i].target);
  if(p<0)return g;
  return {...g,active:p,paths:g.paths.map((r,i)=>i===p?r.slice(0,-1):r),phase:"playing",score:0,moves:Math.max(0,g.moves-1)};
 }
 if(g.active===null){
  let p=-1;for(let i=g.paths.length-1;i>=0;i--)if(g.paths[i].length>=2){p=i;break;}
  if(p<0)return g;
  return {...g,active:p,paths:g.paths.map((r,i)=>i===p?r.slice(0,-1):r),moves:Math.max(0,g.moves-1)};
 }
 const p=g.active,route=g.paths[p];
 return {...g,paths:g.paths.map((r,i)=>i===p?r.slice(0,-1):r),
  active:route.length<=1?null:p,moves:Math.max(0,g.moves-1)};
}
export const restartWire=(g:WireGame)=>newWireGame(g.difficulty,g.seed);
export const nextWire=(g:WireGame)=>newWireGame(g.difficulty,nextSeed(g.seed));
