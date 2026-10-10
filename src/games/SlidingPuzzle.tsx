import { useState } from "react";
import { movePuzzle, puzzleSolved, shuffledPuzzle } from "../lib/puzzles";
import { puzzleInPlaceCount, puzzleManhattanDistance } from "../lib/puzzleFeedback";
import "./SlidingPuzzle.css";
export default function SlidingPuzzle({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [board, setBoard] = useState(shuffledPuzzle);
  const [showGoal, setShowGoal] = useState(false);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<number[][]>([]);
  const [lastTile, setLastTile] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState(100);
  const won = puzzleSolved(board);
  const placed = puzzleInPlaceCount(board);
  const distance = puzzleManhattanDistance(board);
  function shuffle(depth: number) {
    setBoard(shuffledPuzzle(Math.random, depth));
    setMoves(0);
    setHistory([]);
    setLastTile(null);
  }
  function undo() {
    if (won || !history.length) return;
    setBoard(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setLastTile(null);
  }
  function move(i: number) {
    if (won) return;
    const next = movePuzzle(board, i);
    if (next) {
      if (puzzleSolved(next)) onRecord(moves + 1);
      setHistory(h => [...h, board]);
      setLastTile(board[i]);
      setBoard(next);
      setMoves((m) => m + 1);
    }
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="session-options"><label>Embaralhamento
          <select aria-label="Dificuldade do Quebra-cabeça" value={difficulty} onChange={(e) => {
            const depth = Number(e.target.value);
            setDifficulty(depth);
            shuffle(depth);
          }}>
            <option value={12}>Fácil · embaralhamento curto</option>
            <option value={40}>Normal · intermediário</option>
            <option value={100}>Difícil · embaralhamento longo</option>
          </select>
        </label></div>
        <div className="scores">
          <div>
            Jogadas<strong>{moves}</strong>
          </div>
          <div>
            Melhor partida<strong>{record || "—"}</strong>
          </div>
        </div>
        <div className="sliding-premium-hud" aria-label="Progresso do quebra-cabeça">
          <div><span>Peças no lugar</span><strong data-puzzle-placed>{placed}/8</strong></div>
          <div><span>Distância estimada</span><strong data-puzzle-distance>{distance}</strong></div>
        </div>
        <p role="status" className="game-status">
          {won
            ? "Você organizou todas as peças!"
            : "Leve as peças de 1 a 8 até a ordem correta."}
        </p>
        <div
          className="sliding-board"
          role="group"
          aria-label="Quebra-cabeça de oito peças"
          tabIndex={0}
          onKeyDown={(e) => {
            const offsets: Record<string, number> = {
              ArrowUp: 3,
              ArrowDown: -3,
              ArrowLeft: 1,
              ArrowRight: -1,
            };
            if (e.key in offsets) {
              e.preventDefault();
              move(board.indexOf(0) + offsets[e.key]);
            }
          }}
        >
          {board.map((v, i) =>
            v ? (
              <button
                key={i}
                data-puzzle-last={v === lastTile ? "true" : undefined}
                aria-label={`Peça ${v}`}
                disabled={won || !movePuzzle(board, i)}
                onClick={() => move(i)}
              >
                {v}
              </button>
            ) : (
              <span key={i} role="img" aria-label="Espaço vazio" />
            ),
          )}
        </div>
        <div className="game-actions">
          <button onClick={undo} disabled={won || !history.length}>Desfazer jogada</button>
          <button className="primary" onClick={() => shuffle(difficulty)}>Embaralhar novamente</button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Um espaço, muitas possibilidades</h2>
        <button aria-pressed={showGoal} onClick={() => setShowGoal((v) => !v)}>
          {showGoal ? "Ocultar modelo" : "Mostrar modelo"}
        </button>
        {showGoal && (
          <div
            className="puzzle-goal"
            aria-label="Modelo: 1, 2, 3; 4, 5, 6; 7, 8, vazio"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 0].map((n) => (
              <span key={n}>{n || "·"}</span>
            ))}
          </div>
        )}
        <p>
          Toque em uma peça ao lado do espaço vazio para movê-la. Organize de 1
          a 8, deixando o espaço vazio no canto inferior direito.
        </p>
        <h3>Teclado</h3>
        <p>
          Com o tabuleiro em foco, use as setas para deslizar uma peça na
          direção indicada. Também pode usar Tab e Enter.
        </p>
        <p>
          Todo embaralhamento tem solução. Desfaça uma jogada sem penalidade enquanto
          a rodada estiver em andamento. A distância estimada mede quantas casas
          as peças estão longe da posição correta, mas não é uma solução automática.
          Seu recorde guarda a menor quantidade de jogadas.
        </p>
      </aside>
    </div>
  );
}
