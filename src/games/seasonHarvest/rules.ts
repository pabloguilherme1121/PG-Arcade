export type Difficulty=0|1|2;
export type Crop=0|1|2;
export type Weather="seca"|"amena"|"chuvosa";
export type HarvestSnapshot=Readonly<{soil:readonly number[];water:number;points:number;season:number;selectedPlot:number;selectedCrop:Crop}>;
export type HarvestGame=Readonly<{
 difficulty:Difficulty;seed:number;soil:readonly number[];water:number;maxWater:number;points:number;
 season:number;maxSeasons:number;goal:number;selectedPlot:number;selectedCrop:Crop;
 history:readonly HarvestSnapshot[];log:readonly string[];phase:"playing"|"won"|"lost";score:number;
}>;
export const cropNames=["Leguminosas","Raízes","Cereais"] as const;
const nextSeed=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function forecast(seed:number,season:number):Weather{
 return ((seed+season)%3)===0?"seca":((seed+season)%3)===1?"amena":"chuvosa";
}
export const waterCost=(crop:Crop,weather:Weather)=>crop===2?(weather==="seca"?3:2):1;
export const fertilityCost=(crop:Crop)=>crop===0?-1:crop===1?1:2;
export function cropYield(crop:Crop,weather:Weather):number{
 return crop===0?2:crop===1?4:weather==="seca"?8:weather==="chuvosa"?10:9;
}
export function newHarvestGame(difficulty:Difficulty=0,seed=43):HarvestGame{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 return {difficulty,seed,soil:[2,2,2,2],water:[12,14,16][difficulty],
  maxWater:[12,14,16][difficulty],points:0,season:0,
  maxSeasons:[6,7,8][difficulty],goal:[24,30,38][difficulty],
  selectedPlot:0,selectedCrop:2,history:[],log:[],phase:"playing",score:0};
}
export function selectPlot(game:HarvestGame,index:number):HarvestGame{
 return game.phase==="playing"&&Number.isInteger(index)&&index>=0&&index<4?
  {...game,selectedPlot:index}:game;
}
export function selectCrop(game:HarvestGame,crop:Crop):HarvestGame{
 return game.phase==="playing"&&[0,1,2].includes(crop)?{...game,selectedCrop:crop}:game;
}
export function canHarvest(game:HarvestGame):boolean{
 const weather=forecast(game.seed,game.season);
 return game.phase==="playing"&&game.water>=waterCost(game.selectedCrop,weather)&&
  game.soil[game.selectedPlot]>=fertilityCost(game.selectedCrop);
}
function snapshot(game:HarvestGame):HarvestSnapshot{
 return {soil:game.soil,water:game.water,points:game.points,season:game.season,
  selectedPlot:game.selectedPlot,selectedCrop:game.selectedCrop};
}
function finish(game:HarvestGame,change:Partial<HarvestGame>,message:string):HarvestGame{
 const season=game.season+1;
 const points=change.points??game.points;
 const won=points>=game.goal;
 const lost=!won&&season>=game.maxSeasons;
 return {...game,...change,season,history:[...game.history,snapshot(game)],
  log:[...game.log,message],phase:won?"won":lost?"lost":"playing",
  score:won?Math.max(100,1500+game.difficulty*180-(season*55)+(change.water??game.water)*4):0};
}
export function harvestPlot(game:HarvestGame):HarvestGame{
 if(!canHarvest(game))return game;
 const crop=game.selectedCrop,weather=forecast(game.seed,game.season);
 const cost=fertilityCost(crop),reward=cropYield(crop,weather);
 const soil=game.soil.map((fertility,index)=>index!==game.selectedPlot?fertility:
  Math.max(0,Math.min(3,fertility-cost)));
 return finish(game,{soil,points:game.points+reward,water:game.water-waterCost(crop,weather)},
  `Estação ${game.season+1}: ${cropNames[crop]} no canteiro ${game.selectedPlot+1} (+${reward} pontos)`);
}
export function restSeason(game:HarvestGame):HarvestGame{
 if(game.phase!=="playing")return game;
 const weather=forecast(game.seed,game.season);
 const soil=game.soil.map(fertility=>Math.min(3,fertility+1));
 const water=Math.min(game.maxWater,game.water+(weather==="chuvosa"?2:1));
 return finish(game,{soil,water},
  `Estação ${game.season+1}: descanso do solo (+1 fertilidade, +${water-game.water} água)`);
}
export function undoHarvest(game:HarvestGame):HarvestGame{
 if(!game.history.length)return game;
 const prior=game.history[game.history.length-1];
 return {...game,...prior,history:game.history.slice(0,-1),log:game.log.slice(0,-1),
  phase:"playing",score:0};
}
export const resetHarvest=(game:HarvestGame)=>newHarvestGame(game.difficulty,game.seed);
export const nextHarvest=(game:HarvestGame)=>newHarvestGame(game.difficulty,nextSeed(game.seed));
