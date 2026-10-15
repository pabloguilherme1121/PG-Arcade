import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useScopedRecord } from "./RecordScope";
import { useAutoPause } from "./useAutoPause";
import { reactionPoints, reactionSummary } from "../lib/reactionFeedback";
import "./Reaction.css";
export default function Reaction({
  record: legacyRecord,
  onRecord: saveLegacy,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [phase, setPhase] = useState<
    "ready" | "wait" | "go" | "result" | "paused" | "done"
  >("ready");
  const [round, setRound] = useState(0),
    [score, setScore] = useState(0),
    [message, setMessage] = useState("Espere o sinal verde antes de tocar.");
  const signal = useRef(0);
  const [difficulty, setDifficulty] = useState("normal");
  const [record, onRecord] = useScopedRecord(difficulty, legacyRecord, saveLegacy);
  const answered = useRef(false);
  const suppressClick = useRef(false);
  useLayoutEffect(() => {
    if (phase === "go") signal.current = performance.now();
  }, [phase]);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [falseStarts, setFalseStarts] = useState(0);
  const [resultTone, setResultTone] = useState<"none" | "early" | "valid">("none");
  const { best, average } = reactionSummary(responseTimes);
  const scoringWindow = difficulty === "easy" ? 1400 : difficulty === "hard" ? 600 : 1000;
  const pause = useCallback(
    () => setPhase((p) => (p === "wait" || p === "go" ? "paused" : p)),
    [],
  );
  useAutoPause(pause, phase === "wait" || phase === "go");
  useEffect(() => {
    if (phase !== "wait") return;
    const timer = setTimeout(
      () => {
        setPhase("go");
      },
      difficulty === "hard" ? 700 + Math.random() * 2300 : difficulty === "easy" ? 1800 + Math.random() * 1000 : 1200 + Math.random() * 1800,
    );
    return () => clearTimeout(timer);
  }, [phase, difficulty]);
  function tap() {
    if (phase === "ready" || phase === "result" || phase === "paused") {
      answered.current = false;
      setResultTone("none");
      setPhase("wait");
      return;
    }
    if ((phase !== "wait" && phase !== "go") || answered.current) return;
    answered.current = true;
    const elapsed = phase === "go" ? Math.max(0, Math.round(performance.now() - signal.current)) : null;
    const earned = elapsed !== null ? reactionPoints(elapsed, scoringWindow) : 0;
    setResultTone(elapsed === null ? "early" : "valid");
    if (elapsed !== null) {
      setLastTime(elapsed);
      setResponseTimes((times) => [...times, elapsed]);
    } else {
      setLastTime(null);
      setFalseStarts((count) => count + 1);
    }
    const next = score + earned;
    setMessage(
      elapsed !== null
        ? `${elapsed} ms. ${earned} pontos nesta rodada.`
        : "Cedo demais! Esta rodada vale zero.",
    );
    setScore(next);
    setRound((r) => r + 1);
    if (round === 4) {
      onRecord(next);
      setPhase("done");
    } else setPhase("result");
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="session-options"><label>Dificuldade do reflexo
          <select aria-label="Dificuldade do Reflexo Rápido" value={difficulty} disabled={round > 0 || phase === "wait" || phase === "go" || phase === "paused"} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Fácil · janela de 1,4 segundo</option>
            <option value="normal">Normal · janela de 1 segundo</option>
            <option value="hard">Difícil · janela de 0,6 segundo</option>
          </select>
        </label></div>
        <div className="scores">
          <div>
            Pontos<strong>{score}</strong>
          </div>
          <div>
            Rodadas<strong>{round}/5</strong>
          </div>
        </div>
        <div className="reaction-session-hud" aria-label="Estatísticas de reação">
          <div><span>Última resposta</span><strong data-reaction-last>{lastTime === null ? "—" : `${lastTime} ms`}</strong></div>
          <div><span>Melhor tempo</span><strong data-reaction-best>{best === null ? "—" : `${best} ms`}</strong></div>
          <div><span>Tempo médio</span><strong data-reaction-average>{average === null ? "—" : `${average} ms`}</strong></div>
          <div><span>Antecipações</span><strong data-reaction-false>{falseStarts}</strong></div>
        </div>
        <div className="reaction-session-progress" role="progressbar" aria-label="Rodadas do reflexo"
          aria-valuemin={0} aria-valuemax={5} aria-valuenow={round}
          aria-valuetext={`${round} de 5 rodadas concluídas`}>
          <span style={{ width: `${round / 5 * 100}%` }} />
        </div>
        <button
          className={`reaction-board reaction-${phase}`}
          data-reaction-result={resultTone}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            suppressClick.current = true;
            event.currentTarget.focus({ preventScroll: true });
            tap();
          }}
          onPointerCancel={() => { suppressClick.current = false; }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            if (!event.repeat) { suppressClick.current = false; tap(); }
          }}
          onClick={(event) => {
            if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
            suppressClick.current = false;
            if (event.detail === 0) tap();
          }}
          disabled={phase === "done"}
          aria-label={
            phase === "go"
              ? "Agora! Toque"
              : phase === "wait"
                ? "Espere o verde"
                : phase === "done"
                  ? "Desafio concluído"
                  : "Começar próxima rodada"
          }
        >
          <span>
            {phase === "go"
              ? "AGORA!"
              : phase === "wait"
                ? "Espere…"
                : phase === "done"
                  ? "Desafio concluído"
                  : phase === "paused"
                    ? "Continuar"
                    : phase === "result"
                      ? "Próxima rodada"
                      : "Começar"}
          </span>
          <small>
            {phase === "go"
              ? "Toque ou pressione Enter"
              : "Cinco chances para testar seu reflexo"}
          </small>
        </button>
        <p role="status" className="game-status">
          {message}
        </p>
        <div className="game-actions">
          <button
            onClick={() => {
              setPhase("ready");
              setRound(0);
              setScore(0);
              setResponseTimes([]);
              setLastTime(null);
              setFalseStarts(0);
              setResultTone("none");
              setMessage("Espere o sinal verde antes de tocar.");
            }}
          >
            Novo desafio
          </button>
          <button onClick={pause} disabled={phase !== "wait" && phase !== "go"}>
            Pausar
          </button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Espere. Veja. Reaja.</h2>
        <p>
          Toque quando o painel ficar verde. Quanto mais rápido, mais pontos.
          Antecipar o sinal custa a rodada. Complete cinco rodadas para salvar
          seu recorde.
        </p>
        <p>
          Toque, Enter ou espaço funcionam. Ao pausar ou sair da janela, a
          rodada espera um novo sinal, sem penalidade.
        </p>
        <p>Os tempos e a média incluem apenas toques realizados depois do sinal. Uma antecipação custa a rodada, mas não é considerada um tempo de reação. O recorde continua sendo a maior pontuação nas cinco rodadas.</p>
        <p>Recorde: {record || "—"} pontos.</p>
      </aside>
    </div>
  );
}
