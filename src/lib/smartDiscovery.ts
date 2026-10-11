import type { GameId } from "./catalog";
import { newGames } from "./newCatalog";
import { expandedGames } from "./expandedCatalog";

export type GameModeTag = "classico"|"rapido"|"sem-pressa"|"dupla"|"bot"|"treino"|"sobrevivencia";
export type DiscoveryFilter = GameModeTag|"todos"|"nao-jogados"|"favoritos";
type GameInfo = {id: GameId;name:string;category:string;description:string};
type DiscoveryHistory = {favorites:readonly string[];visits:Partial<Record<GameId,number>>;last:GameId|null};

const duels = new Set<GameId>(["damas","domino","liga4","velha","xadrez"]);
const quick = new Set<GameId>(["reflexo","estrelas","tiro","rally","corrida"]);
const survival = new Set<GameId>(["rally","coleta","orbital","runner","voo","jetpack","esquiva","drift","invasores","asteroides","breakout","pong","pouso"]);
const training = new Set<GameId>(["vinteum","dados","boliche","basquete","golfe","arco","pesca","match3"]);
const untimed = new Set<GameId>([
  ...newGames.filter(g=>g.family==="board").map(g=>g.id),
  ...expandedGames.filter(g=>g.family==="logic").map(g=>g.id),
  "palavra","luzes","puzzle","2048","minas","xadrez","damas","domino","velha","liga4","estacionamento",
]);

export const modeNames: Record<GameModeTag,string> = {
  classico:"Clássico",rapido:"Partidas rápidas","sem-pressa":"Sem pressa",
  dupla:"Dupla local",bot:"Contra o bot",treino:"Treino",sobrevivencia:"Sobrevivência",
};
export const discoveryFilters: readonly {id:DiscoveryFilter;label:string}[] = [
  {id:"todos",label:"Todos os modos"},
  {id:"rapido",label:"Partidas rápidas"},
  {id:"sem-pressa",label:"Sem pressa"},
  {id:"dupla",label:"Dupla local"},
  {id:"bot",label:"Contra o bot"},
  {id:"treino",label:"Treino"},
  {id:"sobrevivencia",label:"Sobrevivência"},
  {id:"nao-jogados",label:"Ainda não joguei"},
  {id:"favoritos",label:"Meus favoritos"},
];
export const modeLabel = (tag:GameModeTag) => modeNames[tag];

export function modeTags(game:GameInfo):GameModeTag[] {
  const result:GameModeTag[]=["classico"];
  if(quick.has(game.id)) result.push("rapido");
  if(untimed.has(game.id)) result.push("sem-pressa");
  if(duels.has(game.id)) result.push("dupla","bot");
  if(training.has(game.id)) result.push("treino");
  if(survival.has(game.id)) result.push("sobrevivencia");
  return result;
}
export function filterByMode<T extends GameInfo>(
  games:readonly T[], selected:DiscoveryFilter,
  visits:Partial<Record<GameId,number>>, favorites:readonly string[],
):T[] {
  if(selected==="todos") return [...games];
  if(selected==="nao-jogados") return games.filter(g=>!(visits[g.id]||0));
  if(selected==="favoritos") return games.filter(g=>favorites.includes(g.id));
  return games.filter(g=>modeTags(g).includes(selected));
}

/** On-device ranking. Favorites first; then related and unplayed titles. No tracking/network. */
export function recommendGames<T extends GameInfo>(
  games:readonly T[],history:DiscoveryHistory,
):T[] {
  if(!history.favorites.length && !history.last && !Object.keys(history.visits).length)
    return [...games];
  const previous=games.find(g=>g.id===history.last);
  const scored=games.map((g,index)=>{
    const visits=history.visits[g.id]||0;
    const score=(history.favorites.includes(g.id)?100:0)
      +(previous && previous.category===g.category && previous.id!==g.id?12:0)
      +(visits===0?6:0)
      +Math.min(8,visits)
      -(history.last===g.id?4:0);
    return {g,index,score};
  });
  scored.sort((a,b)=>b.score-a.score||a.index-b.index);
  return scored.map(s=>s.g);
}
