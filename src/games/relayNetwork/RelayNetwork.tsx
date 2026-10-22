import { useEffect, useState } from "react";
import {
  isRelayPad, newRelayGame, nextRelay, relayCoverage, resetRelay,
  toggleRelay, undoRelay, type Difficulty,
} from "./rules";
import "./RelayNetwork.css";

export default function RelayNetwork({ record, onRecord }: { record: number; onRecord: (points: number) => void }) {
  const [game, setGame] = useState(() => newRelayGame());
  useEffect(() => {
    if (game.phase === "won" && game.score > record) onRecord(game.score);
  }, [game.phase, game.score, onRecord, record]);
  const signal = relayCoverage(game);
  return (
    <section className="relay-network" data-relay-network aria-label="Rede de Relés">
      <div className="relay-stats" role="status">
        <p>Dispositivos ativos <strong>{signal.served}/{game.devices.length}</strong></p>
        <p>Relés conectados <strong>{signal.connected}/{game.relays.length}</strong></p>
        <p>Orçamento <strong>{game.relays.length}/{game.budget}</strong></p>
        <p>Recorde <strong>{Math.max(record, game.score)}</strong></p>
      </div>
      <p className="relay-instructions">Ligue todos os dispositivos à estação-base. Instale relés somente nos pontos marcados. O sinal percorre uma cadeia de relés vizinhos, por linhas ou colunas, e cada relé conectado abastece os dispositivos a uma casa de distância. Relés isolados não transmitem.</p>
      <label className="relay-difficulty">
        Complexidade da rede
        <select aria-label="Dificuldade da Rede de Relés" value={game.difficulty}
          onChange={event => setGame(newRelayGame(Number(event.target.value) as Difficulty, game.seed))}>
          <option value="0">Fácil — grade 5×5, três relés</option>
          <option value="1">Normal — grade 6×6, quatro relés</option>
          <option value="2">Difícil — grade 7×7, cinco relés</option>
        </select>
      </label>
      <div className="relay-scroll" role="region" aria-label="Mapa de relés rolável" tabIndex={0}>
        <div className="relay-board" role="group" aria-label="Pontos de comunicação"
          style={{ gridTemplateColumns: `repeat(${game.size},minmax(0,1fr))` }}>
          {Array.from({ length: game.size ** 2 }, (_, cell) => {
            const base = cell === game.base;
            const device = game.devices.includes(cell);
            const pad = isRelayPad(game, cell);
            const placed = game.relays.includes(cell);
            const powered = signal.active.includes(cell);
            const covered = device && !signal.uncovered.includes(cell);
            return (
              <button key={cell} type="button" data-relay-cell={cell} data-relay-placed={placed}
                data-relay-powered={powered} data-relay-covered={covered}
                aria-label={`Linha ${Math.floor(cell / game.size) + 1}, coluna ${cell % game.size + 1}: ${base ? "estação-base" : device ? "dispositivo" : pad ? "local para relé" : "terreno"}${placed ? (powered ? ", relé conectado" : ", relé isolado") : ""}${covered ? ", com sinal" : ""}`}
                aria-pressed={pad ? placed : undefined}
                disabled={!pad || game.phase === "won"}
                onClick={() => setGame(previous => toggleRelay(previous, cell))}>
                <span aria-hidden="true">{base ? "◆" : placed ? "◉" : device ? (covered ? "▣" : "□") : pad ? "+" : "·"}</span>
                {base && <small>Base</small>}
                {device && <small>{covered ? "Ligado" : "Sem sinal"}</small>}
              </button>
            );
          })}
        </div>
      </div>
      <p className="relay-feedback" role="status">
        {game.phase === "won"
          ? `Todos os dispositivos conectados! Vitória com ${game.score} pontos.`
          : `Faltam ${signal.uncovered.length} dispositivos. Relés isolados: ${signal.isolated}. ${game.relays.length === game.budget ? "Limite alcançado: remova ou desfaça um relé." : "Selecione um ponto + para instalar um relé."}`}
      </p>
      <div className="relay-actions">
        <button type="button" disabled={game.history.length === 0} onClick={() => setGame(undoRelay)}>Desfazer</button>
        <button type="button" onClick={() => setGame(resetRelay)}>Reiniciar</button>
        <button type="button" onClick={() => setGame(nextRelay)}>Nova rede</button>
      </div>
      <p className="relay-legend">◆ estação-base · □ dispositivo sem sinal · + ponto livre · ◉ relé instalado. Jogue com toque, Tab e Enter. Sem bots, internet ou cronômetro.</p>
    </section>
  );
}
