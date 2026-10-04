import { useState, useEffect, useRef, useCallback } from "react";
import { useAutoPause } from "./useAutoPause";
export default function Reaction({
  record,
  onRecord,
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
  const pause = useCallback(
    () => setPhase((p) => (p === "wait" || p === "go" ? "paused" : p)),
    [],
  );
  useAutoPause(pause);
  useEffect(() => {
    if (phase !== "wait") return;
    const timer = setTimeout(
      () => {
        signal.current = performance.now();
        setPhase("go");
      },
      1200 + Math.random() * 1800,
    );
    return () => clearTimeout(timer);
  }, [phase]);
  function tap() {
    if (phase === "ready" || phase === "result" || phase === "paused") {
      setPhase("wait");
      return;
    }
    if (phase !== "wait" && phase !== "go") return;
    const elapsed = Math.round(performance.now() - signal.current);
    const next = score + (phase === "go" ? Math.max(0, 1000 - elapsed) : 0);
    setMessage(
      phase === "go"
        ? `${elapsed} ms. ${Math.max(0, 1000 - elapsed)} pontos nesta rodada.`
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
        <div className="scores">
          <div>
            Pontos<strong>{score}</strong>
          </div>
          <div>
            Rodadas<strong>{round}/5</strong>
          </div>
        </div>
        <button
          className={`reaction-board reaction-${phase}`}
          onClick={tap}
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
        <p>Recorde: {record || "—"} pontos.</p>
      </aside>
    </div>
  );
}
