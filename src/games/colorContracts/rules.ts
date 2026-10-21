export const colors=["rubro","ciano","jade","ouro"] as const;
export type ColorToken=(typeof colors)[number];
export type PlayerCount=2|3|4;
export type ColorContracts=Readonly<{
  players:PlayerCount;seed:number;turn:number;phase:"ready"|"playing"|"done";
  market:readonly ColorToken[];collections:readonly (readonly ColorToken[])[];
  contracts:readonly [ColorToken,ColorToken];scores:readonly number[];winners:readonly number[];
}>;
const nextSeed=(s:number)=>(Math.imul(s,1664525)+1013904223)>>>0;
export function scoreCollection(pieces:readonly ColorToken[],contracts:readonly [ColorToken,ColorToken]):number {
  const counts=colors.map(color=>pieces.filter(p=>p===color).length);
  const sets=counts.reduce((score,n)=>score+(n>=2?5:0)+(n>=3?15:0)+(n>=4?20:0),0);
  const bonus=pieces.filter(p=>contracts.includes(p)).length*4;
  return pieces.length*2+sets+bonus+(new Set(pieces).size===4?12:0);
}
export function newContracts(players:PlayerCount=2,seed=1):ColorContracts {
  if(![2,3,4].includes(players)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
    throw new Error("Configuração inválida.");
  const offset=seed%4;
  const rotated=[...colors.slice(offset),...colors.slice(0,offset)];
  const market=rotated.slice(0,3);
  const contracts=[rotated[1],rotated[3]] as [ColorToken,ColorToken];
  return {players,seed,turn:0,phase:"ready",market,contracts,
    collections:Array.from({length:players},()=>[]),scores:Array(players).fill(0),winners:[]};
}
export function startContracts(g:ColorContracts):ColorContracts {
  return g.phase==="ready"?{...g,phase:"playing"}:g;
}
export function chooseContractColor(g:ColorContracts,index:number):ColorContracts {
  if(g.phase!=="playing"||!Number.isInteger(index)||index<0||index>=g.market.length)return g;
  const player=g.turn%g.players;
  const selected=g.market[index];
  const collections=g.collections.map((collection,i)=>i===player?[...collection,selected]:collection);
  const seed=nextSeed(g.seed);
  const nextColor=colors[seed%colors.length];
  const market=g.market.map((c,i)=>i===index?nextColor:c);
  const scores=collections.map(collection=>scoreCollection(collection,g.contracts));
  const turn=g.turn+1;
  const done=turn===g.players*4;
  const max=Math.max(...scores);
  return {...g,collections,seed,market,scores,turn,phase:done?"done":"playing",
    winners:done?scores.flatMap((score,i)=>score===max?[i]:[]):[]};
}
export function nextContracts(g:ColorContracts):ColorContracts {
  return newContracts(g.players,nextSeed(g.seed));
}
