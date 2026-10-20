import { useCallback, useEffect, useState } from "react";
import { useAutoPause } from "../useAutoPause";
import {
  makeNeon, startNeon, turnNeon, choosePower, NEON_GRID_SIZE,
  type NeonAction, type NeonDifficulty,
} from "./rules";
import "./NeonSurvival.css";

const labels: Record<NeonDifficulty, string> = {
  easy: "Fácil · 5 escudos, hordas menores",
  normal: "Normal · 4 escudos",
  hard: "Difícil · 3 escudos, mais ameaças",
};
const arrows: Record<string, NeonAction> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right", Space: "pulse",
};

export default function NeonSurvival({ record, onRecord }: {
  record: number; onRecord: (score: number) => void;
}) {
  const [game, setGame] = useState(() => makeNeon("normal", 19));
  const pause = useCallback(() =>
    setGame(previous => previous.phase === "playing" ? { ...previous, phase: "paused" } : previous), []);
  useAutoPause(pause, game.phase === "playing", game.phase === "won" || game.phase === "lost", game.score);
  const action = useCallback((move: NeonAction) => {
    setGame(previous => turnNeon(previous, move));
  }, []);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement &&
          event.target.closest("input,select,textarea,dialog,[contenteditable='true']")) return;
      const selected = arrows[event.code] || arrows[event.key];
      if (!selected || game.phase !== "playing") return;
      event.preventDefault();
      action(selected);
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [game.phase, action]);
  useEffect(() => {
    if ((game.phase === "won" || game.phase === "lost") && game.score > 0) onRecord(game.score);
  }, [game.phase, game.score, onRecord]);

  const count = new Set(game.enemies.map(enemy => enemy.y * 9 + enemy.x));
  const status = game.phase === "ready" ? "Escolha o desafio e comece."
    : game.phase === "paused" ? "Partida pausada. Seus escudos e ondas foram preservados."
    : game.phase === "upgrade" ? "Onda concluída! Escolha um aprimoramento."
    : game.phase === "won" ? "Você sobreviveu às quatro ondas!"
    : game.phase === "lost" ? "Os escudos acabaram. Tente outra estratégia."
    : "Partida em andamento.";
  return (
    <section className="neon-survival" data-neon-survival aria-label="Sobrevivência Neon">
      <div className="neon-hud">
        <p>Onda <strong>{game.wave}/4</strong></p>
        <p>Escudos <strong>{game.lives}</strong></p>
        <p>Pontos <strong>{game.score}</strong></p>
        <p>Pulso <strong>{game.charge}/3</strong></p>
      </div>
      <p className="neon-description">Sobreviva a seis movimentos por onda. Ameaças perseguem você; recarregue o pulso movendo-se. Após cada onda, escolha um poder.</p>
      {game.phase === "ready" && (
        <div className="neon-start">
          <label>Dificuldade
            <select aria-label="Dificuldade de Sobrevivência Neon" value={game.difficulty}
              onChange={event => setGame(makeNeon(event.target.value as NeonDifficulty, game.seed))}>
              {Object.entries(labels).map(([value, text]) =>
                <option value={value} key={value}>{text}</option>)}
            </select>
          </label>
          <button onClick={() => setGame(current => startNeon(current))}>Começar sobrevivência</button>
        </div>
      )}
      <div className="neon-board" role="img"
        aria-label={"Arena 9 por 9: você está na coluna " + (game.player.x + 1)
          + ", linha " + (game.player.y + 1) + ", com " + game.enemies.length + " ameaças"}>
        {Array.from({length: NEON_GRID_SIZE * NEON_GRID_SIZE}, (_, index) => {
          const x = index % NEON_GRID_SIZE, y = Math.floor(index / NEON_GRID_SIZE);
          const player = game.player.x === x && game.player.y === y;
          const enemy = count.has(index);
          return <span key={index} aria-hidden="true" className={
            "neon-cell" + (player ? " neon-player" : "") + (enemy ? " neon-enemy" : "")
          }>{player ? "◆" : enemy ? "●" : ""}</span>;
        })}
      </div>
      {game.phase === "playing" && (
        <div className="neon-controls" aria-label="Controles da arena">
          <button onClick={() => action("left")}>← Esquerda</button>
          <button onClick={() => action("up")}>↑ Acima</button>
          <button onClick={() => action("down")}>↓ Abaixo</button>
          <button onClick={() => action("right")}>→ Direita</button>
          <button className="neon-pulse" disabled={game.charge < 3}
            onClick={() => action("pulse")}>Pulso neon</button>
        </div>
      )}
      {game.phase === "upgrade" && (
        <div className="neon-upgrades" role="group" aria-label="Melhoria da próxima onda">
          <p>Conquistou {game.wave * 30} pontos pela onda {game.wave}. Prepare a próxima!</p>
          <button onClick={() => setGame(previous => choosePower(previous, "shield"))}>
            Reforçar escudo (+1)
          </button>
          <button disabled={game.radius === 3}
            onClick={() => setGame(previous => choosePower(previous, "radius"))}>
            Ampliar pulso (+1 alcance)
          </button>
        </div>
      )}
      {game.phase === "playing" && <button className="neon-pause" onClick={pause}>Pausar</button>}
      {game.phase === "paused" && <button onClick={() => setGame(current =>
        current.phase === "paused" ? { ...current, phase: "playing" } : current)}>Continuar</button>}
      {(game.phase === "won" || game.phase === "lost") && <p>Recorde do jogo: {Math.max(record, game.score)} pontos.</p>}
      <p className="neon-status" role="status" aria-live="polite">{status}</p>
      <p className="neon-progress" role="progressbar" aria-label="Movimentos do desafio"
        aria-valuemin={0} aria-valuemax={24} aria-valuenow={game.turn}>
        {game.turn} de 24 movimentos
      </p>
      <button className="neon-restart" onClick={() => setGame(previous =>
        makeNeon(previous.difficulty, (previous.seed + 1) >>> 0))}>Reiniciar</button>
      <p className="neon-help">Teclado: setas ou WASD para mover, espaço para o pulso. No celular, use os botões de 48 px. Sair da aba pausa o jogo. Cada desafio usa quatro ondas de seis turnos; não há publicidade nem compras.</p>
    </section>
  );
}
