import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
  type ComponentType,
} from "react";
import {
  Gamepad2,
  Heart,
  Search,
  ArrowRight,
  ArrowLeft,
  Maximize,
  Minimize,
  Trophy,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { games, isGameId, type GameId } from "./lib/catalog";
import {
  expandedGames,
  isExpandedId,
  type ExpandedId,
} from "./lib/expandedCatalog";
import { gameHelp, recordUnits } from "./lib/gameHelp";
import {
  readProgress,
  saveProgress,
  mergeProgress,
  type Progress,
} from "./lib/progress";
import { readPreferences, applyPreferences } from "./lib/preferences";
import "./features/portfolio/components/PortfolioArcade.css";
type PlayerProps = { record: number; onRecord: (n: number) => void };
const collectionPlayers = Object.fromEntries(
  expandedGames.map((g) => [
    g.id,
    lazy(async () => {
      const module =
        g.family === "logic"
          ? await import("./games/LogicCollection")
          : g.family === "action"
            ? await import("./games/ActionCollection")
            : await import("./games/CasualCollection");
      return {
        default: (props: PlayerProps) => (
          <module.default {...props} gameId={g.id} />
        ),
      };
    }),
  ]),
) as unknown as Record<ExpandedId, ComponentType<PlayerProps>>;
const players = {
  ...collectionPlayers,
  sequencia: lazy(() => import("./games/ColorSequence")),
  palavra: lazy(() => import("./games/SecretWord")),
  rally: lazy(() => import("./games/Rally")),
  coleta: lazy(() => import("./games/RoadCollect")),
  orbital: lazy(() => import("./games/Orbital")),
  minas: lazy(() => import("./games/Minesweeper")),
  reflexo: lazy(() => import("./games/Reaction")),
  corrida: lazy(() => import("./games/Racing")),
  estacionamento: lazy(() => import("./games/Parking")),
  tiro: lazy(() => import("./games/SpaceShooter")),
  luzes: lazy(() => import("./games/LightsOut")),
  estrelas: lazy(() => import("./games/StarCatch")),
  liga4: lazy(() => import("./games/ConnectFour")),
  puzzle: lazy(() => import("./games/SlidingPuzzle")),
  "2048": lazy(() => import("./games/Game2048")),
  snake: lazy(() => import("./games/Snake")),
  memoria: lazy(() => import("./games/Memory")),
  xadrez: lazy(() => import("./features/portfolio/components/PortfolioChess")),
  futebol: lazy(
    () => import("./features/portfolio/components/PortfolioFootball"),
  ),
  domino: lazy(() => import("./features/portfolio/components/PortfolioDomino")),
  damas: lazy(
    () => import("./features/portfolio/components/PortfolioCheckers"),
  ),
  velha: lazy(
    () => import("./features/portfolio/components/PortfolioTicTacToe"),
  ),
};
class GameError extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty">
        <h2>O jogo não carregou.</h2>
        <p>Confira sua conexão e tente novamente.</p>
        <button onClick={() => location.reload()}>Tentar novamente</button>
        <a href="#/">Voltar aos jogos</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
function route() {
  const path = location.hash.replace(/^#\/?/, "");
  const id = path.replace("jogar/", "");
  return path.startsWith("jogar/") && isGameId(id)
    ? id
    : path === "favoritos"
      ? "favoritos"
      : path === "progresso"
        ? "progresso"
        : "catalogo";
}
function Preview({ id }: { id: GameId }) {
  if (isExpandedId(id)) {
    const family = expandedGames.find((g) => g.id === id)!.family;
    return (
      <div
        className={`preview expanded-preview expanded-${family}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 240 150">
          <defs>
            <linearGradient id={`surface-${id}`} x2="1" y2="1">
              <stop stopColor="#1e3644" />
              <stop offset="1" stopColor="#101922" />
            </linearGradient>
          </defs>
          <rect width="240" height="150" rx="16" fill={`url(#surface-${id})`} />
          {family === "logic" ? (
            <>
              {Array.from({ length: 16 }, (_, i) => (
                <rect
                  key={i}
                  x={65 + (i % 4) * 28}
                  y={22 + Math.floor(i / 4) * 28}
                  width="24"
                  height="24"
                  rx="5"
                  fill={i % 3 === 0 ? "#c9f65a" : "#466578"}
                />
              ))}
            </>
          ) : family === "action" ? (
            <>
              <path
                d="M0 120Q60 40 120 80T240 30"
                stroke="#7ea3bb"
                strokeWidth="5"
                fill="none"
              />
              <path d="m110 52 22 44-22-8-22 8Z" fill="#c9f65a" />
              <circle cx="48" cy="39" r="9" fill="#e7a25b" />
              <circle cx="195" cy="105" r="15" fill="#456d82" />
            </>
          ) : (
            <>
              <ellipse
                cx="122"
                cy="115"
                rx="46"
                ry="8"
                fill="#000"
                opacity=".4"
              />
              <circle cx="120" cy="74" r="38" fill="#dfad6e" />
              <path
                d="M82 74h76M120 36v76M93 47q54 27 0 54M147 47q-54 27 0 54"
                fill="none"
                stroke="#69472a"
                strokeWidth="3"
              />
            </>
          )}
        </svg>
      </div>
    );
  }
  if (id === "sequencia" || id === "palavra")
    return (
      <div
        className={`preview puzzle-preview preview-${id}`}
        aria-hidden="true"
      >
        {(id === "sequencia"
          ? ["1", "2", "3", "4"]
          : ["J", "O", "G", "O", "S"]
        ).map((v, i) => (
          <span key={i} className={`pad-${i}`}>
            {v}
          </span>
        ))}
      </div>
    );
  if (
    [
      "corrida",
      "estacionamento",
      "rally",
      "coleta",
      "orbital",
      "tiro",
      "estrelas",
    ].includes(id)
  )
    return (
      <div
        className={`preview art-preview ${["orbital", "tiro", "estrelas"].includes(id) ? "art-space" : "art-road"}`}
        aria-hidden="true"
      >
        <img
          src={`${import.meta.env.BASE_URL}art/${["orbital", "tiro", "estrelas"].includes(id) ? "ship" : "car"}.webp`}
          alt=""
          loading="lazy"
        />
      </div>
    );
  if (id === "minas" || id === "reflexo")
    return (
      <div className={`preview logic-preview preview-${id}`} aria-hidden="true">
        {id === "minas" ? (
          <>
            <span>1</span>
            <span>2</span>
            <span>⚑</span>
            <span>1</span>
            <span>3</span>
            <span>2</span>
          </>
        ) : (
          <strong>AGORA!</strong>
        )}
      </div>
    );
  if (["corrida", "estacionamento", "tiro", "luzes", "estrelas"].includes(id))
    return (
      <div
        className={`preview action-preview preview-${id}`}
        aria-hidden="true"
      >
        <span>
          {id === "corrida"
            ? "🏎"
            : id === "estacionamento"
              ? "P"
              : id === "tiro"
                ? "◎"
                : id === "luzes"
                  ? "☀"
                  : "★"}
        </span>
        <i />
        <i />
        <i />
      </div>
    );
  if (id === "liga4" || id === "puzzle")
    return (
      <div className={`preview new-preview ${id}`}>
        {Array.from({ length: id === "liga4" ? 28 : 9 }, (_, i) => (
          <span key={i}>{id === "puzzle" ? (i < 8 ? i + 1 : "") : ""}</span>
        ))}
      </div>
    );
  if (id === "2048")
    return (
      <div className="preview p2048">
        {[2, 4, 8, 16, 4, 8, 32, 64, 2, 16, 128, 256, 4, 8, 32, 512].map(
          (n, i) => (
            <span key={i} className={`tile-${n}`}>
              {n}
            </span>
          ),
        )}
      </div>
    );
  if (id === "snake")
    return (
      <div className="preview psnake">
        <div className="mini-snake">
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <span className="mini-fruit" />
      </div>
    );
  if (id === "memoria")
    return (
      <div className="preview pmemory">
        <span>✦</span>
        <span>?</span>
        <span>✦</span>
        <span>?</span>
        <span>?</span>
        <span>♡</span>
      </div>
    );
  if (id === "xadrez" || id === "damas")
    return (
      <div className={`preview pboard ${id}`}>
        {Array.from({ length: 32 }, (_, i) => (
          <span
            key={i}
            className={(Math.floor(i / 8) + i) % 2 ? "dark" : "light"}
          >
            {id === "xadrez" && i === 12
              ? "♞"
              : id === "xadrez" && i === 20
                ? "♙"
                : id === "damas" && [9, 11, 13, 18, 20, 22].includes(i)
                  ? "●"
                  : ""}
          </span>
        ))}
      </div>
    );
  if (id === "futebol")
    return (
      <div className="preview pfootball">
        <div className="goal" />
        <span>⚽</span>
      </div>
    );
  if (id === "domino")
    return (
      <div className="preview pdomino">
        {[4, 2, 6].map((n, i) => (
          <div key={i}>
            <span>{n}</span>
            <span>{6 - n}</span>
          </div>
        ))}
      </div>
    );
  return (
    <div className="preview pvelha">
      {["×", "○", "", "", "×", "○", "○", "", "×"].map((s, i) => (
        <span key={i}>{s}</span>
      ))}
    </div>
  );
}
export default function App() {
  const [page, setPage] = useState(route);
  const [focusMode, setFocusMode] = useState(false);
  const [preferences, setPreferences] = useState(readPreferences);
  useEffect(() => applyPreferences(preferences), [preferences]);
  const [session, setSession] = useState(0);
  const restartDialog = useRef<HTMLDialogElement>(null);
  function focusBoard() {
    const arenaElement = arena.current?.querySelector<HTMLElement>(
      "[data-arcade-arena]",
    );
    const target =
      arenaElement?.querySelector<HTMLElement>(
        '[data-expanded-board],[role="gridcell"][tabindex="0"],.board2048,.snake-board,.race-board,.parking-board,.targets-board,.sliding-board,.sequence-board,.word-input,.reaction-board,.mines-board button:not(:disabled),[role="slider"][tabindex="0"],[data-game-cell]:not(:disabled),[data-domino-tile]:not(:disabled)',
      ) ||
      arenaElement?.querySelector<HTMLElement>(
        '[role="gridcell"]:not([aria-disabled="true"]):not(:disabled),.connect-controls button:not(:disabled),.lights-board button:not(:disabled),.memory-card:not(:disabled),button:not(:disabled)',
      ) ||
      arenaElement;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "center", behavior: "instant" });
  }
  function askRestart() {
    window.dispatchEvent(new Event("pg-arcade-pause"));
    restartDialog.current?.showModal();
  }
  const [progress, setProgress] = useState(readProgress);
  const [storageOk, setStorageOk] = useState(true);
  const [sort, setSort] = useState("destaques");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [message, setMessage] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const arena = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastRoute = useRef(page);
  const update = useCallback(
    (fn: (p: Progress) => Progress) =>
      setProgress((p) => {
        const next = fn(p);
        saveProgress(next);
        return next;
      }),
    [],
  );
  useEffect(() => {
    setStorageOk(saveProgress(progress));
  }, [progress]);
  useEffect(() => {
    const change = () => {
      setPage(route());
      setFocusMode(false);
      setMessage("");
      restartDialog.current?.close();
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (isGameId(page))
      update((p) => ({
        ...p,
        last: page,
        visits: { ...p.visits, [page]: (p.visits[page] || 0) + 1 },
      }));
    if (lastRoute.current !== page) {
      heading.current?.focus();
      window.scrollTo({ top: 0 });
      lastRoute.current = page;
    }
  }, [page, update]);
  useEffect(() => {
    const change = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  const setRecord = useCallback(
    (value: number) => {
      if (!isGameId(page) || !Number.isFinite(value) || value <= 0) return;
      update((p) => {
        const old = p.records[page] || 0;
        const better = ["memoria", "puzzle"].includes(page)
          ? old === 0 || value < old
          : value > old;
        return better ? { ...p, records: { ...p.records, [page]: value } } : p;
      });
    },
    [page, update],
  );
  function favorite(id: GameId) {
    update((p) => ({
      ...p,
      favorites: p.favorites.includes(id)
        ? p.favorites.filter((v) => v !== id)
        : [...p.favorites, id],
    }));
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (arena.current?.requestFullscreen)
        await arena.current.requestFullscreen();
      else setMessage("A tela cheia não está disponível neste navegador.");
    } catch {
      setMessage("A tela cheia não está disponível neste navegador.");
    }
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href);
      setMessage("Link do jogo copiado.");
    } catch {
      setMessage(
        "Copie o endereço da barra do navegador para compartilhar este jogo.",
      );
    }
  }
  function exportProgress() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "pg-arcade-progresso.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Cópia de progresso preparada. Guarde o arquivo para restaurar em outro navegador.",
    );
  }
  const game = games.find((g) => g.id === page);
  const Player = game ? players[game.id] : null;
  const visible = games.filter(
    (g) =>
      (page !== "favoritos" || progress.favorites.includes(g.id)) &&
      (category === "Todos" || g.category === category) &&
      g.name
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(
          query
            .toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        ),
  );
  const sorted = [...visible].sort((a, b) =>
    sort === "nome"
      ? a.name.localeCompare(b.name, "pt-BR")
      : sort === "visitados"
        ? (progress.visits[b.id] || 0) - (progress.visits[a.id] || 0)
        : 0,
  );
  return (
    <div className={focusMode && game ? "app-focus" : ""}>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Ir para o conteúdo
      </a>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="PG Arcade — início">
          <Gamepad2 size={34} />
          <span>PG ARCADE</span>
        </a>
        <nav aria-label="Navegação principal">
          <a
            href="#/"
            aria-current={page === "catalogo" || game ? "page" : undefined}
          >
            Jogos
          </a>
          <a
            href="#/favoritos"
            aria-current={page === "favoritos" ? "page" : undefined}
          >
            Favoritos
          </a>
          <a
            href="#/progresso"
            aria-current={page === "progresso" ? "page" : undefined}
          >
            Meu progresso
          </a>
        </nav>
        <a
          className="portfolio-link"
          href="https://pabloguilherme1121.github.io/PG-portfolio/?arcade=1"
          target="_blank"
          rel="noreferrer"
        >
          Portfólio <ExternalLink size={15} />
        </a>
      </header>
      <main id="main" tabIndex={-1}>
        <details
          className="play-preferences"
          onToggle={(event) => {
            if (event.currentTarget.open && game)
              window.dispatchEvent(new Event("pg-arcade-pause"));
          }}
        >
          <summary>Conforto visual</summary>
          <div className="preference-options">
            <label>
              <input
                type="checkbox"
                checked={preferences.contrast}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    contrast: e.target.checked,
                  }))
                }
              />
              Alto contraste
            </label>
            <label>
              Movimento
              <select
                aria-label="Movimento da interface"
                value={preferences.motion}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    motion: e.target.value as "system" | "reduced",
                  }))
                }
              >
                <option value="system">Preferência do aparelho</option>
                <option value="reduced">Reduzir efeitos</option>
              </select>
            </label>
            <label>
              Tamanho dos controles
              <select
                aria-label="Tamanho dos controles"
                value={preferences.controls}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    controls: e.target.value as "standard" | "large",
                  }))
                }
              >
                <option value="standard">Padrão</option>
                <option value="large">Ampliados</option>
              </select>
            </label>
          </div>
          <p>
            As opções valem para todos os jogos. Reduzir efeitos mantém os
            movimentos necessários para jogar; controles ampliados aumentam os
            principais alvos de toque sem alterar os tabuleiros.
          </p>
        </details>
        {!storageOk && (
          <p className="storage-notice" role="status">
            O navegador bloqueou o armazenamento. Seu progresso fica disponível
            só nesta visita.
          </p>
        )}
        {game && Player ? (
          <div
            ref={arena}
            data-current-game={game.id}
            data-game-category={game.category}
            className={`player ${focusMode ? "focus-game" : ""}`}
          >
            <div className="player-toolbar">
              <a className="button" href="#/">
                <ArrowLeft size={19} />
                Voltar aos jogos
              </a>
              <div>
                <button
                  aria-pressed={progress.favorites.includes(game.id)}
                  onClick={() => favorite(game.id)}
                >
                  <Heart
                    size={19}
                    fill={
                      progress.favorites.includes(game.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  {progress.favorites.includes(game.id)
                    ? "Favoritado"
                    : "Favoritar"}
                </button>
                <button onClick={copyLink} aria-label="Copiar link do jogo">
                  <LinkIcon size={19} />
                  <span className="hide-small">Compartilhar</span>
                </button>
                <button
                  onClick={toggleFullscreen}
                  aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
                  <span className="hide-small">
                    {fullscreen ? "Sair" : "Tela cheia"}
                  </span>
                </button>
              </div>
            </div>
            <div className="player-kicker" aria-hidden="true">
              <span>{game.category}</span>
              <span>PG Arcade</span>
            </div>
            <h1 ref={heading} tabIndex={-1}>
              {game.name}
            </h1>
            <p className="player-description">{game.description}</p>
            <p className="feedback" role="status">
              {message}
            </p>
            <div className="experience-tools">
              <button onClick={focusBoard}>Ir para o tabuleiro</button>
              <button
                aria-pressed={focusMode}
                onClick={() => {
                  if (focusMode) {
                    setFocusMode(false);
                    setMessage("Modo foco desativado.");
                    return;
                  }
                  setFocusMode(true);
                  setMessage(
                    "Modo foco ativado. O controle principal do jogo recebeu foco.",
                  );
                  window.requestAnimationFrame(focusBoard);
                }}
              >
                {focusMode ? "Sair do modo foco" : "Modo foco"}
              </button>
              <button onClick={askRestart}>Reiniciar jogo</button>
              <details
                key={game.id}
                onToggle={(event) => {
                  if (event.currentTarget.open)
                    window.dispatchEvent(new Event("pg-arcade-pause"));
                }}
              >
                <summary>Ajuda rápida e controles</summary>
                <p>{gameHelp[game.id]}</p>
                <p>
                  Favoritos e recordes ficam neste navegador. Trocar de jogo
                  inicia outra partida.
                </p>
              </details>
            </div>
            <dialog
              ref={restartDialog}
              className="restart-dialog"
              aria-labelledby="restart-title"
              onClick={(e) => {
                if (e.target === e.currentTarget)
                  restartDialog.current?.close();
              }}
            >
              <h2 id="restart-title">Reiniciar {game.name}?</h2>
              <p>
                A partida atual será encerrada. Seus favoritos e recordes ficam
                guardados.
              </p>
              <div className="game-actions">
                <button
                  autoFocus
                  onClick={() => restartDialog.current?.close()}
                >
                  Continuar esta partida
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    setSession((n) => n + 1);
                    restartDialog.current?.close();
                    setMessage(
                      "Jogo reiniciado. Você pode começar outra partida.",
                    );
                  }}
                >
                  Confirmar reinício
                </button>
              </div>
            </dialog>
            <GameError key={`${game.id}-${session}`}>
              <Suspense
                fallback={
                  <p className="empty" role="status">
                    Carregando {game.name}…
                  </p>
                }
              >
                <div
                  className={
                    ["xadrez", "futebol", "domino", "damas", "velha"].includes(
                      game.id,
                    )
                      ? "legacy-game arcade-hub"
                      : ""
                  }
                  data-arcade-arena
                  role="region"
                  aria-label={`${game.name}: área principal do jogo`}
                  tabIndex={-1}
                >
                  <Player
                    record={progress.records[game.id] || 0}
                    onRecord={setRecord}
                  />
                </div>
              </Suspense>
            </GameError>
          </div>
        ) : page === "progresso" ? (
          <section className="progress-section">
            <h1 ref={heading} tabIndex={-1}>
              Meu progresso
            </h1>
            <p className="muted">
              Suas visitas e recordes ficam neste navegador. Sem cadastro.
            </p>
            <div className="progress-grid">
              <div>
                <Trophy />
                <h2>Jogos explorados</h2>
                <strong>
                  {Object.keys(progress.visits).length} de {games.length}
                </strong>
              </div>
              <div>
                <Heart />
                <h2>Favoritos</h2>
                <strong>{progress.favorites.length}</strong>
              </div>
            </div>
            <h2>Seus recordes</h2>
            <div className="progress-backup">
              <p className="feedback" role="status">
                {message}
              </p>
              <h3>Leve seu progresso com você</h3>
              <p>
                Salve uma cópia dos favoritos e recordes. Restaurar combina os
                dados e preserva os melhores resultados. Nenhum arquivo é
                enviado a servidores.
              </p>
              <button onClick={exportProgress}>
                Salvar cópia do progresso
              </button>
              <label>
                Restaurar cópia
                <input
                  type="file"
                  accept=".json,application/json"
                  aria-label="Restaurar cópia do progresso"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      if (file.size > 100000) throw Error();
                      const data: unknown = JSON.parse(await file.text());
                      if (
                        !data ||
                        typeof data !== "object" ||
                        Array.isArray(data) ||
                        !("favorites" in data) ||
                        !("records" in data)
                      )
                        throw Error();
                      update((p) => mergeProgress(p, data));
                      setMessage(
                        "Progresso restaurado. Seus melhores recordes foram preservados.",
                      );
                    } catch {
                      setMessage(
                        "Não foi possível restaurar. Escolha uma cópia JSON do PG Arcade de até 100 KB.",
                      );
                    }
                  }}
                />
              </label>
            </div>
            <div className="record-list">
              {games
                .filter((g) => !!recordUnits[g.id])
                .map((g) => (
                  <a href={`#/jogar/${g.id}`} key={g.id}>
                    <span>{g.name}</span>
                    <strong>
                      {progress.records[g.id]
                        ? `${progress.records[g.id]} ${recordUnits[g.id]}`
                        : "Ainda sem recorde"}
                    </strong>
                    <ArrowRight size={18} />
                  </a>
                ))}
            </div>
            <h2>Jogos visitados</h2>
            <p className="muted">
              Cada abertura de um jogo conta como uma visita.
            </p>
            <div className="record-list">
              {games
                .filter((g) => progress.visits[g.id])
                .map((g) => (
                  <a href={`#/jogar/${g.id}`} key={g.id}>
                    <span>{g.name}</span>
                    <span>{progress.visits[g.id]} visitas</span>
                    <ArrowRight size={18} />
                  </a>
                ))}
              {!Object.keys(progress.visits).length && (
                <p>Escolha um jogo para começar.</p>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="hero">
              <div>
                <div className="hero-eyebrow" aria-hidden="true">
                  <span>PG Arcade</span>
                  <span>50 jogos</span>
                </div>
                <h1 ref={heading} tabIndex={-1}>
                  {page === "favoritos" ? (
                    "Suas próximas jogadas."
                  ) : (
                    <>
                      Uma pausa.
                      <br />
                      Uma nova jogada.
                    </>
                  )}
                </h1>
                <p>
                  {page === "favoritos"
                    ? "Os jogos que você quer ter sempre por perto."
                    : "50 jogos. Novos modos, dificuldades e desafios para jogar no seu ritmo."}
                </p>
                <a
                  href="#catalogo"
                  className="button primary"
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById("catalogo")?.scrollIntoView({
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                    });
                  }}
                >
                  {page === "favoritos" ? "Ver favoritos" : "Explorar jogos"}
                  <ArrowRight size={19} />
                </a>
                {progress.last && page === "catalogo" && (
                  <a className="last-game" href={`#/jogar/${progress.last}`}>
                    Jogar novamente:{" "}
                    {games.find((g) => g.id === progress.last)?.name}
                    <ArrowRight size={15} />
                  </a>
                )}
              </div>
              <img
                src={`${import.meta.env.BASE_URL}assets/arcade-hero.webp`}
                alt=""
                width="1707"
                height="924"
                fetchPriority="high"
              />
            </section>
            <section id="catalogo" className="catalog">
              <div className="catalog-heading">
                <h2>
                  {page === "favoritos"
                    ? "Seus favoritos"
                    : "Escolha sua próxima jogada"}
                </h2>
                <label className="search">
                  <Search size={18} />
                  <input
                    aria-label="Buscar jogo"
                    placeholder="Buscar jogo"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="filters" aria-label="Categorias">
                {["Todos", ...new Set(games.map((g) => g.category))].map(
                  (c) => (
                    <button
                      aria-pressed={category === c}
                      className={category === c ? "selected" : ""}
                      key={c}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ),
                )}
              </div>
              <div className="catalog-tools">
                <label>
                  Ordenar{" "}
                  <select
                    aria-label="Ordenar jogos"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="destaques">Destaques</option>
                    <option value="nome">Nome A–Z</option>
                    <option value="visitados">Mais jogados por você</option>
                  </select>
                </label>
                <span role="status">{visible.length} jogos encontrados</span>
                <button
                  disabled={!visible.length}
                  onClick={() => {
                    location.hash = `/jogar/${visible[Math.floor(Math.random() * visible.length)].id}`;
                  }}
                >
                  Jogo surpresa
                </button>
              </div>
              <div className="game-grid">
                {sorted.map((g) => (
                  <article className="game-card" key={g.id} data-game-category={g.category}>
                    <a
                      className="game-link"
                      href={`#/jogar/${g.id}`}
                      aria-label={`Jogar ${g.name}`}
                    >
                      <Preview id={g.id} />
                      <span className="game-category">{g.category}</span>
                      <h3>{g.name}</h3>
                      <p>{g.description}</p>
                    </a>
                    <button
                      className="favorite"
                      onClick={() => favorite(g.id)}
                      aria-label={`${progress.favorites.includes(g.id) ? "Remover" : "Adicionar"} ${g.name} ${progress.favorites.includes(g.id) ? "dos" : "aos"} favoritos`}
                      aria-pressed={progress.favorites.includes(g.id)}
                    >
                      <Heart
                        size={19}
                        fill={
                          progress.favorites.includes(g.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </article>
                ))}
              </div>
              {!visible.length && (
                <div className="empty">
                  <h3>
                    {page === "favoritos" && !progress.favorites.length
                      ? "Seus favoritos começam aqui."
                      : "Nenhum jogo encontrado."}
                  </h3>
                  <p>
                    {page === "favoritos" && !progress.favorites.length
                      ? "Toque no coração de um jogo para salvá-lo."
                      : "Tente outro nome ou categoria."}
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategory("Todos");
                      location.hash = "/";
                    }}
                  >
                    Limpar filtros e ver todos
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <footer>
        <a href="#/">PG Arcade</a>
        <span>Feito para jogar. Sem cadastro.</span>
      </footer>
    </div>
  );
}
