import { useState } from "react";
import { dropDisc, discWinner } from "../lib/puzzles";
export default function ConnectFour() {
  const [board, setBoard] = useState<number[]>(Array(42).fill(0));
  const [turn, setTurn] = useState(1);
  const [history, setHistory] = useState<number[][]>([]);
  const winner = discWinner(board);
  const over = !!winner || board.every(Boolean);
  function play(column: number) {
    if (over) return;
    const next = dropDisc(board, column, turn);
    if (next) {
      setHistory((h) => [...h, board]);
      setBoard(next);
      setTurn((t) => 3 - t);
    }
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <p className="game-status" role="status">
          {winner
            ? `Jogador ${winner} venceu!`
            : over
              ? "Empate!"
              : `Vez do jogador ${turn} — ${turn === 1 ? "coral" : "lima"}`}
        </p>
        <div className="connect-controls" aria-label="Escolha a coluna">
          {Array.from({ length: 7 }, (_, i) => (
            <button
              key={i}
              aria-label={`Jogar na coluna ${i + 1}`}
              disabled={over || !!board[i]}
              onClick={() => play(i)}
            >
              {i + 1} ↓
            </button>
          ))}
        </div>
        <div
          className="connect-board"
          role="img"
          aria-label={
            board
              .map((v, i) =>
                v
                  ? `Linha ${Math.floor(i / 7) + 1}, coluna ${(i % 7) + 1}: jogador ${v}`
                  : "",
              )
              .filter(Boolean)
              .join("; ") || "Tabuleiro vazio"
          }
        >
          {board.map((v, i) => (
            <span key={i} className={`disc disc-${v}`}>
              {v || ""}
            </span>
          ))}
        </div>
        <div className="game-actions">
          <button
            disabled={!history.length}
            onClick={() => {
              setBoard(history[history.length - 1]);
              setHistory((h) => h.slice(0, -1));
              setTurn((t) => 3 - t);
            }}
          >
            Desfazer jogada
          </button>
          <button
            className="primary"
            onClick={() => {
              setBoard(Array(42).fill(0));
              setTurn(1);
              setHistory([]);
            }}
          >
            Nova partida
          </button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Quatro em linha</h2>
        <p>
          Jogue com outra pessoa no mesmo aparelho. Cada jogador escolhe uma
          coluna; a peça cai até o espaço livre mais baixo.
        </p>
        <p>
          Forme uma linha de quatro peças na horizontal, vertical ou diagonal.
        </p>
        <h3>Toque ou teclado</h3>
        <p>
          Toque no número da coluna. No teclado, use Tab para escolher e Enter
          para jogar. Coral começa.
        </p>
      </aside>
    </div>
  );
}
