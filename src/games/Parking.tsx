import { useState } from "react";
import { ParkingSquare } from "lucide-react";
import { parkingLevels, moveParking, parkingScore } from "../lib/actionGames";
import type { Direction } from "../lib/engines";
import Controls from "./Controls";
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
  const [message, setMessage] = useState("Leve o carro até a vaga P.");
  const config = parkingLevels[level];
  const won = position === config.goal;
  function reset(next = level) {
    setLevel(next);
    setPosition(parkingLevels[next].start);
    setMoves(0);
    setMessage("Leve o carro até a vaga P.");
  }
  function move(d: Direction) {
    if (won) return;
    const next = moveParking(position, d, config.walls);
    if (next === position) {
      setMessage("Caminho bloqueado. Procure outra direção.");
      return;
    }
    if (next === config.goal) onRecord(parkingScore(moves + 1));
    setPosition(next);
    setMoves((m) => m + 1);
    setMessage(
      `Carro na linha ${Math.floor(next / 6) + 1}, coluna ${(next % 6) + 1}.`,
    );
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="scores">
          <div>
            Movimentos<strong>{moves}</strong>
          </div>
          <div>
            Recorde<strong>{record || "—"}</strong>
          </div>
        </div>
        <div
          className="parking-board"
          role="group"
          tabIndex={0}
          aria-label="Estacionamento. Use as setas para dirigir até a vaga P."
          onKeyDown={(e) => {
            const d: Record<string, Direction> = {
              ArrowUp: "up",
              ArrowDown: "down",
              ArrowLeft: "left",
              ArrowRight: "right",
              w: "up",
              s: "down",
              a: "left",
              d: "right",
            };
            if (d[e.key]) {
              e.preventDefault();
              move(d[e.key]);
            }
          }}
        >
          {Array.from({ length: 36 }, (_, i) => (
            <span
              key={i}
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
            >
              {i === position ? (
                <img src={`${import.meta.env.BASE_URL}art/car.webp`} alt="" />
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
            ? `Estacionou! ${parkingScore(moves)} pontos em ${moves} movimentos.`
            : message}
        </p>
        <Controls onMove={move} disabled={won} />
        <div className="game-actions">
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
          Use as setas, WASD ou os controles de direção. Os três estacionamentos
          têm um caminho até a vaga.
        </p>
      </aside>
    </div>
  );
}
