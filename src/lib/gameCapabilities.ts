import { isFinalId } from './finalCatalog';
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


const untimedSessions = new Set<string>(["comum","leilao","neon","frutas","cofre","passagem","contrato","engrenagens","arquipelago","trilhos","ponteiros","sombras","runas","fios","balancas","cubos","bordas","coordenadas","portas","mercadores","farois","resgate","colheita","climas","alquimia","cidade","irrigacao","reles","fortalezas","trem","meteoros"]);
export function gameCapabilities(id: GameId) {
  return {
    solo: id !== 'climas' && id !== 'cofre' && id !== 'passagem' && id !== 'contrato',
    online: false,
    timedSessions: !isFinalId(id) && !untimedSessions.has(id),
    localPlayers: id === "comum" || id === "leilao" || id === "cofre" || id === "passagem" || id === "contrato" ? 4 : localDuels.has(id) ? 2 : 1,
    bot: botGames.has(id),
    swipe: swipeGames.has(id),
  } as const;
}
