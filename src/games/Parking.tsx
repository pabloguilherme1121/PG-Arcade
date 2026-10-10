import { useState } from "react";
import { ParkingSquare } from "lucide-react";
import {
  parkingLevels,
  moveParking,
  parkingScore,
  parkingSteeringCost,
} from "../lib/actionGames";
import { directionFromKey, type Direction } from "../lib/engines";
import { parkingExitCells, parkingShortestPath } from "../lib/parkingFeedback";
import Controls from "./Controls";
import "./Parking.css";
export default function Parking({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [level, setLevel] = useState(0);
  const [position, setPosition] = useState(parkingLevels[0].start);
  const [moves, setMoves] = useState(0);
  const [heading, setHeading] = useState<Direction | null>(null);
  const [steeringCost, setSteeringCost] = useState(0);
  const [message, setMessage] = useState("Leve o carro até a vaga P.");
  const [showHint, setShowHint] = useState(false);
  const [history, setHistory] = useState<Array<{position: number; heading: Direction | null; moves: number; steeringCost: number}>>([]);
  const config = parkingLevels[level];
  const won = position === config.goal;
  const exits = parkingExitCells(position, config.walls);
  const route = parkingShortestPath(position, config.goal, config.walls);
  const hintCell = showHint && !won ? (route?.[1] ?? null) : null;
  const distance = route ? Math.max(0, route.length - 1) : null;
  function reset(next = level) {
    setLevel(next);
    setPosition(parkingLevels[next].start);
    setMoves(0);
    setHeading(null);
    setSteeringCost(0);
    setHistory([]);
    setShowHint(false);
    setMessage("Leve o carro até a vaga P.");
  }
  function move(d: Direction) {
    if (won) return;
    const next = moveParking(position, d, config.walls);
    if (next === position) {
      setMessage("Caminho bloqueado. Procure outra direção.");
      return;
    }
    setHistory((previous) => [...previous.slice(-79), {position, heading, moves, steeringCost}]);
    const maneuverCost = parkingSteeringCost(heading, d);
    const nextSteeringCost = steeringCost + maneuverCost;
    if (next === config.goal)
      onRecord(parkingScore(moves + 1, nextSteeringCost));
    setPosition(next);
    setMoves((m) => m + 1);
    setHeading(d);
    setSteeringCost(nextSteeringCost);
    setMessage(
      `Carro na linha ${Math.floor(next / 6) + 1}, coluna ${(next % 6) + 1}.`,
    );
  }
  function undo() {
    if (won || history.length === 0) return;
    const prior=history[history.length - 1];
    setPosition(prior.position);
    setHeading(prior.heading);
    setMoves(prior.moves);
    setSteeringCost(prior.steeringCost);
    setHistory(current=>current.slice(0,-1));
    setMessage("Manobra desfeita. Escolha seu próximo movimento.");
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Movimentos<strong>{moves}</strong>
          </div>
          <div>
            Correções<strong>{steeringCost}</strong>
          </div>
          <div>
            Recorde<strong>{record || "—"}</strong>
          </div>
        </div>
        <div className="parking-navigation-hud" aria-label="Painel do estacionamento">
          <div><span>Estacionamento</span><strong data-parking-stage>{level+1} de 3</strong></div>
          <div><span>Passos mínimos</span><strong data-parking-distance>{distance === null ? "—" : distance}</strong></div>
          <div><span>Saídas livres</span><strong data-parking-exits>{exits.length}</strong></div>
        </div>
        <div className="parking-hint-tools">
          <button type="button" aria-pressed={showHint} disabled={won}
            onClick={()=>setShowHint(current=>!current)}>{showHint ? "Ocultar dica de caminho" : "Mostrar dica de caminho"}</button>
          <span>O caminho mais curto considera os obstáculos, não o custo das manobras.</span>
        </div>
        <div
          className="parking-board"
          role="group"
          tabIndex={0}
          aria-label="Estacionamento. Use as setas ou WASD para dirigir até a vaga P."
          onKeyDown={(e) => {
            const d = directionFromKey(e.key);
            if (d) {
              e.preventDefault();
              move(d);
            }
          }}
        >
          {Array.from({ length: 36 }, (_, i) => (
            <span
              key={i}
              data-cell={i}
              data-parking-car={i === position ? "true" : undefined}
              data-parking-available={exits.includes(i) && !won ? "true" : undefined}
              data-parking-hint={i === hintCell ? "true" : undefined}
              data-parking-trail={history.some(step=>step.position===i) && i!==position ? "true" : undefined}
              className={
                config.walls.includes(i)
                  ? "parking-wall"
                  : i === position
                    ? "parking-car"
                    : i === config.goal
                      ? "parking-goal"
                      : ""
              }
              aria-label={
                i === position
                  ? "Seu carro"
                  : i === config.goal
                    ? "Vaga P"
                    : config.walls.includes(i)
                      ? "Obstáculo"
                      : "Livre"
              }
              role="img"
            >
              {i === position ? (
                <img
                  src={`${import.meta.env.BASE_URL}art/car.webp`}
                  alt=""
                  style={{
                    transform:
                      heading === "left"
                        ? "rotate(-90deg)"
                        : heading === "right"
                          ? "rotate(90deg)"
                          : heading === "down"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                  }}
                />
              ) : i === config.goal ? (
                <ParkingSquare />
              ) : config.walls.includes(i) ? (
                "▧"
              ) : (
                ""
              )}
            </span>
          ))}
        </div>
        <p className="game-status" role="status">
          {won
            ? `Estacionou! ${parkingScore(moves, steeringCost)} pontos em ${moves} movimentos e ${steeringCost} correções de direção.`
            : message}
        </p>
        <Controls onMove={move} disabled={won} />
        <div className="game-actions">
          <button onClick={undo} disabled={won || history.length===0}>Desfazer manobra</button>
          <button onClick={() => reset()}>Tentar novamente</button>
          {won && level < 2 && (
            <button className="primary" onClick={() => reset(level + 1)}>
              Próximo estacionamento
            </button>
          )}
        </div>
      </div>
      <aside className="instructions">
        <h2>Manobre com calma</h2>
        <p>
          Este é um desafio de trajetos em uma grade. Dirija seu carro até a
          vaga P, evitando os blocos. Menos movimentos rendem mais pontos.
        </p>
        <label htmlFor="parking-level">Estacionamento</label>
        <select
          id="parking-level"
          value={level}
          onChange={(e) => reset(Number(e.target.value))}
        >
          <option value={0}>1 • Primeira manobra</option>
          <option value={1}>2 • Corredores</option>
          <option value={2}>3 • Caminho estreito</option>
        </select>
        <p>
          Use as setas, WASD ou os controles de direção. As casas marcadas
          mostram as saídas livres, e uma dica opcional revela só o próximo
          passo de um caminho possível. Desfaça a última manobra quando precisar;
          o contador de movimentos e o custo de direção voltam ao estado anterior.
          Manter a mesma direção não custa correção; virar custa 1 e inverter
          para ré custa 2, então manobras mais suaves rendem mais pontos.
        </p>
      </aside>
    </div>
  );
}
