export type Difficulty=0|1|2;
export type Rotation=0|1|2|3;
export type ShadowVault=Readonly<{
 difficulty:Difficulty;seed:number;orientations:readonly Rotation[];solution:readonly Rotation[];
 target:readonly number[];moves:number;history:readonly (readonly Rotation[])[];
 phase:"playing"|"won";score:number;
}>;
const patterns=[
 ["1100","0110","0010","0000"],
 ["0110","0010","0011","0000"],
 ["0010","0111","0010","0000"],
 ["1100","1010","1000","0000"],
 ["1000","1110","0100","0000"]
] as const;
const next=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function rotateShadow(index:number,orientation:Rotation):number[] {
 if(!Number.isInteger(index)||index<0||index>=patterns.length||![0,1,2,3].includes(orientation))throw Error("Veneziana inválida");
 const result=Array(16).fill(0) as number[];
 for(let y=0;y<4;y++)for(let x=0;x<4;x++)if(patterns[index][y][x]==="1"){
  let a=x,b=y;for(let k=0;k<orientation;k++){const xx=3-b;b=a;a=xx;}
  result[b*4+a]=1;
 }
 return result;
}
/** Filtros alternados cancelam a sombra onde há sobreposição; paridade é visível e determinística. */
export function composeShadows(orientations:readonly Rotation[]):number[]{
 const mask=Array(16).fill(0) as number[];
 orientations.forEach((r,i)=>rotateShadow(i,r).forEach((value,k)=>{mask[k]^=value;}));
 return mask;
}
export function createShadowVault(difficulty:Difficulty=0,seed=19):ShadowVault {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Configuração inválida");
 let n=seed;const count=3+difficulty;
 const solution:Array<Rotation>=Array.from({length:count},()=>{n=next(n);return (n%4) as Rotation;});
 const initial=Array(count).fill(0) as Rotation[];
 let target=composeShadows(solution);
 for(let tries=0;tries<4&&(target.every(x=>x===0)||target.every((v,i)=>v===composeShadows(initial)[i]));tries++){
  solution[0]=((solution[0]+1)%4) as Rotation;target=composeShadows(solution);
 }
 if(target.every((v,i)=>v===composeShadows(initial)[i]))throw Error("Enigma trivial");
 return {difficulty,seed,orientations:initial,solution,target,moves:0,history:[],phase:"playing",score:0};
}
export function turnShutter(g:ShadowVault,index:number):ShadowVault {
 if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.orientations.length)return g;
 const orientations=g.orientations.map((r,i)=>i===index?((r+1)%4 as Rotation):r);
 const moves=g.moves+1,won=composeShadows(orientations).every((v,i)=>v===g.target[i]);
 return {...g,orientations,moves,history:[...g.history,g.orientations],phase:won?"won":"playing",
  score:won?Math.max(100,1100+g.difficulty*150-moves*20):0};
}
export function undoShutter(g:ShadowVault):ShadowVault {
 if(!g.history.length)return g;
 return {...g,orientations:g.history[g.history.length-1],history:g.history.slice(0,-1),moves:g.moves-1,phase:"playing",score:0};
}
export const restartShadow=(g:ShadowVault)=>createShadowVault(g.difficulty,g.seed);
export const nextShadow=(g:ShadowVault)=>createShadowVault(g.difficulty,next(g.seed));
