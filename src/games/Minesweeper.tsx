import { useState } from "react";
import { Flag, Bomb } from "lucide-react";
import { neighbors, plantMines, revealCells, chordCells } from "../lib/mines";
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
  const [mineCount, setMineCount] = useState(10);
  const won = open.length === 64 - mineCount;
  function reset() {
    setMines(null); setOpen([]); setFlags([]); setLost(false); setMoves(0); setFlagMode(false);
  }
  function finish(next: number[]) {
    if (next.length === 64 - mineCount) onRecord(Math.max(1, mineCount * 100 - (moves + 1) * 10));
    setOpen(next);
  }
  function select(cell: number, flag = flagMode) {
    if (lost || won) return;
    if (open.includes(cell)) {
      if (!mines || flag) return;
      const result = chordCells(cell, mines, open, flags);
      if (!result) return;
      setMoves((m) => m + 1);
      if (result.hitMine) setLost(true);
      else finish(result.revealed);
      return;
    }
    if (flag) {
      setFlags((f) =>
        f.includes(cell)
          ? f.filter((i) => i !== cell)
          : f.length < mineCount
            ? [...f, cell]
            : f,
      );
      return;
    }
    if (flags.includes(cell)) return;
    const field = mines || plantMines(cell, Math.random, mineCount);
    if (!mines) setMines(field);
    setMoves((m) => m + 1);
    if (field.includes(cell)) {
      setLost(true);
      return;
    }
    const next = revealCells(cell, field, open, flags);
    finish(next);
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Bandeiras<strong>{flags.length}/{mineCount}</strong>
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
                disabled={lost || won || (exposed && !count)}
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
              reset();
            }}
          >
            Novo campo
          </button>
        </div>
      </div>
      <aside className="instructions">
        <label>Dificuldade<select aria-label="Dificuldade do Campo Minado" value={mineCount} disabled={moves > 0 && !lost && !won} onChange={(e) => { setMineCount(Number(e.target.value)); reset(); }}>
          <option value={6}>Fácil · 6 minas</option><option value={10}>Normal · 10 minas</option><option value={16}>Difícil · 16 minas</option>
        </select></label>
        <h2>Pense antes de abrir</h2>
        <p>
          Os números contam minas nas oito casas vizinhas. Abra as 54 casas
          seguras no modo Normal. A dificuldade define a quantidade de minas.
        </p>
        <p>
          Ative Modo bandeira para marcar suspeitas no celular ou use o botão
          direito. Desmarque uma bandeira antes de revelar a casa. Tab e Enter
          também funcionam.
        </p>
        <p>Toque em um número aberto para revelar as casas vizinhas quando suas bandeiras corresponderem ao número. Bandeiras incorretas podem abrir uma mina.</p>
        <p>
          O primeiro toque abre uma área segura. Menos jogadas rendem mais
          pontos: cada mina vale 100 pontos de base, cada jogada custa dez.
        </p>
      </aside>
    </div>
  );
}
