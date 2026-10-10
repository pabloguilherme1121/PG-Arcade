import { useState, useRef } from "react";
import "./gameplay.css";
import { Undo2, Play } from "lucide-react";
import {
  new2048,
  slide2048,
  spawn2048,
  canMove2048,
  directionFromKey,
  directionFromSwipe,
  type Direction,
} from "../lib/engines";
import Controls from "./Controls";
export default function Game2048({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [state, setState] = useState(() => ({ board: new2048(), score: 0, moves: 0 }));
  const [history, setHistory] = useState<(typeof state)[]>([]);
  const [difficulty, setDifficulty] = useState("normal");
  const twoChance = difficulty === "easy" ? 0.98 : difficulty === "hard" ? 0.7 : 0.9;
  const undoLimit = difficulty === "easy" ? 3 : difficulty === "normal" ? 1 : 0;
  const bestTile = Math.max(...state.board);
  const level = Math.min(11, Math.log2(bestTile || 1));
  const touch = useRef<[number, number] | null>(null);
  const [announcement, setAnnouncement] = useState("");
  function move(direction: Direction) {
    const result = slide2048(state.board, direction);
    if (!result.changed) return;
    const score = state.score + result.score;
    setHistory((current) => undoLimit ? [...current, state].slice(-undoLimit) : []);
    setState({ board: spawn2048(result.board, Math.random, twoChance), score, moves: state.moves + 1 });
    onRecord(score);
    setAnnouncement(
      result.score
        ? `Mais ${result.score} pontos. Total ${score}.`
        : "Peças movidas.",
    );
  }
  const over = !canMove2048(state.board),
    won = state.board.some((n) => n >= 2048);
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="session-options"><label>Dificuldade do 2048
          <select aria-label="Dificuldade do 2048" value={difficulty} onChange={(e) => {
            const next = e.target.value;
            setDifficulty(next);
            setState({ board: new2048(next === "easy" ? 0.98 : next === "hard" ? 0.7 : 0.9), score: 0, moves: 0 });
            setHistory([]);
            setAnnouncement("Nova partida iniciada.");
          }}>
            <option value="easy">Fácil · mais peças 2</option>
            <option value="normal">Normal · clássico</option>
            <option value="hard">Difícil · mais peças 4, sem desfazer</option>
          </select>
        </label></div>
        <div className="scores">
          <div>
            Pontos<strong>{state.score}</strong>
          </div>
          <div>
            Recorde<strong>{record}</strong>
          </div>
        </div>
        <div className="game2048-insights" aria-label="Estatísticas da partida">
          <span>Movimentos<strong data-2048-moves>{state.moves}</strong></span>
          <span>Maior peça<strong data-2048-best-tile>{bestTile}</strong></span>
          <span>Voltas disponíveis<strong data-2048-undo-count>{history.length}</strong></span>
        </div>
        <div
          className="board2048"
          role="group"
          aria-label="Tabuleiro 2048. Use as setas ou WASD para jogar."
          tabIndex={0}
          onKeyDown={(e) => {
            const d = directionFromKey(e.key);
            if (d) {
              e.preventDefault();
              move(d);
            }
          }}
          onTouchStart={(e) => {
            touch.current = e.touches.length === 1
              ? [e.touches[0].clientX, e.touches[0].clientY]
              : null;
          }}
          onTouchCancel={() => { touch.current = null; }}
          onTouchEnd={(e) => {
            if (!touch.current) return;
            const dx = e.changedTouches[0].clientX - touch.current[0],
              dy = e.changedTouches[0].clientY - touch.current[1];
            touch.current = null;
            const d = directionFromSwipe(dx, dy);
            if (d) move(d);
          }}
        >
          {state.board.map((n, i) => (
            <div
              className={`tile tile-${n}`}
              role="img"
              key={i}
              aria-label={`Casa ${i + 1}: ${n || "vazia"}`}
            >
              {n || ""}
            </div>
          ))}
        </div>
        <div className="game2048-progress" role="progressbar" aria-label="Progresso até a peça 2048" aria-valuemin={0} aria-valuemax={11} aria-valuenow={level} aria-valuetext={`Maior peça ${bestTile}, objetivo 2048`}>
          <div className="game2048-progress-copy"><span>Rumo ao 2048</span><strong>{Math.round(level / 11 * 100)}%</strong></div>
          <div className="game2048-progress-track"><span style={{ width: `${level / 11 * 100}%` }} /></div>
        </div>
        <p className="game-status" role="status">
          {over
            ? history.length ? "Sem movimentos. Desfaça ou comece outra partida." : "Sem movimentos. Comece outra partida."
            : won
              ? "Você chegou ao 2048! Continue para superar seu recorde."
              : announcement || "Sua próxima jogada está nas suas mãos."}
        </p>
        <div className="game-actions">
          <button
            disabled={!history.length || undoLimit === 0}
            onClick={() => {
              const previous = history.at(-1);
              if (!previous) return;
              setState(previous);
              setHistory((current) => current.slice(0, -1));
              setAnnouncement("Última jogada desfeita.");
            }}
          >
            <Undo2 size={19} />
            Desfazer
          </button>
          <button
            className="primary"
            onClick={() => {
              setState({ board: new2048(twoChance), score: 0, moves: 0 });
              setHistory([]);
              setAnnouncement("Nova partida iniciada.");
            }}
          >
            <Play size={18} />
            Nova partida
          </button>
        </div>
        <Controls onMove={move} disabled={over} />
      </div>
      <aside className="instructions">
        <h2>Como jogar</h2>
        <p>Junte números iguais para chegar ao 2048.</p>
        <p>Use as setas ou WASD no teclado, ou deslize no tabuleiro.</p>
        <hr />
        <h3>No seu ritmo</h3>
        <p>No fácil, desfaça até três jogadas. No normal, desfaça uma. No difícil, jogue sem desfazer. O recorde não é apagado ao voltar uma jogada.</p>
        <p className="small">
          Clique no tabuleiro para usar o teclado. Seu recorde fica salvo neste
          navegador.
        </p>
      </aside>
    </div>
  );
}
