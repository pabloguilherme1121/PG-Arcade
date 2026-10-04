import { useState, useEffect } from "react";
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
} from "lucide-react";
import { shuffledPairs } from "../lib/engines";
const icons = [Diamond, Heart, Star, Sun, Moon, Flame, Leaf, Zap];
export default function Memory({
  record,
  onRecord,
}: {
  record: number;
  onRecord: (n: number) => void;
}) {
  const [cards, setCards] = useState(() => shuffledPairs(8));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState("Encontre o primeiro par.");
  const won = matched.length === 8;
  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open;
    if (cards[a] === cards[b]) {
      setMatched((m) => [...m, cards[a]]);
      setOpen([]);
      setMessage("Par encontrado!");
    } else {
      setMessage("Não foi desta vez. Memorize as cartas.");
      const id = setTimeout(() => setOpen([]), 900);
      return () => clearTimeout(id);
    }
  }, [open, cards]);
  useEffect(() => {
    if (won) onRecord(moves);
  }, [won, moves, onRecord]);
  function flip(i: number) {
    if (
      open.length === 2 ||
      open.includes(i) ||
      matched.includes(cards[i]) ||
      won
    )
      return;
    setOpen((o) => [...o, i]);
    if (open.length === 1) setMoves((m) => m + 1);
  }
  return (
    <div className="game-layout">
      <div className="board-column">
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
          aria-label="Jogo da memória com oito pares"
        >
          {cards.map((card, i) => {
            const visible = open.includes(i) || matched.includes(card),
              Icon = icons[card];
            return (
              <button
                key={i}
                className={`memory-card ${visible ? "revealed" : ""} ${matched.includes(card) ? "matched" : ""}`}
                disabled={
                  matched.includes(card) ||
                  (open.length === 2 && !open.includes(i))
                }
                aria-label={`Carta ${i + 1}: ${visible ? ["diamante", "coração", "estrela", "sol", "lua", "chama", "folha", "raio"][card] : "virada"}`}
                aria-pressed={visible}
                onClick={() => flip(i)}
              >
                {visible ? <Icon size={32} /> : <span>?</span>}
              </button>
            );
          })}
        </div>
        <p className="game-status" role="status">
          {won ? `Todos os pares encontrados em ${moves} jogadas!` : message}
        </p>
        <div className="game-actions">
          <button
            className="primary"
            onClick={() => {
              setCards(shuffledPairs(8));
              setOpen([]);
              setMatched([]);
              setMoves(0);
              setMessage("Nova partida. Encontre o primeiro par.");
            }}
          >
            <RotateCcw size={18} />
            Nova partida
          </button>
        </div>
      </div>
      <aside className="instructions">
        <h2>Como jogar</h2>
        <p>Vire duas cartas por vez e encontre os oito pares.</p>
        <p>
          Cada tentativa conta como uma jogada. Quanto menos jogadas, melhor o
          recorde.
        </p>
        <hr />
        <h3>Observe e lembre</h3>
        <p>
          Os símbolos ajudam você a reconhecer os pares sem depender apenas de
          cores.
        </p>
        <p className="small">Use Tab e Enter para jogar com o teclado.</p>
      </aside>
    </div>
  );
}
