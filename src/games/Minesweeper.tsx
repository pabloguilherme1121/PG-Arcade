import { useState } from "react";
import { Flag, Bomb } from "lucide-react";
import { neighbors, plantMines, revealCells } from "../lib/mines";
export default function Minesweeper({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [mines, setMines] = useState<number[] | null>(null),
    [open, setOpen] = useState<number[]>([]),
    [flags, setFlags] = useState<number[]>([]);
  const [flagMode, setFlagMode] = useState(false),
    [lost, setLost] = useState(false),
    [moves, setMoves] = useState(0);
  const won = open.length === 54;
  function select(cell: number, flag = flagMode) {
    if (lost || won || open.includes(cell)) return;
    if (flag) {
      setFlags((f) =>
        f.includes(cell)
          ? f.filter((i) => i !== cell)
          : f.length < 10
            ? [...f, cell]
            : f,
      );
      return;
    }
    if (flags.includes(cell)) return;
    const field = mines || plantMines(cell);
    if (!mines) setMines(field);
    setMoves((m) => m + 1);
    if (field.includes(cell)) {
      setLost(true);
      return;
    }
    const next = revealCells(cell, field, open, flags);
    if (next.length === 54) onRecord(Math.max(1, 1000 - (moves + 1) * 10));
    setOpen(next);
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Bandeiras<strong>{flags.length}/10</strong>
          </div>
          <div>
            Recorde<strong>{record || "—"}</strong>
          </div>
        </div>
        <div
          className="mines-board"
          role="group"
          aria-label="Campo minado, oito linhas e oito colunas"
        >
          {Array.from({ length: 64 }, (_, i) => {
            const count = mines
              ? neighbors(i).filter((n) => mines.includes(n)).length
              : 0;
            const exposed = open.includes(i);
            return (
              <button
                key={i}
                className={exposed ? `mine-open mine-${count}` : ""}
                disabled={lost || won || exposed}
                aria-label={`Casa ${i + 1}: ${lost && mines?.includes(i) ? "mina" : flags.includes(i) ? "marcada" : exposed ? `${count} minas vizinhas` : "fechada"}`}
                onClick={() => select(i)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  select(i, true);
                }}
              >
                {lost && mines?.includes(i) ? (
                  <Bomb />
                ) : flags.includes(i) ? (
                  <Flag />
                ) : exposed ? (
                  count || ""
                ) : (
                  ""
                )}
              </button>
            );
          })}
        </div>
        <p role="status" className="game-status">
          {won
            ? `Campo limpo! ${moves} jogadas.`
            : lost
              ? "Uma mina! Tente um novo campo."
              : "Abra as casas seguras. O primeiro toque sempre é seguro."}
        </p>
        <div className="game-actions">
          <button
            aria-pressed={flagMode}
            onClick={() => setFlagMode((m) => !m)}
          >
            {flagMode ? "Modo bandeira" : "Modo revelar"}
          </button>
          <button
            onClick={() => {
              setMines(null);
              setOpen([]);
              setFlags([]);
              setLost(false);
              setMoves(0);
              setFlagMode(false);
            }}
          >
            Novo campo
          </button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Pense antes de abrir</h2>
        <p>
          Os números contam minas nas oito casas vizinhas. Abra as 54 casas
          seguras para vencer. São dez minas.
        </p>
        <p>
          Ative Modo bandeira para marcar suspeitas no celular ou use o botão
          direito. Desmarque uma bandeira antes de revelar a casa. Tab e Enter
          também funcionam.
        </p>
        <p>
          O primeiro toque abre uma área segura. Menos jogadas rendem mais
          pontos.
        </p>
      </aside>
    </div>
  );
}
