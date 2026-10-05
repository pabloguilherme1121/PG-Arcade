import { useCallback, useEffect, useState } from "react";
import { useAutoPause } from "./useAutoPause";
import {
  casualGames,
  handValue,
  dealerShouldHit,
  card,
  diceScore,
  makeJewels,
  swapJewels,
  settleJewels,
  hasJewelMove,
  projectile,
  basketHit,
  arrowImpact,
  arrowPoints,
  bowlingHit,
  golfStroke,
  type FlightPoint,
  moveGridCursor,
} from "../lib/casualCollection";
import "./casualCollection.css";
type Options = { difficulty: number; mode: string };
type PlayProps = {
  options: Options;
  round: number;
  onRound: (points: number, message: string) => void;
};
export default function CasualCollection({
  gameId,
  record,
  onRecord,
}: {
  gameId: string;
  record: number;
  onRecord: (n: number) => void;
}) {
  const game = casualGames.find((g) => g.id === gameId) ?? casualGames[0];
  const [difficulty, setDifficulty] = useState(1),
    [mode, setMode] = useState("classico"),
    [started, setStarted] = useState(false),
    [round, setRound] = useState(1),
    [score, setScore] = useState(0),
    [notice, setNotice] = useState("Escolha o formato da sua sessão."),
    [session, setSession] = useState(0),
    [done, setDone] = useState(false);
  const total = mode === "treino" ? 5 : mode === "maratona" ? 15 : 10;
  function finish(points: number, message: string) {
    const next = score + points;
    setScore(next);
    setNotice(message);
    if (round >= total) {
      setDone(true);
      if (next > record) onRecord(next);
    } else setRound(round + 1);
  }
  const options = { difficulty, mode };
  const props = { options, round, onRound: finish };
  return (
    <section className="casual-suite">
      <div className="casual-options">
        <label>
          Dificuldade
          <select
            aria-label="Dificuldade"
            value={difficulty}
            disabled={started && !done}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          >
            <option value={0}>Fácil</option>
            <option value={1}>Normal</option>
            <option value={2}>Difícil</option>
          </select>
        </label>
        <label>
          Formato
          <select
            aria-label="Formato da sessão"
            value={mode}
            disabled={started && !done}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="treino">Treino · 5 rodadas</option>
            <option value="classico">Clássico · 10 rodadas</option>
            <option value="maratona">Maratona · 15 rodadas</option>
          </select>
        </label>
      </div>
      <div className="casual-hud">
        <span>
          Rodada{" "}
          <strong>
            {Math.min(round, total)} / {total}
          </strong>
        </span>
        <span>
          Pontos <strong>{score}</strong>
        </span>
        <span>
          Recorde <strong>{record}</strong>
        </span>
      </div>
      <p>{game.help}</p>
      <p role="status" aria-live="polite">
        {done ? `Sessão concluída com ${score} pontos. ${notice}` : notice}
      </p>
      {!started || done ? (
        <button
          className="casual-primary"
          onClick={() => {
            setStarted(true);
            setDone(false);
            setScore(0);
            setRound(1);
            setSession(session + 1);
            setNotice(
              "Sessão iniciada. Cada rodada contribui para seu placar.",
            );
          }}
        >
          {done ? "Nova sessão" : "Iniciar sessão"}
        </button>
      ) : (
        <div key={`${session}-${round}`}>
          {game.id === "vinteum" ? (
            <Blackjack {...props} />
          ) : game.id === "dados" ? (
            <Dice {...props} />
          ) : game.id === "match3" ? (
            <Jewels {...props} />
          ) : game.id === "pesca" ? (
            <Fishing {...props} />
          ) : (
            <Sport {...props} kind={game.id} />
          )}
        </div>
      )}
    </section>
  );
}
function Blackjack({ options, onRound }: PlayProps) {
  const [hand, setHand] = useState(() => [card(), card()]),
    [dealer, setDealer] = useState(() => [card(), card()]),
    [settled, setSettled] = useState(false),
    [result, setResult] = useState(""),
    [points, setPoints] = useState(0);
  function settle(player: number[]) {
    let bank = [...dealer];
    while (dealerShouldHit(bank, options.difficulty) && bank.length < 12)
      bank.push(card());
    const a = handValue(player),
      b = handValue(bank);
    const win = a <= 21 && (b > 21 || a > b);
    const tie = a === b && a <= 21;
    const earned = win
      ? a === 21 && player.length === 2
        ? 150
        : 100
      : tie
        ? 40
        : 0;
    setDealer(bank);
    setPoints(earned);
    setResult(
      a > 21
        ? "Você ultrapassou 21."
        : win
          ? "Você venceu a banca."
          : tie
            ? "Empate."
            : "A banca venceu.",
    );
    setSettled(true);
  }
  function hit() {
    const next = [...hand, card()];
    setHand(next);
    if (handValue(next) >= 21) settle(next);
  }
  const label = (v: number) =>
    v === 1
      ? "A"
      : v === 11
        ? "J"
        : v === 12
          ? "Q"
          : v === 13
            ? "K"
            : String(v);
  return (
    <div
      className="card-table"
      data-expanded-board
      tabIndex={0}
      aria-label="Mesa de vinte e um"
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget || settled) return;
        if (e.key.toLowerCase() === "c") {
          e.preventDefault();
          hit();
        }
        if (e.key.toLowerCase() === "p") {
          e.preventDefault();
          settle(hand);
        }
      }}
    >
      <h3>
        Banca ·{" "}
        {settled || options.difficulty === 0
          ? handValue(dealer)
          : "uma carta oculta"}
      </h3>
      <div className="playing-cards">
        {dealer.map((v, i) => (
          <span
            className={!settled && options.difficulty > 0 && i > 0 ? "card-back" : ""}
            key={i}
          >
            {!settled && options.difficulty > 0 && i > 0 ? "?" : label(v)}
          </span>
        ))}
      </div>
      <h3>Sua mão · {handValue(hand)}</h3>
      <div className="playing-cards">
        {hand.map((v, i) => (
          <span key={i}>{label(v)}</span>
        ))}
      </div>
      {settled ? (
        <>
          <p>
            {result} +{points} pontos
          </p>
          <button onClick={() => onRound(points, result)}>
            Próxima rodada
          </button>
        </>
      ) : (
        <div className="casual-controls">
          <button onClick={hit}>Comprar carta (C)</button>
          <button onClick={() => settle(hand)}>Parar (P)</button>
        </div>
      )}
    </div>
  );
}
function Dice({ options, onRound }: PlayProps) {
  const [dice, setDice] = useState([1, 2, 3, 4, 5]),
    [kept, setKept] = useState<boolean[]>([false, false, false, false, false]),
    [rolls, setRolls] = useState(0);
  const max = 4 - options.difficulty;
  return (
    <div
      className="dice-table"
      data-expanded-board
      tabIndex={0}
      aria-label="Mesa de dados"
    >
      <p>
        Lançamentos: {rolls} / {max}. Guarde os dados entre lançamentos.
      </p>
      <div className="dice-row">
        {dice.map((v, i) => (
          <button
            key={i}
            aria-label={`Dado ${i + 1}: ${v}${kept[i] ? ", guardado" : ""}`}
            aria-pressed={kept[i]}
            disabled={!rolls}
            onClick={() => setKept(kept.map((k, n) => (n === i ? !k : k)))}
          >
            <svg viewBox="0 0 60 60" aria-hidden="true">
              {Array.from({ length: v }, (_, n) => (
                <circle
                  key={n}
                  cx={v === 1 ? 30 : 15 + (n % 2) * 30}
                  cy={v === 1 ? 30 : 12 + Math.floor(n / 2) * 18}
                  r="4"
                />
              ))}
            </svg>
            <small>{kept[i] ? "Guardado" : "Livre"}</small>
          </button>
        ))}
      </div>
      <div className="casual-controls">
        <button
          disabled={rolls >= max}
          onClick={() => {
            setDice(
              dice.map((v, i) =>
                kept[i] ? v : 1 + Math.floor(Math.random() * 6),
              ),
            );
            setRolls(rolls + 1);
          }}
        >
          Lançar dados
        </button>
        <button
          disabled={!rolls}
          onClick={() =>
            onRound(
              diceScore(dice),
              `Combinação vale ${diceScore(dice)} pontos.`,
            )
          }
        >
          Registrar combinação
        </button>
      </div>
    </div>
  );
}
function Jewels({ options, onRound }: PlayProps) {
  const [board, setBoard] = useState(() => makeJewels()),
    [selected, setSelected] = useState<number | null>(null),
    [moves, setMoves] = useState(
      options.difficulty === 0 ? 12 : options.difficulty === 1 ? 10 : 8,
    ),
    [score, setScore] = useState(0),
    [message, setMessage] = useState("Escolha duas joias vizinhas."),
    [cursor, setCursor] = useState(0);
  const colors = ["#41d6bc", "#b38aff", "#ffb84e", "#ff7597", "#69b6ff"];
  function choose(i: number) {
    if (!moves) return;
    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    const swapped = swapJewels(board, selected, i);
    setSelected(null);
    if (!swapped) {
      setMessage("Troca inválida: forme três joias em linha.");
      return;
    }
    const result = settleJewels(swapped);
    setScore(score + result.score);
    setMoves(moves - 1);
    if (hasJewelMove(result.board)) setBoard(result.board);
    else {
      setBoard(makeJewels());
      setMessage("Sem trocas disponíveis: novas joias foram distribuídas.");
      return;
    }
    setMessage(`${result.chains} cascata(s), +${result.score} pontos.`);
  }
  return (
    <div>
      <div
        className="jewel-board"
        data-expanded-board
        tabIndex={0}
        aria-label="Tabuleiro de joias. Use setas e Enter."
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            setCursor(moveGridCursor(cursor, e.key, 6, 36));
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            choose(cursor);
          }
        }}
      >
        {board.map((v, i) => (
          <button
            key={i}
            className={`${selected === i ? "selected" : ""} ${cursor === i ? "cursor" : ""}`}
            aria-label={`Joia ${i + 1}, tipo ${v + 1}`}
            aria-pressed={selected === i}
            disabled={!moves}
            onClick={() => {
              setCursor(i);
              choose(i);
            }}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill={colors[v]}
                stroke="#fff8"
                d="M24 4 43 16 36 39 12 39 5 16Z"
              />
              <path fill="#ffffff38" d="M24 4 24 24 5 16Z" />
              <text
                x="24"
                y="30"
                textAnchor="middle"
                fill="#101722"
                fontSize="17"
                fontWeight="bold"
              >
                {v + 1}
              </text>
            </svg>
          </button>
        ))}
      </div>
      <p role="status">
        {message} · {moves} jogadas · {score} pontos
      </p>
      <button
        disabled={moves > 0}
        onClick={() => onRound(score, `Joias: ${score} pontos na rodada.`)}
      >
        Concluir rodada
      </button>
    </div>
  );
}
function Fishing({ options, onRound }: PlayProps) {
  const [phase, setPhase] = useState<
      "ready" | "waiting" | "bite" | "reel" | "paused" | "result"
    >("ready"),
    [resume, setResume] = useState<"waiting" | "bite" | "reel">("waiting"),
    [tick, setTick] = useState(0),
    [tension, setTension] = useState(20),
    [distance, setDistance] = useState(100),
    [points, setPoints] = useState(0),
    [message, setMessage] = useState("Lance a linha para começar.");
  const pause = useCallback(
    () =>
      setPhase((p) => {
        if (p === "waiting" || p === "bite" || p === "reel") {
          setResume(p);
          return "paused";
        }
        return p;
      }),
    [],
  );
  useAutoPause(pause);
  useEffect(() => {
    if (!["waiting", "bite", "reel"].includes(phase)) return;
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      if (phase === "reel")
        setTension((t) => Math.max(0, t - (options.difficulty === 2 ? 3 : 5)));
    }, 150);
    return () => clearInterval(timer);
  }, [phase, options.difficulty]);
  useEffect(() => {
    if (phase === "waiting" && tick >= 18 + options.difficulty * 6) {
      setPhase("bite");
      setTick(0);
      setMessage("Mordida! Fisgue agora.");
    }
    if (phase === "bite" && tick > 10 - options.difficulty * 2) {
      setPhase("result");
      setMessage("O peixe soltou a isca.");
    }
  }, [tick, phase, options.difficulty]);
  function action() {
    if (phase === "ready") {
      setPhase("waiting");
      setTick(0);
      setMessage("Observe a boia...");
    } else if (phase === "waiting") {
      setPhase("result");
      setMessage("Você puxou antes da mordida.");
    } else if (phase === "bite") {
      setPhase("reel");
      setTick(0);
      setMessage("Recolha devagar. Faça pausas para reduzir a tensão.");
    } else if (phase === "reel") {
      const nextT = tension + 22 + options.difficulty * 3;
      const nextD = distance - 13;
      if (nextT >= 100) {
        setPhase("result");
        setMessage("A linha rompeu por excesso de tensão.");
      } else if (nextD <= 0) {
        setPoints(150 + options.difficulty * 30);
        setPhase("result");
        setMessage("Peixe capturado!");
      }
      setTension(Math.min(100, nextT));
      setDistance(Math.max(0, nextD));
    }
  }
  return (
    <div
      className="fishing-scene"
      data-expanded-board
      tabIndex={0}
      aria-label="Lago de pesca"
      onKeyDown={(e) => {
        if (
          e.target === e.currentTarget &&
          (e.key === " " || e.key === "Enter")
        ) {
          e.preventDefault();
          action();
        }
      }}
    >
      <svg viewBox="0 0 360 220" aria-hidden="true">
        <path fill="#213d2e" d="M0 0H360V100Q280 40 210 90T0 70Z" />
        <path fill="#236b83" d="M0 80Q100 120 200 85T360 100V220H0Z" />
        <path stroke="#dbfaff" strokeWidth="2" d="M20 30 210 100" />
        <ellipse
          cx="210"
          cy={phase === "bite" ? 120 : 100}
          rx="7"
          ry="10"
          fill={phase === "bite" ? "#b9f86e" : "#fb725e"}
        />
        <path
          fill="#f4b761"
          d={`M${distance + 70} 170q30 -25 50 0q-20 25 -50 0l-14 12v-24Z`}
        />
      </svg>
      <p role="status">{message}</p>
      <label>
        Tensão {tension}%
        <meter
          min={0}
          max={100}
          low={50}
          high={80}
          optimum={25}
          value={tension}
        />
      </label>
      <p>Distância: {distance}%</p>
      {phase === "paused" ? (
        <button onClick={() => setPhase(resume)}>Continuar pesca</button>
      ) : phase === "result" ? (
        <button onClick={() => onRound(points, message)}>Próxima rodada</button>
      ) : (
        <button onClick={action}>
          {phase === "ready"
            ? "Lançar linha"
            : phase === "waiting" || phase === "bite"
              ? "Fisgar"
              : "Recolher linha"}
        </button>
      )}
      {(phase === "waiting" || phase === "bite" || phase === "reel") && (
        <button onClick={pause}>Pausar</button>
      )}
    </div>
  );
}
function Sport({
  kind,
  options,
  round,
  onRound,
}: PlayProps & { kind: string }) {
  const [aim, setAim] = useState(
      kind === "arco" ? 150 : kind === "basquete" ? 60 : 50,
    ),
    [power, setPower] = useState(kind === "basquete" ? 90 : 65),
    [trajectory, setTrajectory] = useState<FlightPoint[]>([]),
    [result, setResult] = useState(""),
    [finished, setFinished] = useState(false),
    [points, setPoints] = useState(0),
    [pins, setPins] = useState<boolean[]>(Array(10).fill(true)),
    [attempt, setAttempt] = useState(0),
    [position, setPosition] = useState(35);
  const wind =
    options.mode === "treino"
      ? 0
      : (((round * 7) % 13) - 6) * (options.difficulty + 1);
  const allowed =
    kind === "golfe" ? 6 - options.difficulty : kind === "boliche" ? 2 : 1;
  function launch() {
    if (finished) return;
    let earned = 0,
      message = "",
      ended = true;
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    if (kind === "basquete") {
      const flight = projectile(aim, power, wind);
      setTrajectory(flight);
      earned = basketHit(flight, 16 - options.difficulty * 4) ? 100 : 0;
      message = earned ? "Cesta!" : "A bola passou fora do aro.";
    } else if (kind === "arco") {
      const y = arrowImpact(aim, power, wind);
      setTrajectory([
        { x: 30, y: 150 },
        { x: 305, y },
      ]);
      earned = arrowPoints(y, 1 + options.difficulty * 0.4);
      message = `Flecha a ${Math.round(Math.abs(y - 150))} cm do centro.`;
    } else if (kind === "boliche") {
      const remaining = bowlingHit(pins, aim, power, options.difficulty);
      const count =
        pins.filter(Boolean).length - remaining.filter(Boolean).length;
      earned = points + count * 10;
      setPins(remaining);
      ended = nextAttempt >= 2 || remaining.every((p) => !p);
      if (ended && remaining.every((p) => !p))
        earned += nextAttempt === 1 ? 50 : 20;
      setTrajectory([
        { x: 150, y: 240 },
        { x: 150 + (aim - 50) * 1.8, y: 70 },
      ]);
      message = remaining.every((p) => !p)
        ? nextAttempt === 1
          ? "Strike!"
          : "Spare!"
        : `${count} pinos derrubados.`;
    } else {
      const stroke = golfStroke(position, aim, power, options.difficulty > 0);
      setTrajectory([
        { x: position, y: 210 },
        { x: stroke.position, y: 210 },
      ]);
      setPosition(stroke.position);
      ended = stroke.hole || nextAttempt >= allowed;
      earned = stroke.hole ? Math.max(30, 160 - nextAttempt * 20) : 0;
      message = stroke.hole
        ? "Bola no buraco!"
        : nextAttempt >= allowed
          ? "Limite de tacadas atingido."
          : "Planeje a próxima tacada.";
    }
    setPoints(earned);
    setResult(message);
    setFinished(ended);
  }
  return (
    <div className={`sport-scene sport-${kind}`}>
      <div
        data-expanded-board
        tabIndex={0}
        aria-label="Campo de jogo. Setas ajustam a mira; Enter lança."
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget || finished) return;
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            setAim((v) =>
              Math.max(
                kind === "arco" ? 50 : 0,
                Math.min(
                  kind === "arco" ? 250 : 100,
                  v + (e.key === "ArrowLeft" ? -2 : 2),
                ),
              ),
            );
          }
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            setPower((v) =>
              Math.max(10, Math.min(100, v + (e.key === "ArrowUp" ? 2 : -2))),
            );
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            launch();
          }
        }}
      >
        <svg
          viewBox="0 0 360 280"
          role="img"
          aria-label={result || "Ajuste a mira e lance"}
        >
          <defs>
            <linearGradient id={`field-${kind}`} x2="0" y2="1">
              <stop
                stopColor={
                  kind === "golfe"
                    ? "#317043"
                    : kind === "boliche"
                      ? "#bc8d5f"
                      : "#254759"
                }
              />
              <stop
                offset="1"
                stopColor={
                  kind === "golfe"
                    ? "#153d28"
                    : kind === "boliche"
                      ? "#563624"
                      : "#0c1f2e"
                }
              />
            </linearGradient>
          </defs>
          <rect width="360" height="280" rx="16" fill={`url(#field-${kind})`} />
          {kind === "boliche" ? (
            <>
              <path fill="#dbb481" d="M115 30H185L260 280H40Z" />
              {pins.map((standing, i) => {
                const row = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2);
                const x = 150 + (i - (row * (row + 1)) / 2 - row / 2) * 28;
                return standing ? (
                  <g key={i}>
                    <ellipse
                      cx={x}
                      cy={60 + row * 18}
                      rx="8"
                      ry="12"
                      fill="#eee7dc"
                    />
                    <path
                      d={`M${x - 5} ${55 + row * 18}h10`}
                      stroke="#dd4d3b"
                      strokeWidth="3"
                    />
                  </g>
                ) : null;
              })}
              <circle cx="150" cy="242" r="12" fill="#232741" />
            </>
          ) : kind === "basquete" ? (
            <>
              <path
                d="M0 250H360M320 25V250"
                stroke="#bec7c0"
                strokeWidth="3"
              />
              <rect x="297" y="80" width="30" height="52" fill="#e4e5d2" />
              <path
                d="M271 125H299M275 125l5 30h10l5-30"
                stroke="#fb986a"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="35" cy="245" r="11" fill="#ec8f42" />
            </>
          ) : kind === "arco" ? (
            <>
              {[45, 34, 23, 12].map((r, i) => (
                <circle
                  key={i}
                  cx="305"
                  cy="150"
                  r={r}
                  fill={["#eee5d2", "#3597b4", "#e56157", "#f7c758"][i]}
                />
              ))}
              <path
                d="M20 105Q65 150 20 195L20 105"
                fill="none"
                stroke="#dba15e"
                strokeWidth="5"
              />
            </>
          ) : (
            <>
              <path d="M15 225H340" stroke="#97c66a" strokeWidth="2" />
              {options.difficulty > 0 && (
                <rect x="176" y="170" width="14" height="50" fill="#8e7864" />
              )}
              <ellipse cx="320" cy="213" rx="12" ry="5" fill="#071a12" />
              <path d="M320 213V125l24 10-24 10" stroke="#fff" fill="#f49a55" />
              <circle cx={position} cy="210" r="7" fill="#eee" />
            </>
          )}
          {trajectory.length > 0 && (
            <polyline
              points={trajectory.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#c2fc86"
              strokeWidth="3"
              strokeDasharray="5 4"
            />
          )}
        </svg>
      </div>
      <div className="casual-sliders">
        <label>
          {kind === "arco"
            ? "Altura da mira"
            : kind === "golfe"
              ? "Direção (50 = reto)"
              : "Ângulo / direção"}: {aim}
          <input
            aria-label="Mira"
            type="range"
            min={kind === "arco" ? 50 : 0}
            max={kind === "arco" ? 250 : 100}
            value={aim}
            disabled={finished}
            onChange={(e) => setAim(Number(e.target.value))}
          />
        </label>
        <label>
          Força: {power}%
          <input
            aria-label="Força"
            type="range"
            min="10"
            max="100"
            value={power}
            disabled={finished}
            onChange={(e) => setPower(Number(e.target.value))}
          />
        </label>
      </div>
      {(kind === "basquete" || kind === "arco") && (
        <p>
          Vento: {wind > 0 ? "+" : ""}
          {wind} ·{" "}
          {wind === 0
            ? "calmo"
            : wind > 0
              ? "para a direita"
              : "para a esquerda"}
        </p>
      )}
      <p role="status">
        {result || "Ajuste sua jogada."}{" "}
        {kind === "golfe" || kind === "boliche"
          ? `Tentativa ${attempt} / ${allowed}.`
          : ""}
      </p>
      {finished ? (
        <button onClick={() => onRound(points, result)}>
          Próxima rodada · +{points} pontos
        </button>
      ) : (
        <button onClick={launch}>
          {kind === "golfe"
            ? "Dar tacada"
            : kind === "arco"
              ? "Soltar flecha"
              : kind === "boliche"
                ? "Lançar bola"
                : "Arremessar"}
        </button>
      )}
    </div>
  );
}
