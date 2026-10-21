export type Difficulty=0|1|2;
export type CubeViews=Readonly<{top:readonly number[];front:readonly number[];side:readonly number[]}>;
export type HiddenCubes=Readonly<{
 difficulty:Difficulty;seed:number;size:number;limit:number;target:CubeViews;
 heights:readonly number[];history:readonly (readonly number[])[];moves:number;
 phase:"playing"|"won";score:number;
}>;
const next=(seed:number)=>(Math.imul(seed,1664525)+1013904223)>>>0;
export function getCubeViews(heights:readonly number[],size:number):CubeViews {
 if(!Number.isInteger(size)||size<2||heights.length!==size*size||heights.some(n=>!Number.isInteger(n)||n<0))
  throw Error("Grade de cubos inválida");
 const top=heights.map(height=>height>0?1:0);
 const front=Array.from({length:size},(_,col)=>Math.max(...Array.from({length:size},(_,row)=>heights[row*size+col])));
 const side=Array.from({length:size},(_,row)=>Math.max(...heights.slice(row*size,(row+1)*size)));
 return {top,front,side};
}
/** A valid hidden construction supplies a constructive solution, never a random unsolvable silhouette. */
export function generateCubeHeights(difficulty:Difficulty,seed:number):number[] {
 const size=3+difficulty,limit=2+difficulty;
 let rng=seed>>>0;
 return Array.from({length:size*size},(_,index)=>{
  const row=Math.floor(index/size),col=index%size;
  rng=next(rng);
  if(row!==col && (rng>>>24)%5===0)return 0;
  return 1+((rng>>>15)%limit);
 });
}
export function newHiddenCubes(difficulty:Difficulty=0,seed=71):HiddenCubes {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const size=3+difficulty,limit=2+difficulty;
 const target=getCubeViews(generateCubeHeights(difficulty,seed),size);
 return {difficulty,seed,size,limit,target,heights:Array(size*size).fill(0) as number[],
  history:[],moves:0,phase:"playing",score:0};
}
export function cubesSolved(g:HiddenCubes):boolean {
 const views=getCubeViews(g.heights,g.size);
 return views.top.every((value,i)=>value===g.target.top[i]) &&
  views.front.every((value,i)=>value===g.target.front[i]) &&
  views.side.every((value,i)=>value===g.target.side[i]);
}
export function changeCube(g:HiddenCubes,index:number,delta:-1|1=1):HiddenCubes {
 if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.heights.length||!(delta===1||delta===-1))return g;
 const height=(g.heights[index]+delta+g.limit+1)%(g.limit+1);
 const heights=g.heights.map((h,i)=>i===index?height:h);
 const draft={...g,heights,history:[...g.history,g.heights],moves:g.moves+1};
 const won=cubesSolved(draft);
 return {...draft,phase:won?"won":"playing",score:won?Math.max(100,1500+g.difficulty*160-draft.moves*14):0};
}
export function undoCube(g:HiddenCubes):HiddenCubes {
 if(!g.history.length)return g;
 return {...g,heights:g.history[g.history.length-1],history:g.history.slice(0,-1),
  moves:Math.max(0,g.moves-1),phase:"playing",score:0};
}
export const restartCubes=(g:HiddenCubes)=>newHiddenCubes(g.difficulty,g.seed);
export const nextCubes=(g:HiddenCubes)=>newHiddenCubes(g.difficulty,next(g.seed));
