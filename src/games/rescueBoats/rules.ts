export type Difficulty=0|1|2;
export type RescueSite=0|1|2|3|4;
export type Tide="baixa"|"subindo"|"alta";
export type RescueEvent=Readonly<{turn:number;message:string;fuel:number;delivered:number}>;
export type RescueGame=Readonly<{
 difficulty:Difficulty;seed:number;site:RescueSite;active:readonly RescueSite[];remaining:readonly RescueSite[];
 onboard:readonly RescueSite[];delivered:number;fuel:number;maxFuel:number;depot:number;
 turns:number;maxTurns:number;phase:"playing"|"won"|"lost";score:number;events:readonly RescueEvent[];
}>;
export const siteNames=["Base Costeira","Ponta Verde","Ilha Azul","Atol Dourado","Recifes"] as const;
const next=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function currentTide(game:Pick<RescueGame,"seed"|"turns">):Tide{
 return (game.seed+game.turns)%3===0?"baixa":(game.seed+game.turns)%3===1?"subindo":"alta";
}
export function sailingFuel(game:Pick<RescueGame,"seed"|"turns"|"site">,destination:RescueSite):number|null{
 if(![0,1,2,3,4].includes(destination)||destination===game.site)return null;
 const distance=game.site===0||destination===0?2+(Math.max(game.site,destination)%2):2+Math.abs(game.site-destination);
 return distance+(currentTide(game)==="alta"?1:0);
}
export function newRescueGame(difficulty:Difficulty=0,seed=21):RescueGame{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Parâmetros inválidos");
 let rng=seed>>>0;
 const islands:RescueSite[]=[1,2,3,4];
 for(let i=3;i>0;i--){rng=next(rng);const j=rng%(i+1);[islands[i],islands[j]]=[islands[j],islands[i]];}
 const active=islands.slice(0,2+difficulty).sort((a,b)=>a-b);
 return {difficulty,seed,site:0,active,remaining:active,onboard:[],delivered:0,fuel:12,maxFuel:12,
  depot:[22,32,42][difficulty],turns:0,maxTurns:[16,22,28][difficulty],
  phase:"playing",score:0,events:[]};
}
function record(game:RescueGame,change:Partial<RescueGame>,message:string):RescueGame{
 const turns=game.turns+1,fuel=change.fuel??game.fuel,delivered=change.delivered??game.delivered;
 const won=delivered===game.active.length;
 const lost=!won&&turns>=game.maxTurns;
 return {...game,...change,turns,phase:won?"won":lost?"lost":"playing",
  score:won?Math.max(100,1450+game.difficulty*200-turns*35+fuel*10):0,
  events:[...game.events,{turn:turns,message,fuel,delivered}]};
}
export function sail(game:RescueGame,destination:RescueSite):RescueGame{
 if(game.phase!=="playing")return game;
 const fuelCost=sailingFuel(game,destination);
 if(fuelCost===null||fuelCost>game.fuel)return game;
 return record(game,{site:destination,fuel:game.fuel-fuelCost},
  `Navegou até ${siteNames[destination]} e gastou ${fuelCost} de combustível`);
}
export function rescueSurvivor(game:RescueGame):RescueGame{
 if(game.phase!=="playing"||game.site===0||!game.remaining.includes(game.site)||game.onboard.length>=2)return game;
 return record(game,{remaining:game.remaining.filter(site=>site!==game.site),
  onboard:[...game.onboard,game.site]},`Resgatou uma pessoa em ${siteNames[game.site]}`);
}
export function disembark(game:RescueGame):RescueGame{
 if(game.phase!=="playing"||game.site!==0||game.onboard.length===0)return game;
 return record(game,{delivered:game.delivered+game.onboard.length,onboard:[]},
  `Desembarcou ${game.onboard.length} pessoa(s) na base`);
}
export function refuelBoat(game:RescueGame):RescueGame{
 if(game.phase!=="playing"||game.site!==0||game.fuel>=game.maxFuel||game.depot<=0)return game;
 const volume=Math.min(game.maxFuel-game.fuel,game.depot);
 return record(game,{fuel:game.fuel+volume,depot:game.depot-volume},
  `Abasteceu ${volume} unidades de combustível`);
}
export function waitForTide(game:RescueGame):RescueGame{
 return game.phase==="playing"?record(game,{},"Aguardou uma mudança de maré"):game;
}
export const restartRescue=(game:RescueGame)=>newRescueGame(game.difficulty,game.seed);
export const nextRescue=(game:RescueGame)=>newRescueGame(game.difficulty,next(game.seed));
