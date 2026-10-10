import { useCallback, useEffect, useRef, useState } from "react";
import { useAutoPause } from "./useAutoPause";
import "./gameplay.css";
import "./ColorSequence.css";
const colors = ["Verde", "Azul", "Rosa", "Amarelo"];
export default function ColorSequence({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    "ready" | "show" | "input" | "paused" | "done"
  >("ready");
  const [lit, setLit] = useState(-1),
    [position, setPosition] = useState(0),
    [speed, setSpeed] = useState(700);
  const [reviewUsed, setReviewUsed] = useState(false);
  const [expectedColor, setExpectedColor] = useState<string | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const pause = useCallback(
    () => setPhase((p) => (p === "show" || p === "input" ? "paused" : p)),
    [],
  );
  useAutoPause(pause);
  useEffect(() => {
    if (phase !== "show") {
      setLit(-1);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    sequence.forEach((value, index) => {
      timers.push(setTimeout(() => setLit(value), 400 + index * (speed + 250)));
      timers.push(
        setTimeout(() => setLit(-1), 400 + index * (speed + 250) + speed),
      );
    });
    timers.push(
      setTimeout(
        () => {
          setPosition(0);
          setPhase("input");
        },
        400 + sequence.length * (speed + 250),
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, sequence, speed]);
  function choose(value: number) {
    if (phase !== "input") return;
    if (sequence[position] !== value) {
      setExpectedColor(colors[sequence[position]]);
      setPhase("done");
      return;
    }
    if (position + 1 === sequence.length) {
      onRecord(sequence.length * 100);
      setReviewUsed(false);
      setExpectedColor(null);
      setSequence((s) => [...s, Math.floor(Math.random() * 4)]);
      setPhase("show");
    } else setPosition((p) => p + 1);
  }
  function start() {
    setReviewUsed(false);
    setExpectedColor(null);
    setSequence([Math.floor(Math.random() * 4)]);
    setPosition(0);
    setPhase("show");
    board.current?.focus();
  }
  function reviewPattern() {
    if (phase !== "input" || reviewUsed) return;
    setReviewUsed(true);
    setPosition(0);
    setPhase("show");
    board.current?.focus();
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Nível<strong>{sequence.length || 1}</strong>
          </div>
          <div>
            Recorde<strong>{record || "—"}</strong>
          </div>
        </div>
        <p className="game-status" role="status">
          {phase === "show"
            ? "Observe a sequência."
            : phase === "input"
              ? `Sua vez: ${position + 1} de ${sequence.length}.`
              : phase === "paused"
                ? "Pausado. Continuar repete a sequência inteira."
                : phase === "done"
                  ? `Sequência encerrada. Cor esperada: ${expectedColor ?? "—"}. Tente superar seu nível!`
                  : "Observe as cores e repita na mesma ordem."}
        </p>
        <div className="sequence-round-hud" aria-label="Progresso da sequência">
          <div><span>Rodada</span><strong data-sequence-round>{phase === "done" ? "Encerrado" : phase === "input" ? `${position} de ${sequence.length}` : phase === "show" ? "Memorize" : phase === "paused" ? "Em pausa" : "Preparar"}</strong></div>
          <div><span>Revisão</span><strong data-sequence-review>{reviewUsed ? "Revisão usada" : "Disponível"}</strong></div>
        </div>
        <div className="sequence-progress" role="progressbar" aria-label="Resposta da sequência"
          aria-valuemin={0} aria-valuemax={Math.max(1, sequence.length)} aria-valuenow={phase === "input" ? position : 0}
          aria-valuetext={phase === "input" ? `${position} de ${sequence.length} cores respondidas` : "Aguardando resposta"}>
          <span style={{width: `${phase === "input" && sequence.length ? position / sequence.length * 100 : 0}%`}} />
        </div>
        <div
          ref={board}
          tabIndex={0}
          role="group"
          aria-label="Sequência de cores. Teclas 1 a 4."
          className="sequence-board"
          onKeyDown={(e) => {
            if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.repeat && /^[1-4]$/.test(e.key)) {
              e.preventDefault();
              choose(Number(e.key) - 1);
            }
          }}
        >
          {colors.map((color, i) => (
            <button
              key={color}
              className={`sequence-pad pad-${i} ${lit === i ? "pad-lit" : ""}`}
              aria-label={`${i + 1}: ${color}`}
              aria-pressed={lit === i}
              disabled={phase !== "input"}
              onClick={() => choose(i)}
            >
              <strong>{i + 1}</strong>
              {color}
            </button>
          ))}
        </div>
        <div className="game-actions">
          <button
            className="primary"
            onClick={() => (phase === "paused" ? setPhase("show") : start())}
            disabled={phase === "show" || phase === "input"}
          >
            {phase === "paused" ? "Continuar" : "Começar"}
          </button>
          <button
            onClick={pause}
            disabled={phase !== "show" && phase !== "input"}
          >
            Pausar
          </button>
          <button onClick={reviewPattern} disabled={phase !== "input" || reviewUsed}>
            Rever sequência
          </button>
          <button
            onClick={() => {
              setSequence([]);
              setPosition(0);
              setReviewUsed(false);
              setExpectedColor(null);
              setPhase("ready");
            }}
          >
            Nova sequência
          </button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Uma cor a mais</h2>
        <p>
          Repita as cores com toque, Tab e Enter ou teclas 1 a 4 no tabuleiro.
          Cada nível concluído vale 100 pontos. Números e nomes identificam as
          cores.
        </p>
        <label>
          Tempo para observar
          <select
            aria-label="Tempo para observar"
            value={speed}
            disabled={phase !== "ready" && phase !== "done"}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={1000}>Tranquilo</option>
            <option value={700}>Normal</option>
            <option value={400}>Rápido</option>
          </select>
        </label>
        <p>
          Você pode rever o padrão uma vez a cada nível antes de completar sua resposta.
          A revisão reinicia a tentativa daquele nível e não altera os recordes.
        </p>
        <p>
          A partida pausa ao sair da janela. Ao continuar, você vê o padrão
          desde o começo, sem penalidade.
        </p>
      </aside>
    </div>
  );
}
