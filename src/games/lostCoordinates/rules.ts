export type Difficulty=0|1|2;
export type Beacon=Readonly<{position:number;distance:number}>;
export type CoordinatesGame=Readonly<{
 difficulty:Difficulty;seed:number;size:number;target:number;beacons:readonly Beacon[];
 shown:number;hintsUsed:number;selected:number|null;attempts:number;lastDistance:number|null;
 phase:"playing"|"won"|"lost";score:number;
}>;
const next=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function manhattan(size:number,a:number,b:number):number {
 if(!Number.isInteger(size)||size<2||!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=size*size||b>=size*size)
  throw Error("Coordenadas inválidas");
 return Math.abs(Math.floor(a/size)-Math.floor(b/size))+Math.abs(a%size-b%size);
}
export function newCoordinates(difficulty:Difficulty=0,seed=71):CoordinatesGame {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const size=5+2*difficulty,last=size-1;
 const flipRow=next(seed)&1,flipCol=next(next(seed))&1;
 const transform=([row,col]:readonly [number,number])=>(flipRow?last-row:row)*size+(flipCol?last-col:col);
 const locations:[[number,number],[number,number],[number,number]]=[[0,0],[last,last],[0,last]];
 const beaconPositions=locations.map(pos=>transform(pos));
 let target=next(seed^0x9e3779b9)%(size*size);
 while(target===0||beaconPositions.includes(target))target=(target+1)%(size*size);
 const beacons=beaconPositions.map(position=>({position,distance:manhattan(size,position,target)}));
 return {difficulty,seed,size,target,beacons,shown:3-difficulty,hintsUsed:0,
  selected:null,attempts:0,lastDistance:null,phase:"playing",score:0};
}
export function candidateCount(game:CoordinatesGame,shown=game.shown):number {
 if(!Number.isInteger(shown)||shown<0||shown>game.beacons.length)throw Error("Quantidade de pistas inválida");
 let count=0;
 for(let i=0;i<game.size*game.size;i++){
  if(game.beacons.slice(0,shown).every(b=>manhattan(game.size,i,b.position)===b.distance))count++;
 }
 return count;
}
export function selectCoordinate(game:CoordinatesGame,position:number):CoordinatesGame {
 if(game.phase!=="playing"||!Number.isInteger(position)||position<0||position>=game.size*game.size)return game;
 return {...game,selected:position};
}
export function revealBeacon(game:CoordinatesGame):CoordinatesGame {
 if(game.phase!=="playing"||game.shown===game.beacons.length)return game;
 return {...game,shown:game.shown+1,hintsUsed:game.hintsUsed+1};
}
export function confirmCoordinate(game:CoordinatesGame):CoordinatesGame {
 if(game.phase!=="playing"||game.selected===null)return game;
 const distance=manhattan(game.size,game.selected,game.target),attempts=game.attempts+1;
 const won=distance===0,lost=!won&&attempts>=3;
 return {...game,attempts,lastDistance:distance,selected:null,phase:won?"won":lost?"lost":"playing",
  score:won?Math.max(100,1200+game.difficulty*150-attempts*90-game.hintsUsed*160):0};
}
export const restartCoordinates=(game:CoordinatesGame)=>newCoordinates(game.difficulty,game.seed);
export const nextCoordinates=(game:CoordinatesGame)=>newCoordinates(game.difficulty,next(game.seed));
