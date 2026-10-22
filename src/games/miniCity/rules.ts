export type Difficulty = 0|1|2;
export type Zone = 0|1|2|3|4; // vacant, residential, park, shop, industry
export type CityGoal = Readonly<{homes:number;parks:number;shops:number;factories:number}>;
export type CityMetrics = Readonly<{cost:number;homes:number;parks:number;shops:number;factories:number;happyHomes:number;pollutedHomes:number}>;
export type CityState = Readonly<{
 difficulty:Difficulty;seed:number;size:number;budget:number;goal:CityGoal;
 blocked:readonly number[];cells:readonly Zone[];selected:Zone;
 moves:number;history:readonly (readonly Zone[])[];
 phase:"playing"|"won";score:number;
}>;
export const zoneNames = ["Vazio","Moradia","Parque","Comércio","Indústria"] as const;
export const zoneCosts = [0,2,1,2,3] as const;
const goals:readonly CityGoal[]=[
 {homes:2,parks:1,shops:1,factories:1},
 {homes:3,parks:2,shops:1,factories:1},
 {homes:4,parks:2,shops:2,factories:2},
];
const budgets=[12,15,22] as const;
const next=(seed:number)=>(Math.imul(seed,1664525)+1013904223)>>>0;
export function adjacent(size:number,index:number):number[]{
 if(!Number.isInteger(size)||size<3||!Number.isInteger(index)||index<0||index>=size*size)throw Error("Coordenada inválida");
 const y=Math.floor(index/size),x=index%size,ids:number[]=[];
 if(y>0)ids.push(index-size);
 if(x<size-1)ids.push(index+1);
 if(y<size-1)ids.push(index+size);
 if(x>0)ids.push(index-1);
 return ids;
}
export function createCity(difficulty:Difficulty=0,seed=27):CityState{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Configuração inválida");
 const size=3+difficulty;
 const candidates=difficulty===0?[6,8]:difficulty===1?[12,13,14]:[21,22,23];
 const blocked=[candidates[next(seed)%candidates.length]];
 return {difficulty,seed,size,budget:budgets[difficulty],goal:goals[difficulty],
  blocked,cells:Array.from({length:size*size},()=>0 as Zone),selected:1,
  moves:0,history:[],phase:"playing",score:0};
}
export function measureCity(g:Pick<CityState,"cells"|"size">):CityMetrics {
 const cells=g.cells;
 const count=(zone:Zone)=>cells.filter(v=>v===zone).length;
 const homeIds=cells.map((zone,index)=>zone===1?index:-1).filter(id=>id!==-1);
 return {
  cost:cells.reduce<number>((total,zone)=>total+zoneCosts[zone],0),
  homes:count(1),parks:count(2),shops:count(3),factories:count(4),
  happyHomes:homeIds.filter(id=>adjacent(g.size,id).some(near=>cells[near]===2||cells[near]===3)).length,
  pollutedHomes:homeIds.filter(id=>adjacent(g.size,id).some(near=>cells[near]===4)).length
 };
}
export function cityIsSolved(g:CityState):boolean{
 const m=measureCity(g),target=g.goal;
 return m.cost<=g.budget && m.homes>=target.homes && m.parks>=target.parks &&
  m.shops>=target.shops && m.factories>=target.factories &&
  m.happyHomes===m.homes && m.pollutedHomes===0;
}
export function selectCityZone(g:CityState,zone:Zone):CityState{
 return g.phase==="playing" && [0,1,2,3,4].includes(zone)?{...g,selected:zone}:g;
}
export function placeCityZone(g:CityState,index:number):CityState{
 if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.cells.length||
   g.blocked.includes(index))return g;
 const newZone=g.cells[index]===g.selected?0:g.selected;
 if(newZone===g.cells[index])return g;
 const cells=g.cells.map((v,i)=>i===index?newZone:v);
 const cost=measureCity({cells,size:g.size}).cost;
 if(cost>g.budget)return g;
 const interim:CityState={...g,cells,moves:g.moves+1,history:[...g.history,g.cells],phase:"playing",score:0};
 const won=cityIsSolved(interim);
 return won?{...interim,phase:"won",score:Math.max(100,1400+g.difficulty*230-cost*9-interim.moves*14)}:interim;
}
export function undoCity(g:CityState):CityState{
 if(!g.history.length)return g;
 return {...g,cells:g.history[g.history.length-1],history:g.history.slice(0,-1),
  moves:Math.max(0,g.moves-1),phase:"playing",score:0};
}
export const resetCity=(g:CityState)=>createCity(g.difficulty,g.seed);
export const nextCity=(g:CityState)=>createCity(g.difficulty,next(g.seed));
