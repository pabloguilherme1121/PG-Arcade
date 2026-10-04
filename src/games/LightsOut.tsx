import { useState } from "react";
import { toggleLights, lightsChallenge } from "../lib/actionGames";
export default function LightsOut({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState(() => lightsChallenge(0));
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<boolean[][]>([]);
  const won = board.every((v) => !v);
  function reset(l = level) {
    setLevel(l);
    setBoard(lightsChallenge(l));
    setMoves(0);
    setHistory([]);
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Toques<strong>{moves}</strong>
          </div>
          <div>
            Recorde<strong>{record || "—"}</strong>
          </div>
        </div>
        <div
          className="lights-board"
          role="group"
          aria-label="Luzes Out. Apague todas as luzes."
        >
          {board.map((v, i) => (
            <button
              key={i}
              className={v ? "light-on" : ""}
              aria-label={`Luz ${i + 1}: ${v ? "acesa" : "apagada"}`}
              aria-pressed={v}
              disabled={won}
              onClick={() => {
                setHistory((h) => [...h, board]);
                const next = toggleLights(board, i);
                if (next.every((v) => !v))
                  onRecord(Math.max(1, 100 - moves - 1));
                setBoard(next);
                setMoves((m) => m + 1);
              }}
            >
              <span aria-hidden="true">{v ? "☀" : "·"}</span>
            </button>
          ))}
        </div>
        <p className="game-status" role="status">
          {won
            ? `Todas apagadas! ${Math.max(1, 100 - moves)} pontos.`
            : `${board.filter(Boolean).length} luzes acesas. Pense no próximo toque.`}
        </p>
        <div className="game-actions">
          <button
            disabled={!history.length}
            onClick={() => {
              setBoard(history[history.length - 1]);
              setHistory((h) => h.slice(0, -1));
              setMoves((m) => m - 1);
            }}
          >
            Desfazer toque
          </button>
          <button onClick={() => reset()}>Recomeçar desafio</button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Apague todas</h2>
        <p>
          Cada toque alterna a luz escolhida e suas vizinhas acima, abaixo, à
          esquerda e à direita. Apague as 25 luzes usando poucos toques.
        </p>
        <label htmlFor="lights-level">Desafio</label>
        <select
          id="lights-level"
          value={level}
          onChange={(e) => reset(Number(e.target.value))}
        >
          <option value={0}>1 • Primeiros passos</option>
          <option value={1}>2 • Cantos e centro</option>
          <option value={2}>3 • Padrão cruzado</option>
        </select>
        <p>
          Todos os desafios têm solução. Use Tab e Enter; o símbolo e o estado
          anunciado também indicam se a luz está acesa.
        </p>
      </aside>
    </div>
  );
}
