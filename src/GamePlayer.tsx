import { lazy, type ComponentType } from "react";
import { finalGames } from "./lib/finalCatalog";
import { newGames, type NewGameId, type BoardId } from "./lib/newCatalog";
import { expandedGames, type ExpandedId } from "./lib/expandedCatalog";
import type { GameId } from "./lib/catalog";

type PlayerProps = { record: number; onRecord: (n: number) => void };
const collectionPlayers = Object.fromEntries(
  expandedGames.map((g) => [
    g.id,
    lazy(async () => {
      const module =
        g.family === "logic"
          ? await import("./games/LogicCollection")
          : g.family === "action"
            ? await import("./games/ActionCollection")
            : await import("./games/CasualCollection");
      return {
        default: (props: PlayerProps) => (
          <module.default {...props} gameId={g.id} />
        ),
      };
    }),
  ]),
) as unknown as Record<ExpandedId, ComponentType<PlayerProps>>;
const finalPlayers = Object.fromEntries(finalGames.map(g=>[g.id,lazy(async()=>{const module=await import('./games/finalCollection/FinalCollection');return {default:(props:PlayerProps)=><module.default {...props} gameId={g.id}/>};})])) as unknown as Record<typeof finalGames[number]['id'],ComponentType<PlayerProps>>;
export const players = {
  ...finalPlayers,
  meteoros: lazy(() => import("./games/meteorShield/MeteorShield")),
  trem: lazy(() => import("./games/runawayTrain/RunawayTrain")),
  fortalezas: lazy(() => import("./games/turnFortress/TurnFortress")),
  reles: lazy(() => import("./games/relayNetwork/RelayNetwork")),
  irrigacao: lazy(() => import("./games/irrigationZones/IrrigationZones")),
  cidade: lazy(() => import("./games/miniCity/MiniCity")),
  alquimia: lazy(() => import("./games/elementAlchemy/ElementAlchemy")),
  climas: lazy(() => import("./games/climateCards/ClimateCards")),
  colheita: lazy(() => import("./games/seasonHarvest/SeasonHarvest")),
  resgate: lazy(() => import("./games/rescueBoats/RescueBoats")),
  farois: lazy(() => import("./games/lighthouseDefense/LighthouseDefense")),
  mercadores: lazy(() => import("./games/tradeRoutes/TradeRoutes")),
  portas: lazy(() => import("./games/logicGates/LogicGates")),
  coordenadas: lazy(() => import("./games/lostCoordinates/LostCoordinates")),
  bordas: lazy(() => import("./games/enchantedEdges/EnchantedEdges")),
  cubos: lazy(() => import("./games/hiddenCubes/HiddenCubes")),
  balancas: lazy(() => import("./games/balanceRiddle/BalanceRiddle")),
  fios: lazy(() => import("./games/wirePaths/WirePaths")),
  runas: lazy(() => import("./games/runeCipher/RuneCipher")),
  sombras: lazy(() => import("./games/shadowVault/ShadowVault")),
  ponteiros: lazy(() => import("./games/clockPhases/ClockPhases")),
  trilhos: lazy(() => import("./games/railSwitches/RailSwitches")),
  arquipelago: lazy(() => import("./games/archipelago/Archipelago")),
  engrenagens: lazy(() => import("./games/timeGears/TimeGears")),
  contrato: lazy(() => import("./games/colorContracts/ColorContracts")),
  passagem: lazy(() => import("./games/secretPassage/SecretPassage")),
  cofre: lazy(() => import("./games/teamVault/TeamVault")),
  frutas: lazy(() => import("./games/fruitFusion/FruitFusion")),
  neon: lazy(() => import("./games/neonSurvival/NeonSurvival")),
  leilao: lazy(() => import("./games/relicAuction/RelicAuction")),
  comum: lazy(() => import("./games/commonWord/CommonWord")),
  ...(Object.fromEntries(
    newGames.map((g) => [
      g.id,
      lazy(async () => {
        if (g.family === "board") {
          const module = await import("./games/BoardExpansion");
          return { default: (props: PlayerProps) => <module.default {...props} gameId={g.id as BoardId} /> };
        }
        const module = g.family === "quiz" ? await import("./games/QuizExpansion") : await import("./games/MotionExpansion");
        return { default: (props: PlayerProps) => <module.default {...props} gameId={g.id} /> };
      }),
    ]),
  ) as unknown as Record<NewGameId, ComponentType<PlayerProps>>),
  ...collectionPlayers,
  blocos: lazy(() => import("./games/BlockPuzzle")),
  sequencia: lazy(() => import("./games/ColorSequence")),
  palavra: lazy(() => import("./games/SecretWord")),
  rally: lazy(() => import("./games/Rally")),
  coleta: lazy(() => import("./games/RoadCollect")),
  orbital: lazy(() => import("./games/Orbital")),
  minas: lazy(() => import("./games/Minesweeper")),
  reflexo: lazy(() => import("./games/Reaction")),
  corrida: lazy(() => import("./games/Racing")),
  estacionamento: lazy(() => import("./games/Parking")),
  tiro: lazy(() => import("./games/SpaceShooter")),
  luzes: lazy(() => import("./games/LightsOut")),
  estrelas: lazy(() => import("./games/StarCatch")),
  liga4: lazy(() => import("./games/ConnectFour")),
  puzzle: lazy(() => import("./games/SlidingPuzzle")),
  "2048": lazy(() => import("./games/Game2048")),
  snake: lazy(() => import("./games/Snake")),
  memoria: lazy(() => import("./games/Memory")),
  xadrez: lazy(() => import("./features/portfolio/components/PortfolioChess")),
  futebol: lazy(
    () => import("./features/portfolio/components/PortfolioFootball"),
  ),
  domino: lazy(() => import("./features/portfolio/components/PortfolioDomino")),
  damas: lazy(
    () => import("./features/portfolio/components/PortfolioCheckers"),
  ),
  velha: lazy(
    () => import("./features/portfolio/components/PortfolioTicTacToe"),
  ),
};
/** Keep route registration out of the catalog's initial payload. */
export default function GamePlayer({ gameId, ...props }: PlayerProps & { gameId: GameId }) {
  const Player = players[gameId];
  return <Player key={gameId} {...props} />;
}
