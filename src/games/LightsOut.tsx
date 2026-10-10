import { useState } from "react";
import { toggleLights, lightsChallenge } from "../lib/actionGames";
import { lightsAffectedCells, lightsFocusTarget, lightsMoveImpact } from "../lib/lightsFeedback";
import "./LightsOut.css";
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
  const [selected, setSelected] = useState(12);
  const [last, setLast] = useState<number | null>(null);
  const won = board.every((v) => !v);
  const lit = board.filter(Boolean).length;
  const affected = lightsAffectedCells(selected);
  const impact = lightsMoveImpact(board, selected);
  function reset(l = level) {
    setLevel(l);
    setBoard(lightsChallenge(l));
    setMoves(0);
    setHistory([]);
    setSelected(12);
    setLast(null);
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
        <div className="lights-premium-hud" aria-label="Situação das luzes">
          <div><span>Luzes acesas</span><strong data-lights-on>{lit}<small>/25</small></strong></div>
          <div><span>Prévia do toque</span><strong data-lights-impact>{impact.on} acendem · {impact.off} apagam</strong></div>
        </div>
        <div
          className="lights-board"
          role="group"
          aria-label="Luzes Out. Apague todas as luzes. Use setas para escolher e Enter para alternar."
          onKeyDown={(event) => {
            if (event.altKey || event.ctrlKey || event.metaKey || !event.key.startsWith("Arrow")) return;
            const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
            const index = buttons.indexOf(event.target as HTMLButtonElement);
            if (index === -1) return;
            event.preventDefault();
            const next=lightsFocusTarget(index,event.key);
            if (next !== null && !buttons[next].disabled) buttons[next].focus();
          }}
        >
          {board.map((v, i) => (
            <button
              key={i}
              className={v ? "light-on" : ""}
              data-lights-selected={selected===i ? "true" : undefined}
              data-lights-affected={affected.includes(i) && !won ? "true" : undefined}
              data-lights-last={last===i ? "true" : undefined}
              aria-label={`Luz ${i + 1}: ${v ? "acesa" : "apagada"}`}
              aria-pressed={v}
              disabled={won}
              onFocus={() => setSelected(i)}
              onPointerEnter={() => setSelected(i)}
              onClick={() => {
                setSelected(i);
                setLast(i);
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
              setLast(null);
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
          A prévia destaca a luz selecionada e as vizinhas que serão alteradas.
          Ela informa quantas acenderão ou apagarão, sem revelar a solução.
          Use as setas para navegar, Enter para jogar ou toque diretamente nas luzes.
          Todas as fases têm solução, e o símbolo e o estado anunciado indicam
          se a luz está acesa.
        </p>
      </aside>
    </div>
  );
}
