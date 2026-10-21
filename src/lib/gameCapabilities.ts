import type { GameId } from './catalog';
import { newGames } from './newCatalog';
import { expandedGames } from './expandedCatalog';

// Only capabilities implemented by the current engines belong here.
const localDuels = new Set<GameId>(["climas","contrato","passagem","cofre","leilao","comum","damas","domino","liga4","velha","xadrez"]);
const botGames = new Set<GameId>([
  ...Array.from(localDuels).filter(id => id !== 'comum' && id !== 'cofre' && id !== 'passagem' && id !== 'contrato' && id !== 'climas'), 'nim', 'reversi', 'pontes',
  'gomoku', 'hex', 'ataxx', 'isolation', 'breakthrough', 'territory', 'mancala', 'chomp',
]);
const swipeGames=new Set<GameId>([
  ...newGames.filter(g=>g.family==='motion' && !['rhythm','balloons'].includes(g.id)).map(g=>g.id),
  ...expandedGames.filter(g=>g.family==='action').map(g=>g.id),
  'snake','2048','puzzle','wordsearch','slideblock','labirinto','sokoban','match3',
]);


export function gameCapabilities(id: GameId) {
  return {
    solo: id !== 'climas' && id !== 'cofre' && id !== 'passagem' && id !== 'contrato',
    online: false,
    timedSessions: id !== "comum" && id !== "leilao" && id !== "neon" && id !== "frutas" && id !== "cofre" && id !== "passagem" && id !== "contrato" && id !== "engrenagens" && id !== "arquipelago" && id !== "trilhos" && id !== "ponteiros" && id !== "sombras" && id !== "runas" && id !== "fios" && id !== "balancas" && id !== "cubos" && id !== "bordas" && id !== "coordenadas" && id !== "portas" && id !== "mercadores" && id !== "farois" && id !== "resgate" && id !== "colheita" && id !== "climas" && id !== "alquimia" && id !== "cidade" && id !== "irrigacao" && id !== "reles",
    localPlayers: id === "comum" || id === "leilao" || id === "cofre" || id === "passagem" || id === "contrato" ? 4 : localDuels.has(id) ? 2 : 1,
    bot: botGames.has(id),
    swipe: swipeGames.has(id),
  } as const;
}
