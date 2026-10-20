export type Family='solar'|'lunar'|'marinha';
export type Level='easy'|'normal'|'hard';
export type Relic=Readonly<{id:string;name:string;family:Family;value:number}>;
export type Resolution=Readonly<{relic:Relic;bids:readonly number[];winner:number|null;price:number}>;
export type Auction=Readonly<{
 seed:number;round:number;phase:'bidding'|'reveal'|'finished';lots:readonly Relic[];
 coins:readonly number[];piles:readonly (readonly Relic[])[];bids:readonly (number|null)[];history:readonly Resolution[];
}>;
export const familyNames:Record<Family,string>={solar:'Solar',lunar:'Lunar',marinha:'Marinha'};
const names:Record<Family,readonly string[]>={
 solar:['Disco da Aurora','Ampulheta de Luz','Coroa do Meio-dia','Prisma Dourado','Bússola do Sol','Selo do Horizonte'],
 lunar:['Máscara do Eclipse','Espelho da Noite','Chave de Prata','Cálice do Crepúsculo','Astrolábio Lunar','Pingente Estelar'],
 marinha:['Concha de Cristal','Âncora de Jade','Pérola do Recife','Mapa das Marés','Coral de Vidro','Tridente de Cobre'],
};
export function createAuction(seed:number,players=2):Auction {
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||![2,3,4].includes(players))throw Error('Configuração de leilão inválida.');
 let random=seed>>>0;
 const next=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
 const shuffle=<T,>(items:readonly T[]):T[]=>{
  const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;
 };
 const lots=shuffle((Object.keys(names) as Family[]).flatMap(family=>shuffle(names[family].map((name,i)=>({id:`${family}-${i}`,name,family,value:2+i%5}))).slice(0,3)));
 return {seed,round:0,phase:'bidding',lots,coins:Array(players).fill(30),piles:Array.from({length:players},()=>[]),bids:Array(players).fill(null),history:[]};
}
/** A trio replaces a pair; a relic never belongs to two bonus groups. */
export function collectionScore(pile:readonly Relic[]):number {
 let score=pile.reduce((sum,relic)=>sum+relic.value,0);
 for(const family of Object.keys(names) as Family[]){const n=pile.filter(r=>r.family===family).length;score+=Math.floor(n/3)*8+(n%3===2?3:0);}
 return score;
}
/** Public family counts help players plan pairs and trios; never expose sealed bids. */
export function collectionProgress(pile: readonly Relic[]): Record<Family, number> {
 const counts: Record<Family,number> = {solar:0,lunar:0,marinha:0};
 for(const relic of pile) counts[relic.family]++;
 return counts;
}
export const priority=(state:Auction)=>(state.seed%state.coins.length+state.round)%state.coins.length;
export function currentBidder(state:Auction):number {
 for(let n=0;n<state.coins.length;n++){const player=(priority(state)+n)%state.coins.length;if(state.bids[player]===null)return player;}
 return priority(state);
}
export function submitBid(state:Auction,player:number,round:number,bid:number):Auction {
 if(state.phase!=='bidding'||round!==state.round||!Number.isInteger(player)||player<0||player>=state.coins.length||state.bids[player]!==null||!Number.isInteger(bid)||bid<0||bid>10||bid>state.coins[player])return state;
 const bids=state.bids.map((value,i)=>i===player?bid:value);
 if(bids.some(value=>value===null))return {...state,bids};
 const complete=bids as number[],highest=Math.max(...complete);
 let winner:number|null=null;
 if(highest>0)for(let offset=0;offset<complete.length;offset++){const i=(priority(state)+offset)%complete.length;if(complete[i]===highest){winner=i;break;}}
 const relic=state.lots[state.round];
 const coins=state.coins.map((value,i)=>i===winner?value-highest:value);
 const piles=state.piles.map((pile,i)=>i===winner?[...pile,relic]:pile);
 return {...state,bids,coins,piles,phase:'reveal',history:[...state.history,{relic,bids:complete,winner,price:winner===null?0:highest}]};
}
export function nextLot(state:Auction):Auction {
 if(state.phase!=='reveal')return state;
 if(state.round===state.lots.length-1)return {...state,phase:'finished'};
 return {...state,round:state.round+1,phase:'bidding',bids:state.bids.map(()=>null)};
}
/** Called and locked before the human bids. No access to this round's secret bids. */
export function botBid(state:Auction,level:Level):number {
 const relic=state.lots[state.round],pile=state.piles[1],budget=state.coins[1];
 const gain=collectionScore([...pile,relic])-collectionScore(pile);
 if(level==='easy')return Math.min(budget,Math.max(1,Math.min(4,relic.value-1)));
 const remaining=state.lots.length-state.round;
 const pace=Math.ceil(budget/remaining*(level==='hard'?1.8:1.5));
 const denial=collectionScore([...state.piles[0],relic])-collectionScore(state.piles[0]);
 const target=level==='hard'?Math.ceil(gain*.9+Math.max(0,denial-relic.value)*.4):Math.ceil(gain*.7);
 return Math.max(0,Math.min(10,budget,pace,target));
}
export function auctionView(state:Auction,player:number) {
 if(!Number.isInteger(player)||player<0||player>=state.coins.length)throw Error('Participante inválido.');
 return {ownBid:state.bids[player],submitted:state.bids.map(value=>value!==null),revealedBids:state.phase==='bidding'?null:[...state.bids]};
}
