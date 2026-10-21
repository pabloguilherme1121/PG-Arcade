export type Difficulty=0|1|2;
export type Commodity=0|1|2;
export type City=0|1|2|3;
export type TradingAction="buy"|"sell"|"move"|"refuel";
export type TradingEvent=Readonly<{action:TradingAction;description:string;credits:number;fuel:number;turns:number}>;
export type TradingGame=Readonly<{
 difficulty:Difficulty;seed:number;city:City;credits:number;initialCredits:number;fuel:number;
 maxFuel:number;turns:number;maxTurns:number;goal:number;
 inventory:readonly number[];stock:readonly number[];buyPrices:readonly number[];sellPrices:readonly number[];
 moves:number;log:readonly TradingEvent[];phase:"playing"|"won"|"lost";score:number;
}>;
export const cityNames=["Porto","Serra","Vale","Capital"] as const;
export const cargoNames=["Grãos","Cristais","Ervas"] as const;
const next=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
const links:readonly [City,City,number][]=[[0,1,2],[1,2,2],[2,0,2],[0,3,3],[1,3,3],[2,3,3]];
export const routeFuel=(a:City,b:City):number|null=>{
 const route=links.find(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
 return route?route[2]:null;
};
export const cargoCount=(g:TradingGame)=>g.inventory.reduce((a,b)=>a+b,0);
export const netProfit=(g:TradingGame)=>g.credits-g.initialCredits;
export function newTradeGame(difficulty:Difficulty=0,seed=27):TradingGame{
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error("Partida inválida");
 const buyPrices=[3+(next(seed)%2),4+(next(seed+1)%2),5+(next(seed+2)%2)];
 const sellPrices=buyPrices.map((price,i)=>price+[4,6,7][i]+(next(seed+10+i)%2));
 return {difficulty,seed,city:0,credits:22,initialCredits:22,fuel:[10,13,16][difficulty],
  maxFuel:[10,13,16][difficulty],turns:0,maxTurns:[9,12,14][difficulty],goal:[10,18,25][difficulty],
  inventory:[0,0,0],stock:[9,9,9],buyPrices,sellPrices,moves:0,log:[],phase:"playing",score:0};
}
function commit(g:TradingGame,change:Partial<TradingGame>,action:TradingAction,description:string):TradingGame{
 const turns=g.turns+1;
 const credits=change.credits??g.credits,fuel=change.fuel??g.fuel;
 const won=credits-g.initialCredits>=g.goal;
 const lost=!won&&turns>=g.maxTurns;
 return {...g,...change,turns,moves:g.moves+1,phase:won?"won":lost?"lost":"playing",
  score:won?Math.max(100,1300+g.difficulty*180-turns*35-fuel*2):0,
  log:[...g.log,{action,description,credits,fuel,turns}]};
}
export function buyCargo(g:TradingGame,quantity:1|2=1):TradingGame{
 if(g.phase!=="playing"||![1,2].includes(quantity)||g.city===3)return g;
 const type=g.city as Commodity,price=g.buyPrices[type]*quantity;
 if(price>g.credits||g.stock[type]<quantity||cargoCount(g)+quantity>3)return g;
 const inventory=g.inventory.map((n,i)=>i===type?n+quantity:n);
 const stock=g.stock.map((n,i)=>i===type?n-quantity:n);
 return commit(g,{credits:g.credits-price,inventory,stock},"buy",`Comprou ${quantity} ${cargoNames[type]} em ${cityNames[g.city]}`);
}
export function moveTrader(g:TradingGame,destination:City):TradingGame{
 if(g.phase!=="playing"||![0,1,2,3].includes(destination)||destination===g.city)return g;
 const cost=routeFuel(g.city,destination);
 if(cost===null||cost>g.fuel)return g;
 return commit(g,{city:destination,fuel:g.fuel-cost},"move",`Viajou de ${cityNames[g.city]} a ${cityNames[destination]} (-${cost} combustível)`);
}
export function sellCargo(g:TradingGame):TradingGame{
 if(g.phase!=="playing"||g.city!==3||cargoCount(g)===0)return g;
 const revenue=g.inventory.reduce((sum,quantity,i)=>sum+quantity*g.sellPrices[i],0);
 return commit(g,{inventory:[0,0,0],credits:g.credits+revenue},"sell",`Vendeu carregamento na Capital por ${revenue} moedas`);
}
export function refuel(g:TradingGame):TradingGame{
 if(g.phase!=="playing"||g.city!==0||g.credits<5||g.fuel>g.maxFuel-5)return g;
 return commit(g,{credits:g.credits-5,fuel:g.fuel+5},"refuel","Reabasteceu +5 combustível por 5 moedas");
}
export const restartTrade=(g:TradingGame)=>newTradeGame(g.difficulty,g.seed);
export const nextTrade=(g:TradingGame)=>newTradeGame(g.difficulty,next(g.seed));
