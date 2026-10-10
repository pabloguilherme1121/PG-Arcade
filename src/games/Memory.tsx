import { useState, useEffect, useRef, useCallback } from "react";
import { useAutoPause } from "./useAutoPause";
import {
  Diamond,
  Heart,
  Star,
  Sun,
  Moon,
  Flame,
  Leaf,
  Zap,
  RotateCcw,
  Crown,
  Cloud,
  Music,
  Anchor,
} from "lucide-react";
import { shuffledPairs } from "../lib/engines";
const icons = [Diamond, Heart, Star, Sun, Moon, Flame, Leaf, Zap, Crown, Cloud, Music, Anchor];
const names = ["diamante", "coração", "estrela", "sol", "lua", "chama", "folha", "raio", "coroa", "nuvem", "música", "âncora"];
export default function Memory({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [peekTime, setPeekTime] = useState(900);
  const [pairs, setPairs] = useState(8);
  const [paused, setPaused] = useState(false);
  const observeLeft = useRef(900);
  const pause = useCallback(() => setPaused(true), []);
  useAutoPause(pause);
  const [cards, setCards] = useState(() => shuffledPairs(8));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState("Encontre o primeiro par.");
  const won = matched.length === pairs;
  function reset(nextPairs = pairs) {
    setPairs(nextPairs);
    setCards(shuffledPairs(nextPairs));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setPaused(false);
    setMessage("Nova partida. Encontre o primeiro par.");
  }
  useEffect(() => {
    if (open.length !== 2 || paused) return;
    const [a, b] = open;
    if (cards[a] === cards[b]) {
      if (matched.length === pairs - 1) onRecord(moves);
      setMatched((m) => [...m, cards[a]]);
      setOpen([]);
      setMessage("Par encontrado!");
    } else {
      setMessage("Não foi desta vez. Memorize as cartas.");
      const deadline = performance.now() + observeLeft.current;
      const id = setTimeout(() => setOpen([]), observeLeft.current);
      return () => {
        clearTimeout(id);
        observeLeft.current = Math.max(0, deadline - performance.now());
      };
    }
  }, [open, cards, paused, pairs, matched, moves, onRecord]);
  function flip(i: number) {
    if (
      open.length === 2 ||
      open.includes(i) ||
      matched.includes(cards[i]) ||
      paused ||
      won
    )
      return;
    setOpen((o) => [...o, i]);
    if (open.length === 1) {
      observeLeft.current = peekTime;
      setMoves((m) => m + 1);
    }
  }
  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="session-options"><label>Dificuldade da memória
          <select aria-label="Dificuldade da memória" value={pairs} onChange={(e) => reset(Number(e.target.value))}>
            <option value={4}>Fácil · 4 pares</option>
            <option value={8}>Normal · 8 pares</option>
            <option value={12}>Difícil · 12 pares</option>
          </select>
        </label></div>
        <div className="scores">
          <div>
            Jogadas<strong>{moves}</strong>
          </div>
          <div>
            Melhor partida<strong>{record || "—"}</strong>
          </div>
        </div>
        <div
          className="memory-board"
          role="group"
          aria-label={`Jogo da memória com ${pairs} pares`}
        >
          {cards.map((card, i) => {
            const visible = open.includes(i) || matched.includes(card),
              Icon = icons[card];
            return (
              <button
                key={i}
                className={`memory-card ${visible ? "revealed" : ""} ${matched.includes(card) ? "matched" : ""}`}
                disabled={
                  paused || matched.includes(card) ||
                  (open.length === 2 && !open.includes(i))
                }
                aria-label={`Carta ${i + 1}: ${visible ? names[card] : "virada"}`}
                aria-pressed={visible}
                onClick={() => flip(i)}
              >
                {visible ? <Icon size={32} /> : <span>?</span>}
              </button>
            );
          })}
        </div>
        <p className="game-status" role="status">
          {won ? `Todos os pares encontrados em ${moves} jogadas!` : paused ? "Partida pausada. As cartas abertas e o tempo de observação foram preservados." : message}
        </p>
        <div className="game-actions">
          <button disabled={won} onClick={() => setPaused((value) => !value)}>{paused ? "Continuar" : "Pausar"}</button>
          <button
            className="primary"
            onClick={() => reset()}
          >
            <RotateCcw size={18} />
            Nova partida
          </button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Como jogar</h2>
        <p>Vire duas cartas por vez e encontre os {pairs} pares. Trocar a dificuldade inicia uma partida nova.</p>
        <p>
          Cada tentativa conta como uma jogada. Quanto menos jogadas, melhor o
          recorde.
        </p>
        <hr />
        <h3>Observe e lembre</h3>
        <label htmlFor="memory-peek">
          Tempo para observar cartas diferentes
        </label>
        <select
          id="memory-peek"
          value={peekTime}
          disabled={open.length === 2}
          onChange={(e) => setPeekTime(Number(e.target.value))}
        >
          <option value={1500}>Tranquilo • 1,5 segundo</option>
          <option value={900}>Clássico • 0,9 segundo</option>
          <option value={500}>Rápido • 0,5 segundo</option>
        </select>
        <p>
          Os símbolos ajudam você a reconhecer os pares sem depender apenas de
          cores.
        </p>
        <p className="small">Use Tab e Enter para jogar com o teclado.</p>
      </aside>
    </div>
  );
}
