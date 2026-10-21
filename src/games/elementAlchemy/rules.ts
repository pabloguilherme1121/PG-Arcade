export type Difficulty=0|1|2;
export type ElementId=0|1|2|3|4|5|6|7|8;
export type RecipeId=3|4|5|6|7|8;
export type CraftHistory=Readonly<{inventory:readonly number[];moves:number}>;
export type AlchemyGame=Readonly<{
 difficulty:Difficulty;seed:number;inventory:readonly number[];moves:number;maxMoves:number;
 goal:RecipeId;history:readonly CraftHistory[];log:readonly string[];
 phase:"playing"|"won"|"lost";score:number;
}>;
export const elementNames=["Fogo","Água","Terra","Vapor","Argila","Metal","Elixir","Cristal","Obra-prima"] as const;
export const recipes:Readonly<Record<RecipeId,readonly [ElementId,ElementId]>>={
 3:[0,1],4:[1,2],5:[0,2],6:[3,4],7:[4,5],8:[6,7]
};
const nextSeed=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function newAlchemyGame(difficulty:Difficulty=0,seed=19):AlchemyGame{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const raw:[[number,number,number],[number,number,number],[number,number,number]]=[
  [2,3,2],[2,2,3],[2,3,3]
 ];
 const inventory=[...raw[difficulty],0,0,0,0,0,0];
 const extra=nextSeed(seed)%3;inventory[extra]+=1;
 return {difficulty,seed,inventory,moves:0,maxMoves:[5,5,9][difficulty],
  goal:([6,7,8] as RecipeId[])[difficulty],history:[],log:[],phase:"playing",score:0};
}
export function canCraft(g:AlchemyGame,recipe:RecipeId):boolean{
 const inputs=recipes[recipe];
 if(g.phase!=="playing"||!inputs||g.moves>=g.maxMoves)return false;
 return inputs[0]===inputs[1]?g.inventory[inputs[0]]>=2:
  g.inventory[inputs[0]]>0&&g.inventory[inputs[1]]>0;
}
export function craftElement(g:AlchemyGame,recipe:RecipeId):AlchemyGame{
 if(!canCraft(g,recipe))return g;
 const ingredients=recipes[recipe],inventory=[...g.inventory];
 for(const ingredient of ingredients)inventory[ingredient]-=1;
 inventory[recipe]+=1;
 const moves=g.moves+1;
 const won=inventory[g.goal]>0;
 const lost=!won&&moves>=g.maxMoves;
 return {...g,inventory,moves,phase:won?"won":lost?"lost":"playing",
  history:[...g.history,{inventory:g.inventory,moves:g.moves}],
  log:[...g.log,`Combinação: ${elementNames[ingredients[0]]} + ${elementNames[ingredients[1]]} → ${elementNames[recipe]}`],
  score:won?Math.max(100,1500+g.difficulty*200-moves*70+inventory.slice(0,3).reduce((a,b)=>a+b,0)*6):0};
}
export function undoAlchemy(g:AlchemyGame):AlchemyGame{
 if(!g.history.length)return g;
 const prev=g.history[g.history.length-1];
 return {...g,inventory:prev.inventory,moves:prev.moves,history:g.history.slice(0,-1),
  log:g.log.slice(0,-1),phase:"playing",score:0};
}
export const restartAlchemy=(g:AlchemyGame)=>newAlchemyGame(g.difficulty,g.seed);
export const nextAlchemy=(g:AlchemyGame)=>newAlchemyGame(g.difficulty,nextSeed(g.seed));
