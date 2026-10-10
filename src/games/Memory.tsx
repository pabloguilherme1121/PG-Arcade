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
import { memoryAccuracy, memoryFocusTarget } from "../lib/memoryFeedback";
import "./gameplay.css";
import "./Memory.css";
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
  const [streak, setStreak] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("Encontre o primeiro par.");
  const accuracy = memoryAccuracy(matched.length, moves);
  const won = matched.length === pairs;
  function reset(nextPairs = pairs) {
    setPairs(nextPairs);
    setCards(shuffledPairs(nextPairs));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setStreak(0);
    observeLeft.current = peekTime;
    setPaused(false);
    setMessage("Nova partida. Encontre o primeiro par.");
  }
  useEffect(() => {
    if (open.length !== 2 || paused) return;
    const [a, b] = open;
    if (cards[a] === cards[b]) {
      if (matched.length === pairs - 1) onRecord(moves);
      setMatched((m) => [...m, cards[a]]);
      setStreak((value) => value + 1);
      setOpen([]);
      setMessage("Par encontrado! Continue a sequência.");
    } else {
      setStreak(0);
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
        <div className="memory-stats" aria-label="Progresso na memória">
          <div><span>Pares</span><strong data-memory-pairs>{matched.length}/{pairs}</strong></div>
          <div><span>Sequência</span><strong data-memory-streak>{streak}</strong></div>
          <div><span>Precisão</span><strong data-memory-accuracy>{accuracy}%</strong></div>
        </div>
        <div className="memory-progress" role="progressbar" aria-label="Pares encontrados"
          aria-valuemin={0} aria-valuemax={pairs} aria-valuenow={matched.length}
          aria-valuetext={`${matched.length} de ${pairs} pares encontrados`}>
          <span style={{ width: `${matched.length / pairs * 100}%` }} />
        </div>
        <div
          className="memory-board"
          ref={boardRef}
          tabIndex={0}
          role="group"
          aria-label={`Jogo da memória com ${pairs} pares`}
          onKeyDown={(event) => {
            if (!event.key.startsWith("Arrow") || event.altKey || event.ctrlKey || event.metaKey) return;
            const buttons = Array.from(boardRef.current?.querySelectorAll<HTMLButtonElement>(".memory-card") ?? []);
            const from = buttons.findIndex((button) => button === event.target);
            if (from < 0) return;
            const next = memoryFocusTarget(from, event.key, buttons.map(button => button.disabled));
            if (next === null) return;
            event.preventDefault();
            buttons[next].focus();
          }}
        >
          {cards.map((card, i) => {
            const visible = open.includes(i) || matched.includes(card),
              Icon = icons[card];
            return (
              <button
                key={i}
                data-memory-index={i}
                className={`memory-card ${visible ? "revealed" : ""} ${matched.includes(card) ? "matched" : ""}`}
                disabled={
                  paused || matched.includes(card) ||
                  (open.length === 2 && !open.includes(i))
                }
                aria-label={`Carta ${i + 1}: ${visible ? names[card] : "virada"}`}
                aria-pressed={visible}
                onClick={() => flip(i)}
              >
                {visible ? <Icon size={32} /> : <span className="memory-back" aria-hidden="true"><Diamond size={28} /></span>}
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
        <p className="small">Use Tab e Enter ou as setas para percorrer a grade sem virar uma carta. A precisão é calculada por pares encontrados sobre tentativas concluídas; a sequência zera após um erro.</p>
      </aside>
    </div>
  );
}
