import { games as catalog, type GameId } from "./catalog";
import { newGames } from "./newCatalog";
import { expandedGames } from "./expandedCatalog";
import { gameCapabilities } from "./gameCapabilities";

export type GameModeTag = "classico"|"rapido"|"sem-pressa"|"dupla"|"bot"|"treino"|"sobrevivencia"|"grupo"|"turnos";
export type DiscoveryFilter = GameModeTag|"todos"|"nao-jogados"|"jogados"|"favoritos"|"deslizar";
type GameInfo = {id: GameId;name:string;category:string;description:string};
type DiscoveryHistory = {favorites:readonly string[];visits:Partial<Record<GameId,number>>;last:GameId|null};

export const supportsSwipe=(id:GameId)=>gameCapabilities(id).swipe;
const quick = new Set<GameId>(["reflexo","estrelas","tiro","rally","corrida"]);
const survival = new Set<GameId>(["neon","rally","coleta","orbital","runner","voo","jetpack","esquiva","drift","invasores","asteroides","breakout","pong","pouso"]);
const training = new Set<GameId>(["vinteum","dados","boliche","basquete","golfe","arco","pesca","match3"]);
const turnBased = new Set<GameId>([
  "engrenagens", "arquipelago", "trilhos", "ponteiros", "sombras", "runas",
  "fios", "balancas", "cubos", "bordas", "coordenadas", "portas", "mercadores",
  "farois", "resgate", "colheita", "climas", "alquimia", "cidade", "irrigacao",
  "reles", "fortalezas", "trem", "meteoros",
]);
const untimed = new Set<GameId>([
  ...newGames.filter(g=>g.family==="board").map(g=>g.id),
  ...expandedGames.filter(g=>g.family==="logic").map(g=>g.id),
  "meteoros","trem","fortalezas","reles","irrigacao","cidade","alquimia","climas","colheita","resgate","farois","mercadores","portas","coordenadas","bordas","cubos","balancas","fios","runas","sombras","ponteiros","trilhos","arquipelago","engrenagens","contrato","passagem","cofre","leilao","comum","frutas","blocos","palavra","luzes","puzzle","2048","minas","xadrez","damas","domino","velha","liga4","estacionamento",
]);

export const modeNames: Record<GameModeTag,string> = {
  classico:"Clássico",rapido:"Partidas rápidas","sem-pressa":"Sem pressa",
  dupla:"Dupla local",bot:"Contra o bot",treino:"Treino",sobrevivencia:"Sobrevivência",grupo:"Grupo local (3–4)",turnos:"Por turnos",
};
export const discoveryFilters: readonly {id:DiscoveryFilter;label:string}[] = [
  {id:"todos",label:"Todos os modos"},
  {id:"rapido",label:"Partidas rápidas"},
  {id:"sem-pressa",label:"Sem pressa"},
  {id:"turnos",label:"Por turnos"},
  {id:"dupla",label:"Dupla local"},
  {id:"grupo",label:"Grupo local (3–4)"},
  {id:"bot",label:"Contra o bot"},
  {id:"treino",label:"Treino"},
  {id:"sobrevivencia",label:"Sobrevivência"},
  {id:"nao-jogados",label:"Ainda não joguei"},
  {id:"jogados",label:"Já joguei"},
  {id:"favoritos",label:"Meus favoritos"},
  {id:"deslizar",label:"Deslizar na tela"},
];
export const modeLabel = (tag:GameModeTag) => modeNames[tag];

export function modeTags(game:GameInfo):GameModeTag[] {
  const capabilities = gameCapabilities(game.id);
  const result:GameModeTag[]=["classico"];
  if(quick.has(game.id)) result.push("rapido");
  if(untimed.has(game.id)) result.push("sem-pressa");
  if(turnBased.has(game.id)) result.push("turnos");
  if(capabilities.localPlayers >= 2) result.push("dupla");
  if(capabilities.localPlayers >= 3) result.push("grupo");
  if(capabilities.bot) result.push("bot");
  if(training.has(game.id)) result.push("treino");
  if(survival.has(game.id)) result.push("sobrevivencia");
  return result;
}
/** Shared compact preview for catalog cards and the featured suggestion. */
export function previewModeTags(game: GameInfo): GameModeTag[] {
  const available = modeTags(game).filter(tag => tag !== "classico").slice(0, 2);
  return available.length ? available : ["classico"];
}

export function filterByMode<T extends GameInfo>(
  games:readonly T[], selected:DiscoveryFilter,
  visits:Partial<Record<GameId,number>>, favorites:readonly string[],
):T[] {
  if(selected==="todos") return [...games];
  if(selected==="nao-jogados") return games.filter(g=>!(visits[g.id]||0));
  if(selected==="jogados") return games.filter(g=>(visits[g.id]||0)>0);
  if(selected==="favoritos") return games.filter(g=>favorites.includes(g.id));
  if(selected==="deslizar") return games.filter(g=>supportsSwipe(g.id));
  return games.filter(g=>modeTags(g).includes(selected));
}

/** Count all discovery facets in one catalog pass, without allocating filtered lists. */
export function countModes(
  games: readonly GameInfo[], visits: Partial<Record<GameId, number>>, favorites: readonly string[],
): Record<DiscoveryFilter, number> {
  const counts: Record<DiscoveryFilter, number> = {
    todos: games.length, classico: 0, rapido: 0, "sem-pressa": 0, dupla: 0, grupo: 0, bot: 0,
    treino: 0, sobrevivencia: 0, turnos: 0, "nao-jogados": 0, jogados: 0, favoritos: 0, deslizar: 0,
  };
  const saved = new Set(favorites);
  for (const game of games) {
    for (const tag of modeTags(game)) counts[tag]++;
    counts[(visits[game.id] || 0) > 0 ? "jogados" : "nao-jogados"]++;
    if (saved.has(game.id)) counts.favoritos++;
    if (supportsSwipe(game.id)) counts.deslizar++;
  }
  return counts;
}

/** Prefer not-yet-played titles and avoid repeating the most recent game. */
export function chooseSurprise<T extends GameInfo>(
  candidates: readonly T[],
  history: Pick<DiscoveryHistory, "last" | "visits">,
  draw: () => number = Math.random,
): T | null {
  if (!candidates.length) return null;
  const alternatives = candidates.filter(game => game.id !== history.last);
  const pool = alternatives.length ? alternatives : [...candidates];
  const unseen = pool.filter(game => !(history.visits[game.id] || 0));
  const eligible = unseen.length ? unseen : pool;
  return eligible[Math.min(eligible.length - 1, Math.floor(draw() * eligible.length))];
}

/** On-device ranking. Favorites first; then related and unplayed titles. No tracking/network. */
export function recommendGames<T extends GameInfo>(
  games:readonly T[],history:DiscoveryHistory,
):T[] {
  if(!history.favorites.length && !history.last && !Object.keys(history.visits).length)
    return [...games];
  const previous=catalog.find(g=>g.id===history.last);
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
