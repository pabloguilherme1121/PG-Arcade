import { useState, useRef } from "react";
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
  const [state, setState] = useState(() => ({ board: new2048(), score: 0 }));
  const [previous, setPrevious] = useState<typeof state | null>(null);
  const touch = useRef<[number, number] | null>(null);
  const [announcement, setAnnouncement] = useState("");
  function move(direction: Direction) {
    const result = slide2048(state.board, direction);
    if (!result.changed) return;
    const score = state.score + result.score;
    setPrevious(state);
    setState({ board: spawn2048(result.board), score });
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
        <div className="scores">
          <div>
            Pontos<strong>{state.score}</strong>
          </div>
          <div>
            Recorde<strong>{record}</strong>
          </div>
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
        <p className="game-status" role="status">
          {over
            ? "Sem movimentos. Desfaça ou comece outra partida."
            : won
              ? "Você chegou ao 2048! Continue para superar seu recorde."
              : announcement || "Sua próxima jogada está nas suas mãos."}
        </p>
        <div className="game-actions">
          <button
            disabled={!previous}
            onClick={() => {
              if (previous) {
                setState(previous);
                setPrevious(null);
                setAnnouncement("Última jogada desfeita.");
              }
            }}
          >
            <Undo2 size={19} />
            Desfazer
          </button>
          <button
            className="primary"
            onClick={() => {
              setState({ board: new2048(), score: 0 });
              setPrevious(null);
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
        <p>Desfaça a última jogada e tente outra estratégia.</p>
        <p className="small">
          Clique no tabuleiro para usar o teclado. Seu recorde fica salvo neste
          navegador.
        </p>
      </aside>
    </div>
  );
}
