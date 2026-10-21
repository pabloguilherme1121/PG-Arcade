export type Difficulty=0|1|2;
export type WeightKind="heavy"|"light";
export type Pan=-1|0|1;
export type Weighing=Readonly<{left:readonly number[];right:readonly number[];result:"left"|"right"|"equal"}>;
export type BalanceGame=Readonly<{
 difficulty:Difficulty;seed:number;count:number;fake:number;fakeKind:WeightKind;
 placements:readonly Pan[];history:readonly Weighing[];maxWeighings:number;
 guessCoin:number|null;guessKind:WeightKind;wrongGuesses:number;phase:"playing"|"won"|"lost";score:number;
}>;
const nextSeed=(seed:number)=>(Math.imul(seed,1664525)+1013904223)>>>0;
export function newBalanceGame(difficulty:Difficulty=0,seed=37):BalanceGame {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const count=[4,6,8][difficulty];
 const fake=nextSeed(seed)%count;
 const fakeKind=(nextSeed(nextSeed(seed))&1)===0?"heavy":"light";
 return {difficulty,seed,count,fake,fakeKind,placements:Array(count).fill(0) as Pan[],
  history:[],maxWeighings:[3,4,5][difficulty],guessCoin:null,guessKind:"heavy",wrongGuesses:0,phase:"playing",score:0};
}
export function assignPan(g:BalanceGame,index:number):BalanceGame {
 if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.count)return g;
 return {...g,placements:g.placements.map((p,i)=>i!==index?p:p===0?-1:p===-1?1:0) as Pan[]};
}
export function canWeigh(g:BalanceGame):boolean {
 const left=g.placements.filter(p=>p===-1).length;
 const right=g.placements.filter(p=>p===1).length;
 return g.phase==="playing"&&g.history.length<g.maxWeighings&&left>0&&left===right;
}
export function weighCoins(g:BalanceGame):BalanceGame {
 if(!canWeigh(g))return g;
 const left:number[]=[],right:number[]=[];
 g.placements.forEach((p,i)=>{if(p===-1)left.push(i);if(p===1)right.push(i);});
 const weight=(id:number)=>10+(id===g.fake?(g.fakeKind==="heavy"?1:-1):0);
 const a=left.reduce((n,i)=>n+weight(i),0),b=right.reduce((n,i)=>n+weight(i),0);
 const result=a>b?"left":a<b?"right":"equal";
 return {...g,history:[...g.history,{left,right,result}],placements:Array(g.count).fill(0) as Pan[]};
}
export function chooseSuspect(g:BalanceGame,index:number|null):BalanceGame {
 if(g.phase!=="playing"||!(index===null||(Number.isInteger(index)&&index>=0&&index<g.count)))return g;
 return {...g,guessCoin:index};
}
export function chooseWeight(g:BalanceGame,kind:WeightKind):BalanceGame {
 return g.phase==="playing"&&(kind==="heavy"||kind==="light")?{...g,guessKind:kind}:g;
}
export function submitSuspicion(g:BalanceGame):BalanceGame {
 if(g.phase!=="playing"||g.guessCoin===null)return g;
 const won=g.guessCoin===g.fake&&g.guessKind===g.fakeKind;
 const wrongGuesses=g.wrongGuesses+(won?0:1);
 return {...g,wrongGuesses,phase:won?"won":wrongGuesses>=2?"lost":"playing",
  score:won?Math.max(100,1200+g.difficulty*140-g.history.length*100-g.wrongGuesses*200):0};
}
export const restartBalance=(g:BalanceGame)=>newBalanceGame(g.difficulty,g.seed);
export const nextBalance=(g:BalanceGame)=>newBalanceGame(g.difficulty,nextSeed(g.seed));
