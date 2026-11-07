import { chooseChessBotMove, isChessWorkerRequest } from "./chess";

self.onmessage = (event: MessageEvent<unknown>) => {
  if (!isChessWorkerRequest(event.data)) {
    self.postMessage(null);
    return;
  }
  const { state, difficulty } = event.data;
  self.postMessage(chooseChessBotMove(state, "black", difficulty, Math.random, { maxMs: 1200 }));
};
