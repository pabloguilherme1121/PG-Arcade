import { chooseChessBotMove, type ChessState, type ChessDifficulty } from "./chess";
self.onmessage = (event: MessageEvent<{ state: ChessState; difficulty: ChessDifficulty }>) => {
  self.postMessage(chooseChessBotMove(event.data.state, "black", event.data.difficulty, Math.random, { maxMs: 1200 }));
};
