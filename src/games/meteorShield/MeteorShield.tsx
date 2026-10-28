import { useEffect, useState } from "react";
import {
  advanceMeteor, moveShield, newMeteorGame, nextMeteor,
  resetMeteor, undoMeteor, type Difficulty,
} from "./rules";
import "./MeteorShield.css";

export default function MeteorShield({ record, onRecord }: { record: number; onRecord: (points: number) => void }) {
  const [game, setGame] = useState(() => newMeteorGame());
  useEffect(() => {
    if (game.phase === "won" && game.score > record) onRecord(game.score);
  }, [game.phase, game.score, record, onRecord]);
  const previewIndex = Math.min(Math.floor(game.tick / 7), game.schedule.length - 1);
  return (
    <section className="meteor-shield" data-meteor-shield aria-label="Defensor de Meteoros">
      <div className="meteor-stats" role="status">
        <p>Refletidos <strong>{game.reflected}/{game.schedule.length}</strong></p>
        <p>Base <strong>{game.health}/{game.initialHealth}</strong></p>
        <p>Escudo <strong>Coluna {game.shield + 1}</strong></p>
        <p>Recorde <strong>{Math.max(record, game.score)}</strong></p>
      </div>
      <p>Defenda a base com um escudo móvel. Um meteoro cai a cada sete turnos. Você só pode mover o escudo uma casa, uma vez por turno. Posicione-o na coluna do impacto e avance a simulação: o contato reflete o meteoro de volta ao espaço. Se escapar, a base perde uma vida. Vença sobrevivendo até o fim da chuva; cada reflexo aumenta a pontuação.</p>
      <label className="meteor-difficulty">Dificuldade
        <select aria-label="Dificuldade de Defensor de Meteoros" value={game.difficulty}
          onChange={event => setGame(newMeteorGame(Number(event.target.value) as Difficulty, game.seed))}>
          <option value="0">Fácil — 4 meteoros, 3 vidas</option>
          <option value="1">Normal — 5 meteoros, 2 vidas</option>
          <option value="2">Difícil — 6 meteoros, 1 vida</option>
        </select>
      </label>
      <p className="meteor-radar" role="status">
        Radar: próxima trajetória pela coluna <strong>{game.schedule[previewIndex] + 1}</strong>.
        {" "}Turno {game.tick}. {game.movedThisTick ? "Movimento já utilizado." : "Um movimento disponível."}
      </p>
      <div className="meteor-arena" role="group" aria-label="Campo de meteoros e escudo"
        tabIndex={0} aria-describedby="meteor-keyboard-help"
        onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || game.phase !== "playing") return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            setGame(previous => moveShield(previous, event.key === "ArrowLeft" ? -1 : 1));
          } else if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            setGame(advanceMeteor);
          }
        }}>
        <div className="meteor-grid">
          {Array.from({ length: 42 }, (_, index) => {
            const column = index % 7, row = Math.floor(index / 7);
            const existing = game.meteors.filter(m => m.row === row && m.column === column);
            return <span key={index} className="meteor-cell" data-meteor-column={column} data-meteor-row={row}
              data-meteor-active={existing.length > 0}
              data-meteor-path={column === game.schedule[previewIndex]} role="img"
              aria-label={`Linha ${row + 1}, coluna ${column + 1}: ${existing.length ? existing.map(m => m.direction === "up" ? "meteoro refletido" : "meteoro caindo").join(", ") : "livre"}`}>
              {existing.length ? existing.map(m => m.direction === "up" ? "↑" : "◆").join("") : "·"}
            </span>;
          })}
        </div>
        <div className="meteor-shield-row" role="img" aria-label={`Escudo posicionado na coluna ${game.shield + 1}`}>
          {Array.from({ length: 7 }, (_, column) => <span key={column} data-shield-column={column}
            data-shield-active={column === game.shield} aria-hidden="true">{column === game.shield ? "▰" : "─"}</span>)}
        </div>
      </div>
      <div className="meteor-controls">
        <button type="button" disabled={game.phase !== "playing" || game.movedThisTick || game.shield === 0}
          onClick={() => setGame(previous => moveShield(previous, -1))}>Mover escudo à esquerda</button>
        <button type="button" disabled={game.phase !== "playing" || game.movedThisTick || game.shield === 6}
          onClick={() => setGame(previous => moveShield(previous, 1))}>Mover escudo à direita</button>
        <button type="button" disabled={game.phase !== "playing"} onClick={() => setGame(advanceMeteor)}>Avançar tempo</button>
      </div>
      <p className="meteor-feedback" role="status">{game.message} {game.phase === "won" && `${game.score} pontos.`}</p>
      <div className="meteor-actions">
        <button type="button" disabled={!game.history.length} onClick={() => setGame(undoMeteor)}>Desfazer ação</button>
        <button type="button" onClick={() => setGame(resetMeteor)}>Reiniciar</button>
        <button type="button" onClick={() => setGame(nextMeteor)}>Nova chuva</button>
      </div>
      <p className="meteor-note" id="meteor-keyboard-help">◆ queda · ↑ refletido · ▰ escudo. A coluna marcada mostra a próxima trajetória. Toque nos controles ou foque o campo: ← e → movem o escudo; Espaço ou Enter avançam um turno. Sem relógio externo.</p>
    </section>
  );
}
