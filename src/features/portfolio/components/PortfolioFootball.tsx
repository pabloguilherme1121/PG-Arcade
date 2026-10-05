import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../../useReducedMotion";
import { RotateCcw, Target, ArrowUpRight, Check, X } from "lucide-react";
import {
  chooseFootballKeeperPosition,
  getFootballFlightProfile,
  getFootballTargetX,
  resolveFootballShot,
  type FootballDifficulty,
  type FootballMode,
} from "../utils/football";
import "./PortfolioFootball.css";
import ArcadeDifficultyNotice from "./ArcadeDifficultyNotice";
const button =
  "min-h-11 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:opacity-50";
type Shot = ReturnType<typeof resolveFootballShot> &
  ReturnType<typeof getFootballFlightProfile>;
const feedback = {
  gol: "Gol! Boa colocação.",
  defesa: "Defesa! Tente outro canto.",
  fora: "Fora! Reduza a força ou ajuste a mira.",
  barreira: "Na barreira! Aumente a força ou a curva.",
};
export default function PortfolioFootball() {
  const [mode, setMode] = useState<FootballMode>("penalty");
  const [difficulty, setDifficulty] = useState<FootballDifficulty>("normal");
  const [aim, setAim] = useState(30);
  const [power, setPower] = useState(65);
  const [curve, setCurve] = useState(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [flight, setFlight] = useState<Shot | null>(null);
  const [keeper, setKeeper] = useState(50);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const last = shots.at(-1);
  const goals = shots.filter((shot) => shot.result === "gol").length;
  const finished = shots.length === 5;
  const levels: FootballDifficulty[] = [
    "easy",
    "normal",
    "hard",
    "master",
    "expert",
  ];
  const nextLevel = levels[levels.indexOf(difficulty) + 1];
  const preview = resolveFootballShot(mode, aim, power, curve, 50);
  const previewY =
    preview.result === "barreira"
      ? 185
      : preview.result === "fora"
        ? 20
        : 35 + preview.y;
  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setFlight(null);
    setShots([]);
    setKeeper(50);
  };
  const shoot = () => {
    if (finished || timer.current) return;
    const target = getFootballTargetX(mode, aim, curve, power);
    const position = chooseFootballKeeperPosition(difficulty, target);
    const shot = {
      ...resolveFootballShot(mode, aim, power, curve, position),
      ...getFootballFlightProfile(mode, power, curve),
    };
    setKeeper(position);
    if (reducedMotion) {
      setShots((previous) => [...previous, shot]);
      return;
    }
    setFlight(shot);
    timer.current = setTimeout(() => {
      setShots((previous) => [...previous, shot]);
      setFlight(null);
      timer.current = null;
    }, shot.durationMs);
  };
  const shot = flight ?? last;
  const ballX = shot ? Math.max(15, Math.min(385, 40 + shot.x * 3.2)) : 200;
  const ballY = shot
    ? shot.result === "barreira"
      ? 185
      : shot.result === "fora"
        ? 20
        : 35 + shot.y
    : 250;
  return (
    <section
      data-football-game
      aria-labelledby="football-title"
      className="bg-[#06111e] text-white"
    >
      <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="football-title"
              className="font-display text-3xl tracking-tight sm:text-4xl"
            >
              Decida no chute.
            </h2>
            <p className="mt-2 text-sm leading-5 text-[#b8cce0]">
              Mire no gol, ajuste força e curva e enfrente cinco níveis de
              leitura do goleiro.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className="flex rounded-xl bg-[#0b2136] p-1"
              aria-label="Modalidade"
            >
              {(
                [
                  ["penalty", "Pênaltis"],
                  ["free-kick", "Cobranças de falta"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  className={`${button} ${mode === value ? "bg-[#38bdf8] text-[#02111f]" : "text-[#b8cce0] hover:bg-white/10"}`}
                  onClick={() => {
                    setMode(value);
                    reset();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className="flex flex-wrap justify-end gap-1"
              aria-label="Dificuldade do goleiro"
            >
              {(
                [
                  "easy",
                  "normal",
                  "hard",
                  "master",
                  "expert",
                ] as FootballDifficulty[]
              ).map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={difficulty === level}
                  onClick={() => {
                    setDifficulty(level);
                    reset();
                  }}
                  className={`${button} border px-2 text-xs ${difficulty === level ? "border-cyan-300 bg-cyan-300/15 text-cyan-100" : "border-white/10 text-[#9fb7c9]"}`}
                >
                  {
                    {
                      easy: "Fácil",
                      normal: "Normal",
                      hard: "Difícil",
                      master: "Mestre",
                      expert: "Especialista",
                    }[level]
                  }
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:gap-6">
          <div className="min-w-0">
            <ArcadeDifficultyNotice game="futebol" level={difficulty} />
            <div className="mb-2 flex items-center justify-between gap-2 text-sm">
              <p className="font-medium tabular-nums">
                {goals} gols · {shots.length} / 5 cobranças
              </p>
              <ol
                aria-label="Resultados das cobranças"
                className="flex gap-1.5"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <li
                    key={index}
                    aria-label={
                      shots[index]
                        ? `Cobrança ${index + 1}: ${shots[index].result}`
                        : `Cobrança ${index + 1}: pendente`
                    }
                    className={`grid h-6 w-6 place-items-center rounded-full border ${shots[index]?.result === "gol" ? "border-emerald-300 bg-emerald-300 text-[#02111f]" : "border-[#638297] text-[#b8cce0]"}`}
                  >
                    {shots[index] ? (
                      shots[index].result === "gol" ? (
                        <Check size={14} aria-hidden />
                      ) : (
                        <X size={14} aria-hidden />
                      )
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <div
              data-football-result={
                flight ? "flight" : (last?.result ?? "ready")
              }
              className="football-pitch relative overflow-hidden rounded-xl border border-[#4c8879] bg-[#123f36]"
            >
              <svg
                viewBox="0 0 400 280"
                className="block w-full"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="football-ball" cx="35%" cy="30%">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset=".72" stopColor="#eef2f4" />
                    <stop offset="1" stopColor="#aebbc5" />
                  </radialGradient>
                  <pattern
                    id="football-net"
                    width="16"
                    height="14"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M16 0H0V14"
                      fill="none"
                      stroke="#cedee0"
                      strokeOpacity=".28"
                    />
                  </pattern>
                </defs>
                <path d="M0 280L58 0H342L400 280Z" fill="#175446" />
                {[40, 100, 160, 220].map((y) => (
                  <path
                    key={y}
                    d={`M0 ${y}H400V${y + 30}H0Z`}
                    fill="#ffffff"
                    opacity=".025"
                  />
                ))}
                <path
                  d="M20 280L64 6H336L380 280M45 205H355M90 205L105 145H295L310 205"
                  fill="none"
                  stroke="#c9e6df"
                  strokeOpacity=".3"
                  strokeWidth="2"
                />
                <path
                  d="M40 135V35H360V135"
                  fill="#082922"
                  stroke="#e5f5ef"
                  strokeWidth="5"
                />
                <path d="M42 38H358V133H42Z" fill="url(#football-net)" />
                <ellipse
                  cx="200"
                  cy="250"
                  rx="16"
                  ry="5"
                  fill="#061e19"
                  opacity=".5"
                />
                <g
                  style={{
                    transform: `translate(${40 + keeper * 3.2}px,110px) rotate(${flight ? (keeper >= 50 ? 18 : -18) : 0}deg)`,
                  }}
                  className="football-keeper"
                >
                  <ellipse cy="21" rx="18" ry="4" fill="#041a19" opacity=".4" />
                  <circle cy="-21" r="7" fill="#e7c3a4" />
                  <path d="M-9 -12H9L13 6H-13Z" fill="#f3be55" />
                  <path
                    d="M-8 7L-12 21M8 7L12 21"
                    stroke="#162438"
                    strokeWidth="6"
                  />
                  <path
                    d="M-9 -9L-23 -14M9 -9L23 -14"
                    stroke="#f3be55"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <g
                    className="football-hand football-hand-left"
                    transform="translate(-24 -15)"
                  >
                    <ellipse rx="5.2" ry="4.2" fill="#f2f5f1" />
                    <path
                      d="M-2.5 -2.5L-5.8 -5.1M-.8 -3.2L-2.4 -6.4M1.1 -3L.7 -6.4M2.8 -2L3.6 -5"
                      stroke="#b9c7cf"
                      strokeWidth=".9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M-3 1.2L-5.5 2.4"
                      stroke="#b9c7cf"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </g>
                  <g
                    className="football-hand football-hand-right"
                    transform="translate(24 -15)"
                  >
                    <ellipse rx="5.2" ry="4.2" fill="#f2f5f1" />
                    <path
                      d="M2.5 -2.5L5.8 -5.1M.8 -3.2L2.4 -6.4M-1.1 -3L-.7 -6.4M-2.8 -2L-3.6 -5"
                      stroke="#b9c7cf"
                      strokeWidth=".9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 1.2L5.5 2.4"
                      stroke="#b9c7cf"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
                {mode === "free-kick" && (
                  <g data-football-wall>
                    {[176, 200, 224].map((x) => (
                      <g key={x} transform={`translate(${x},183)`}>
                        <ellipse
                          cy="20"
                          rx="11"
                          ry="3"
                          fill="#061e19"
                          opacity=".4"
                        />
                        <circle cy="-19" r="5" fill="#e7c3a4" />
                        <path d="M-7 -12H7L8 7H-8Z" fill="#64a5da" />
                        <path
                          d="M-4 8L-5 20M4 8L5 20"
                          stroke="#102c44"
                          strokeWidth="4"
                        />
                        <path
                          d="M-6 -7L-2 3M6 -7L2 3"
                          stroke="#64a5da"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />
                        <g transform="translate(0 4)">
                          <ellipse rx="4" ry="2.7" fill="#e7c3a4" />
                          <path
                            d="M-2.8 -.8L-4.7 -2.4M-1.2 -1.5L-2 -3.5M.5 -1.5L.7 -3.5M2.1 -.9L3.7 -2.7"
                            stroke="#c99f7f"
                            strokeWidth=".65"
                            strokeLinecap="round"
                          />
                        </g>
                      </g>
                    ))}
                  </g>
                )}
                <path
                  data-football-preview
                  d={`M200 250 Q${200 + (mode === "free-kick" ? curve * 0.7 : 0)} 140 ${Math.max(15, Math.min(385, 40 + preview.x * 3.2))} ${previewY}`}
                  stroke="#f6d383"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  opacity=".5"
                  fill="none"
                />
                <g
                  className={flight ? "football-ball football-ball-flight" : "football-ball"}
                  key={`${shots.length}-${Boolean(flight)}`}
                  transform={
                    flight ? undefined : `translate(${ballX},${ballY})`
                  }
                >
                  {flight && (
                    <animateMotion
                      dur={`${flight.durationMs / 1000}s`}
                      fill="freeze"
                      path={`M200 250 Q${200 + flight.bend} ${250 - flight.apexLift} ${ballX} ${ballY}`}
                      calcMode="spline"
                      keyTimes="0;1"
                      keySplines=".16 1 .3 1"
                    />
                  )}
                  {flight && (
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      from="1"
                      to={String(flight.scaleAtGoal)}
                      dur={`${flight.durationMs / 1000}s`}
                      fill="freeze"
                      additive="sum"
                    />
                  )}
                  <circle r="9" fill="url(#football-ball)" stroke="#c8d6df" />
                  <path d="M0 -4L4 -1L3 4H-3L-4 -1Z" fill="#142d42" />
                  <path
                    d="M-8 -3L-5 -6M5 -6L8 -3M-5 7L-3 5M3 5L5 7"
                    stroke="#142d42"
                    strokeWidth="2"
                  />
                </g>
              </svg>
              <div
                role="slider"
                aria-label="Mira no gol"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={aim}
                aria-valuetext={`${aim}% da esquerda para a direita`}
                aria-disabled={Boolean(flight)}
                tabIndex={0}
                className="absolute left-[10%] top-[12.5%] h-[35.7%] w-[80%] cursor-crosshair touch-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
                onPointerDown={(event) => {
                  if (flight) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const box = event.currentTarget.getBoundingClientRect();
                  setAim(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          ((event.clientX - box.left) / box.width) * 100,
                        ),
                      ),
                    ),
                  );
                }}
                onPointerMove={(event) => {
                  if (flight) return;
                  if (!event.currentTarget.hasPointerCapture(event.pointerId))
                    return;
                  const box = event.currentTarget.getBoundingClientRect();
                  setAim(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          ((event.clientX - box.left) / box.width) * 100,
                        ),
                      ),
                    ),
                  );
                }}
                onKeyDown={(event) => {
                  if (flight) return;
                  if (
                    [
                      "ArrowLeft",
                      "ArrowDown",
                      "ArrowRight",
                      "ArrowUp",
                      "Home",
                      "End",
                    ].includes(event.key)
                  ) {
                    event.preventDefault();
                    setAim((value) =>
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? 100
                          : Math.max(
                              0,
                              Math.min(
                                100,
                                value +
                                  (["ArrowLeft", "ArrowDown"].includes(
                                    event.key,
                                  )
                                    ? -5
                                    : 5),
                              ),
                            ),
                    );
                  }
                }}
              >
                <Target
                  aria-hidden
                  size={24}
                  className="absolute top-[35%] text-[#ffe4a2]"
                  style={{ left: `${aim}%`, transform: "translateX(-50%)" }}
                />
              </div>
            </div>
            <p
              role="status"
              className="mt-2 min-h-10 text-sm leading-5 text-[#c1dfd5]"
            >
              {flight
                ? "Bola em jogo…"
                : last
                  ? feedback[last.result]
                  : "Toque no gol para escolher o canto."}{" "}
              {finished ? `Série encerrada: ${goals} de 5 gols.` : ""}
            </p>
          </div>
          <div className="min-w-0 lg:border-l lg:border-white/10 lg:pl-6">
            <div
              className="mb-3 grid grid-cols-3 gap-2"
              aria-label="Escolher canto rápido"
            >
              {(
                [
                  [20, "Canto esquerdo"],
                  [50, "Centro"],
                  [80, "Canto direito"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={Boolean(flight)}
                  aria-pressed={aim === value}
                  onClick={() => setAim(value)}
                  className={`${button} border text-xs ${aim === value ? "border-emerald-300 bg-emerald-300/10 text-emerald-100" : "border-white/15 text-[#b8cce0]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium">
              Mira{" "}
              <span className="float-right tabular-nums text-[#b8cce0]">
                {aim}%
              </span>
              <input
                aria-label="Mira"
                className="football-range"
                type="range"
                min="0"
                max="100"
                value={aim}
                disabled={Boolean(flight)}
                onChange={(event) => setAim(Number(event.target.value))}
              />
            </label>
            <div
              className={`grid gap-x-4 ${mode === "free-kick" ? "grid-cols-2" : "grid-cols-1"}`}
            >
              <label className="block text-sm font-medium">
                Força{" "}
                <span className="float-right tabular-nums text-[#b8cce0]">
                  {power}%
                </span>
                <input
                  aria-label="Força"
                  className="football-range"
                  type="range"
                  min="0"
                  max="100"
                  value={power}
                  disabled={Boolean(flight)}
                  onChange={(event) => setPower(Number(event.target.value))}
                />
              </label>
              {mode === "free-kick" && (
                <label className="block text-sm font-medium">
                  Curva{" "}
                  <span className="float-right tabular-nums text-[#b8cce0]">
                    {curve}
                  </span>
                  <input
                    aria-label="Curva"
                    className="football-range"
                    type="range"
                    min="-100"
                    max="100"
                    value={curve}
                    disabled={Boolean(flight)}
                    onChange={(event) => setCurve(Number(event.target.value))}
                  />
                </label>
              )}
            </div>
            {finished && (
              <div
                data-football-series-review
                className="football-series-review mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/5 p-4"
              >
                <h3 className="text-base font-semibold text-emerald-100">
                  Série concluída
                </h3>
                <p className="mt-2 text-sm text-white">
                  {Math.round((goals / 5) * 100)}% de aproveitamento · {goals}{" "}
                  gols
                </p>
                <p className="mt-2 text-sm leading-6 text-[#b8cce0]">
                  {shots.filter((s) => s.result === "defesa").length} defesas ·{" "}
                  {shots.filter((s) => s.result === "fora").length} para fora ·{" "}
                  {shots.filter((s) => s.result === "barreira").length} na
                  barreira
                </p>
                <p className="mt-2 text-sm leading-6 text-[#d2e9df]">
                  {goals >= 4
                    ? "Boa precisão. Experimente um goleiro mais atento."
                    : goals >= 2
                      ? "Boa base. Varie os cantos para melhorar a colocação."
                      : "Treine a mira e mantenha a força entre 58 e 90. Nas faltas, experimente a curva."}
                </p>
                {nextLevel && (
                  <button
                    type="button"
                    onClick={() => {
                      setDifficulty(nextLevel);
                      reset();
                    }}
                    className={`${button} mt-3 border border-emerald-300/40 text-emerald-100`}
                  >
                    Próximo nível
                  </button>
                )}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={finished || Boolean(flight)}
                onClick={shoot}
                className={`${button} flex flex-1 items-center justify-center gap-2 bg-[#38bdf8] text-[#02111f] hover:bg-[#7dd3fc]`}
              >
                <ArrowUpRight size={18} aria-hidden />
                Chutar
              </button>
              <button
                type="button"
                aria-label="Reiniciar série"
                onClick={reset}
                className={`${button} border border-white/20 text-[#d8e7f0] hover:bg-white/10`}
              >
                <RotateCcw className="mr-2 inline" size={16} aria-hidden />
                Reiniciar
              </button>
            </div>
            <details className="mt-3 text-sm text-[#b8cce0]">
              <summary className="min-h-11 cursor-pointer py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                Como acertar o chute
              </summary>
              <p className="pb-3 leading-6">
                Use as setas na mira ou toque no gol. Força entre 58 e 90 passa
                por cima da barreira. Nas faltas, curva negativa desvia à
                esquerda e positiva à direita; chutes mais colocados permanecem
                mais tempo no ar e fazem mais curva. Força máxima pode mandar a
                bola para fora.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
