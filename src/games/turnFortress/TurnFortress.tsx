import { useEffect, useState } from "react";
import {
  advanceFortress, newFortressGame, nextFortress, resetFortress, undoFortress,
  unitPrices, type Difficulty, type UnitKind,
} from "./rules";
import "./TurnFortress.css";

const units: readonly { id: UnitKind; label: string; explanation: string }[] = [
  { id: "arco", label: "Arqueiro", explanation: "1 dano por rodada em toda a linha" },
  { id: "escudo", label: "Guarda", explanation: "2 danos apenas perto da muralha" },
  { id: "canhao", label: "Canhão", explanation: "2 danos à distância, a cada duas rodadas" },
];

export default function TurnFortress({ record, onRecord }: { record: number; onRecord: (points: number) => void }) {
  const [game, setGame] = useState(() => newFortressGame());
  const [selected, setSelected] = useState<UnitKind>("arco");
  useEffect(() => {
    if (game.phase === "won" && game.score > record) onRecord(game.score);
  }, [game.phase, game.score, record, onRecord]);

  return (
    <section className="turn-fortress" data-turn-fortress aria-label="Fortalezas de Turnos">
      <div className="fortress-stats" role="status">
        <p>Ondas <strong>{Math.min(game.turn, game.waves.length)}/{game.waves.length}</strong></p>
        <p>Muralha <strong>{game.health}/{game.initialHealth}</strong></p>
        <p>Recursos <strong>{game.resources}</strong></p>
        <p>Recorde <strong>{Math.max(game.score, record)}</strong></p>
      </div>
      <p className="fortress-instructions">Proteja três linhas. A cada turno, posicione um defensor ou avance sem construir. Os arqueiros atiram de longe; os guardas defendem a muralha e os canhões disparam em turnos alternados. Defensores permanecem no campo. Todos os invasores avançam uma casa por turno; elimine as ondas antes que destruam a muralha.</p>
      <label className="fortress-difficulty">Dificuldade
        <select aria-label="Dificuldade de Fortalezas de Turnos" value={game.difficulty}
          onChange={event => setGame(newFortressGame(Number(event.target.value) as Difficulty, game.seed))}>
          <option value="0">Fácil — 6 ondas, 6 recursos</option>
          <option value="1">Normal — 8 ondas, 7 recursos</option>
          <option value="2">Difícil — 10 ondas, 8 recursos</option>
        </select>
      </label>
      <div className="fortress-board" role="group" aria-label="Linhas de defesa e ameaças">
        {Array.from({ length: 3 }, (_, lane) => (
          <div key={lane} className="fortress-lane" data-fortress-lane={lane}>
            <strong>Linha {lane + 1}</strong>
            <div className="fortress-line" aria-label={`Linha ${lane + 1}, ${game.units.filter(u => u.lane === lane).length} defensores`}>
              <span className="fortress-gate" aria-label="Muralha" title="Muralha" aria-hidden="true">▣</span>
              {Array.from({ length: 4 }, (_, position) => {
                const enemies = game.enemies.filter(e => e.lane === lane && e.position === position);
                return <span className="fortress-tile" key={position}
                  data-fortress-enemies={enemies.length}
                  aria-label={`Coluna ${position + 1}: ${enemies.length} ameaças`}>
                  {enemies.length ? `◆${enemies.length > 1 ? enemies.length : ""}` : "·"}
                </span>;
              })}
            </div>
            <small>Defesa: {game.units.filter(u => u.lane === lane).map(u =>
              units.find(entry => entry.id === u.kind)?.label).join(", ") || "nenhuma"}
            </small>
            <button type="button" aria-label={`Defender linha ${lane + 1}`}
              disabled={game.phase !== "playing" || game.resources < unitPrices[selected] || game.units.filter(u => u.lane === lane).length >= 2}
              onClick={() => setGame(previous => advanceFortress(previous, { kind: selected, lane }))}>
              Defender linha {lane + 1}
            </button>
          </div>
        ))}
      </div>
      <fieldset className="fortress-picks" disabled={game.phase !== "playing"}>
        <legend>Selecione o defensor</legend>
        {units.map(unit => (
          <label key={unit.id}>
            <input type="radio" name="fortress-defender" value={unit.id} checked={selected === unit.id}
              onChange={() => setSelected(unit.id)} />
            <span><strong>{unit.label} — {unitPrices[unit.id]} recursos</strong><small>{unit.explanation}</small></span>
          </label>
        ))}
      </fieldset>
      <p className="fortress-feedback" role="status">{game.message}
        {" "}Ameaças ativas: {game.enemies.length}.
        {game.phase === "won" && ` Vitória! ${game.score} pontos.`}
        {game.phase === "lost" && " Derrota."}
      </p>
      <div className="fortress-actions">
        <button type="button" disabled={game.phase !== "playing"} onClick={() => setGame(previous => advanceFortress(previous, { kind: "esperar" }))}>Avançar turno</button>
        <button type="button" disabled={game.history.length === 0} onClick={() => setGame(undoFortress)}>Desfazer turno</button>
        <button type="button" onClick={() => setGame(resetFortress)}>Reiniciar</button>
        <button type="button" onClick={() => setGame(nextFortress)}>Nova batalha</button>
      </div>
      <p className="fortress-legend">Jogo solo, por turnos e offline. Use Tab e Enter ou toque para posicionar cada unidade. Sem compras reais, temporizador ou bot.</p>
    </section>
  );
}
