import { useEffect, useState } from "react";
import { movePuzzle, puzzleSolved, shuffledPuzzle } from "../lib/puzzles";
export default function SlidingPuzzle({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [board, setBoard] = useState(shuffledPuzzle);
  const [moves, setMoves] = useState(0);
  const won = puzzleSolved(board);
  useEffect(() => {
    if (won && moves) onRecord(moves);
  }, [won, moves, onRecord]);
  function move(i: number) {
    if (won) return;
    const next = movePuzzle(board, i);
    if (next) {
      setBoard(next);
      setMoves((m) => m + 1);
    }
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Jogadas<strong>{moves}</strong>
          </div>
          <div>
            Melhor partida<strong>{record || "—"}</strong>
          </div>
        </div>
        <p role="status">
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
                aria-label={`Peça ${v}`}
                disabled={won || !movePuzzle(board, i)}
                onClick={() => move(i)}
              >
                {v}
              </button>
            ) : (
              <span key={i} aria-label="Espaço vazio" />
            ),
          )}
        </div>
        <button
          className="primary"
          onClick={() => {
            setBoard(shuffledPuzzle());
            setMoves(0);
          }}
        >
          Embaralhar novamente
        </button>
      </div>
      <aside className="instructions">
        <h2>Um espaço, muitas possibilidades</h2>
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
          Todo embaralhamento tem solução. Seu recorde guarda a menor quantidade
          de jogadas.
        </p>
      </aside>
    </div>
  );
}
