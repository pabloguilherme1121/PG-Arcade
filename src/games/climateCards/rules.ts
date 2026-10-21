export type Difficulty=0|1|2;
export type Player=0|1;
export type Climate=0|1|2;
export type DuelPhase="choosing"|"handoff"|"finished";
export type WeatherCard=Readonly<{id:number;climate:Climate;power:number}>;
export type RoundResult=Readonly<{terrain:Climate;first:number;second:number;winner:Player|null;score:readonly [number,number]}>;
export type ClimateGame=Readonly<{
 difficulty:Difficulty;seed:number;round:number;rounds:number;player:Player;
 phase:DuelPhase;hands:readonly [readonly WeatherCard[],readonly WeatherCard[]];
 used:readonly [readonly number[],readonly number[]];pending:number|null;
 scores:readonly [number,number];history:readonly RoundResult[];
}>;
export const climateNames=["Sol","Chuva","Vento"] as const;
export const terrainNames=["Planície","Floresta","Costa"] as const;
const next=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export const terrainAt=(game:Pick<ClimateGame,"seed"|"round">):Climate=>((game.seed+game.round)%3) as Climate;
export function getPower(card:WeatherCard,terrain:Climate):number{
 if(!Number.isInteger(card.power)||card.power<1||card.power>6)throw Error("Poder de carta inválido");
 return card.power+(card.climate===terrain?3:0);
}
export function newClimateGame(difficulty:Difficulty=0,seed=47):ClimateGame{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Configuração inválida");
 const makeHand=(player:Player):readonly WeatherCard[]=>{
  let rng=next(seed+player*997);
  return Array.from({length:6},(_,i)=>{
   rng=next(rng);
   return {id:i,climate:((rng>>>17)%3) as Climate,power:1+((rng>>>22)%6)};
  });
 };
 return {difficulty,seed,round:0,rounds:[3,4,5][difficulty],player:0,phase:"choosing",
  hands:[makeHand(0),makeHand(1)],used:[[],[]],pending:null,scores:[0,0],history:[]};
}
export const availableCards=(game:ClimateGame):readonly WeatherCard[]=>
 game.phase==="choosing"?game.hands[game.player].filter(c=>!game.used[game.player].includes(c.id)):[];
export function playClimateCard(game:ClimateGame,id:number):ClimateGame{
 if(game.phase!=="choosing"||!Number.isInteger(id))return game;
 const chosen=game.hands[game.player].find(c=>c.id===id);
 if(!chosen||game.used[game.player].includes(id))return game;
 if(game.player===0){
  return {...game,phase:"handoff",player:1,pending:id,used:[[...game.used[0],id],game.used[1]]};
 }
 const first=game.hands[0].find(c=>c.id===game.pending);
 if(!first)return game;
 const terrain=terrainAt(game),a=getPower(first,terrain),b=getPower(chosen,terrain);
 const winner:Player|null=a>b?0:a<b?1:null;
 const scores:[number,number]=[
  game.scores[0]+(winner===0?2:winner===null?1:0),
  game.scores[1]+(winner===1?2:winner===null?1:0)];
 const nextRound=game.round+1;
 const result:RoundResult={terrain,first:a,second:b,winner,score:scores};
 return {...game,phase:nextRound===game.rounds?"finished":"handoff",player:0,
  used:[game.used[0],[...game.used[1],id]],pending:null,
  scores,round:nextRound,history:[...game.history,result]};
}
export function nextPlayer(game:ClimateGame):ClimateGame{
 return game.phase==="handoff"?{...game,phase:"choosing"}:game;
}
export const winningPlayer=(game:ClimateGame):Player|null=>
 game.phase!=="finished"||game.scores[0]===game.scores[1]?null:game.scores[0]>game.scores[1]?0:1;
export const restartClimate=(game:ClimateGame)=>newClimateGame(game.difficulty,game.seed);
export const nextClimate=(game:ClimateGame)=>newClimateGame(game.difficulty,next(game.seed));
