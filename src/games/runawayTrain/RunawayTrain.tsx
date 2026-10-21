import { useEffect, useState } from "react";
import {
  advanceTrain, newTrainGame, nextTrain, resetTrain, toggleRailSwitch, undoTrain,
  type Difficulty,
} from "./rules";
import "./RunawayTrain.css";

export default function RunawayTrain({ record, onRecord }: { record: number; onRecord: (points: number) => void }) {
  const [game, setGame] = useState(() => newTrainGame());
  useEffect(() => {
    if (game.phase === "won" && game.score > record) onRecord(game.score);
  }, [game.phase, game.score, record, onRecord]);

  return (
    <section className="runaway-train" data-runaway-train aria-label="Trem Sem Freio">
      <div className="train-stats" role="status">
        <p>Entregas <strong>{game.delivered}/{game.schedule.length}</strong></p>
        <p>Turno <strong>{game.turn}</strong></p>
        <p>Trocas <strong>{game.flips}/{game.flipBudget}</strong></p>
        <p>Recorde <strong>{Math.max(record, game.score)}</strong></p>
      </div>
      <p className="train-instructions">Trens saem a cada dois turnos e avançam uma casa. Ajuste os desvios nas colunas 2 e 4 antes de clicar em Avançar tráfego. Cada desvio ligado troca o trilho de todo trem que passar por ele. Entregue as cargas na estação indicada e evite colisões: descarregar ocupa a plataforma por três turnos.</p>
      <label className="train-difficulty">Dificuldade
        <select aria-label="Dificuldade do Trem Sem Freio" value={game.difficulty}
          onChange={event => setGame(newTrainGame(Number(event.target.value) as Difficulty, game.seed))}>
          <option value="0">Fácil — 3 trens</option>
          <option value="1">Normal — 4 trens</option>
          <option value="2">Difícil — 5 trens</option>
        </select>
      </label>
      <div className="train-board" role="group" aria-label="Ferrovias, desvios e plataformas">
        {([0, 1] as const).map(lane => (
          <div className="train-lane" key={lane}>
            <strong>Trilho {lane + 1}</strong>
            <div className="train-track">
              {Array.from({ length: 6 }, (_, position) => {
                const at = game.trains.filter(t => t.lane === lane && t.position === position);
                const station = position === 5;
                return <span className="train-cell" key={position}
                  data-train-position={position} data-train-lane={lane} data-train-count={at.length}
                  data-train-junction={position === 2 || position === 4}
                  role="img" aria-label={at.length
                    ? `Trilho ${lane + 1}, coluna ${position + 1}: ${at.map(t => `Trem ${t.id + 1}, destino estação ${t.destination + 1}`).join("; ")}`
                    : `Trilho ${lane + 1}, coluna ${position + 1}, ${station ? "plataforma" : "livre"}`}>
                  {at.length ? `▰${at.length > 1 ? at.length : ""}` : station ? "▣" : position === 2 || position === 4 ? "◇" : "—"}
                </span>;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="train-switches" role="group" aria-label="Controle de desvios">
        {game.switches.map((crossed, junction) => (
          <button type="button" key={junction} data-train-switch={junction} aria-pressed={crossed}
            disabled={game.phase !== "playing" || game.flips >= game.flipBudget}
            onClick={() => setGame(previous => toggleRailSwitch(previous, junction))}>
            Desvio {junction + 1}: {crossed ? "Cruzar trilhos" : "Seguir reto"}
          </button>
        ))}
      </div>
      <div className="train-manifest" aria-label="Manifesto de cargas">
        <strong>Itinerário</strong>
        <ul>{game.schedule.map(departure => (
          <li key={departure.id}>
            Trem {departure.id + 1}: trilho {departure.startLane + 1} → estação {departure.destination + 1}
            {departure.id < game.delivered ? " — entregue" : ""}
          </li>
        ))}</ul>
      </div>
      <p className="train-feedback" role="status">{game.message}
        {game.phase === "won" && ` ${game.score} pontos.`}
        {game.phase === "lost" && " Derrota; revise o tráfego ou desfaça a última decisão."}
      </p>
      <div className="train-actions">
        <button type="button" disabled={game.phase !== "playing"} onClick={() => setGame(advanceTrain)}>Avançar tráfego</button>
        <button type="button" disabled={!game.history.length} onClick={() => setGame(undoTrain)}>Desfazer ação</button>
        <button type="button" onClick={() => setGame(resetTrain)}>Reiniciar</button>
        <button type="button" onClick={() => setGame(nextTrain)}>Nova rota</button>
      </div>
      <p className="train-legend">▰ trem · ◇ desvio · ▣ estação. Jogo de lógica e tempo de reação por turnos, offline, com teclado e toque. Sem bots ou compras.</p>
    </section>
  );
}
