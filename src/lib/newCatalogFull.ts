import { newGames } from "./newCatalog";
import { newGameHelp } from "./newCatalogHelp";
/** Rich metadata for lazy board, quiz and motion engines. */
export const newGamesWithHelp = newGames.map(game => ({ ...game, help: newGameHelp[game.id] }));
