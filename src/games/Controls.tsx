import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { Direction } from "../lib/engines";
import "./gameplay.css";
export default function Controls({
  onMove,
  disabled = false,
}: {
  onMove: (direction: Direction) => void;
  disabled?: boolean;
}) {
  return (
    <div className="dpad" aria-label="Controles de direção">
      {(["up", "left", "down", "right"] as const).map((direction, i) => {
        const Icon = [ArrowUp, ArrowLeft, ArrowDown, ArrowRight][i];
        return (
          <button
            key={direction}
            className={direction}
            disabled={disabled}
            onClick={() => onMove(direction)}
            aria-label={
              {
                up: "Mover para cima",
                down: "Mover para baixo",
                left: "Mover para esquerda",
                right: "Mover para direita",
              }[direction]
            }
          >
            <Icon size={22} />
          </button>
        );
      })}
    </div>
  );
}
