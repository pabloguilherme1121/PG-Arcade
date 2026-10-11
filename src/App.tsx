import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
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
  newGames,
  type NewGameId,
  type BoardId,
} from "./lib/newCatalog";
import {
  expandedGames,
  type ExpandedId,
} from "./lib/expandedCatalog";
import { gameHelp, recordUnits } from "./lib/gameHelp";
import GameCover from "./GameCover";
import {
  readProgress,
  saveProgress,
  mergeProgress,
  type Progress,
} from "./lib/progress";
import { readPreferences, applyPreferences } from "./lib/preferences";

import { searchText, matchesGame, categoryGroup, recommended, gameMode, readCatalogView, saveCatalogView } from "./lib/discovery";
import { useReducedMotion } from "./useReducedMotion";
import { useImmersivePlayer } from "./lib/useImmersivePlayer";
import "./features/portfolio/components/PortfolioArcade.css";
const SessionChallenge = lazy(() => import("./games/SessionChallenge"));
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
  ...(Object.fromEntries(
    newGames.map((g) => [
      g.id,
      lazy(async () => {
        if (g.family === "board") {
          const module = await import("./games/BoardExpansion");
          return { default: (props: PlayerProps) => <module.default {...props} gameId={g.id as BoardId} /> };
        }
        const module = g.family === "quiz" ? await import("./games/QuizExpansion") : await import("./games/MotionExpansion");
        return { default: (props: PlayerProps) => <module.default {...props} gameId={g.id} /> };
      }),
    ]),
  ) as unknown as Record<NewGameId, ComponentType<PlayerProps>>),
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


export default function App() {
  const reducedMotion = useReducedMotion();
  const [page, setPage] = useState(route);
  const [focusMode, setFocusMode] = useState(false);
  const [preferences, setPreferences] = useState(readPreferences);
  useEffect(() => applyPreferences(preferences), [preferences]);
  const [session, setSession] = useState(0);
  const restartDialog = useRef<HTMLDialogElement>(null);
  const quickHelp = useRef<HTMLDetailsElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  function focusBoard() {
    const arenaElement = arena.current?.querySelector<HTMLElement>(
      "[data-arcade-arena]",
    );
    const target =
      arenaElement?.querySelector<HTMLElement>(
        'canvas[tabindex="0"],[data-expanded-board],[role="gridcell"][tabindex="0"],.connect-board,.board2048,.snake-board,.memory-board,.race-board,.parking-board,.targets-board,.sliding-board,.sequence-board,.word-input,.reaction-board,.mines-board button:not(:disabled),[role="slider"][tabindex="0"],[data-game-cell]:not(:disabled),[data-domino-tile]:not(:disabled)',
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
  const [initialView] = useState(readCatalogView);
  const catalogView = useRef(initialView);
  const [sort, setSort] = useState(initialView.sort);
  const [query, setQuery] = useState(initialView.query);
  const [category, setCategory] = useState(initialView.category);
  const [mode, setMode] = useState(initialView.mode);
  catalogView.current = { ...catalogView.current, query, category, sort, mode };
  const rememberCatalog = (id: GameId) => {
    catalogView.current = { ...catalogView.current, scroll: window.scrollY, returnPage: page, focusId: id };
    saveCatalogView(catalogView.current);
  };
  useEffect(() => { saveCatalogView(catalogView.current); }, [query, category, sort, mode]);
  const [message, setMessage] = useState("");
  const arena = useRef<HTMLDivElement>(null);
  const { active: fullscreen, viewport, toggle: toggleFullscreen } = useImmersivePlayer(arena, page);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastRoute = useRef(page);
  useEffect(() => {
    if (!isGameId(page)) return;
    const shortcuts = (event: KeyboardEvent) => {
      if (event.key === "Escape" && quickHelp.current?.open && !restartDialog.current?.open) {
        quickHelp.current.open = false;
        quickHelp.current.querySelector("summary")?.focus();
        return;
      }
      if (
        !event.altKey ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        event.isComposing
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return;
      if (restartDialog.current?.open) return;
      if (!["KeyH", "KeyB", "KeyR"].includes(event.code)) return;
      event.preventDefault();
      if (event.code === "KeyB") focusBoard();
      if (event.code === "KeyR") askRestart();
      if (event.code === "KeyH" && quickHelp.current) {
        quickHelp.current.open = !quickHelp.current.open;
        if (quickHelp.current.open) {
          window.dispatchEvent(new Event("pg-arcade-pause"));
          quickHelp.current.querySelector("summary")?.focus();
          quickHelp.current.scrollIntoView({ block: "nearest" });
        }
      }
    };
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, [page]);
  const update = useCallback(
    (fn: (p: Progress) => Progress) =>
      setProgress(fn),
    [],
  );
  useLayoutEffect(() => {
    // Persist before a completed round can paint and the player reloads.
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
      if (isGameId(lastRoute.current) && (page === "catalogo" || page === "favoritos")) {
        window.requestAnimationFrame(() => {
          document.querySelector<HTMLElement>(`[data-catalog-game="${catalogView.current.focusId}"] .game-link`)?.focus({ preventScroll: true });
          window.scrollTo({ top: catalogView.current.scroll, behavior: "instant" });
        });
      } else window.scrollTo({ top: 0 });
      lastRoute.current = page;
    }
  }, [page, update]);
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
  useEffect(() => {
    if (isGameId(page) || page === "progresso") return;
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
      searchInput.current?.focus();
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [page]);
  const game = games.find((g) => g.id === page);
  const Player = game ? players[game.id] : null;
  useEffect(() => { document.title = `${game ? game.name : page === "favoritos" ? "Seus favoritos" : page === "progresso" ? "Meu progresso" : "100 jogos no navegador"} — PG Arcade`; }, [game, page]);
  const normalizedQuery = useMemo(() => searchText(query), [query]);
  const visible = useMemo(() => games.filter(g =>
    (page !== "favoritos" || progress.favorites.includes(g.id)) &&
    (category === "Todos" || categoryGroup(g.category) === category) &&
    (mode === "Todos" || (mode === "Dupla local" ? gameMode(g.id).includes("dupla") : gameMode(g.id) === "Solo")) &&
    matchesGame(g, normalizedQuery)), [page, progress.favorites, category, mode, normalizedQuery]);
  const curated = recommended.map(id => games.find(g => g.id === id)!);
  const visited = games.filter(g => progress.visits[g.id]).sort((a,b) => (b.id === progress.last ? 1 : 0) - (a.id === progress.last ? 1 : 0) || (progress.visits[b.id] || 0) - (progress.visits[a.id] || 0)).slice(0,4);
  const saved = games.filter(g => progress.favorites.includes(g.id)).slice(0,4);
  function renderCard(g: typeof games[number], contextual = false) {
    return <article className={contextual ? "curated-card" : "game-card"} key={g.id} data-game-category={g.category} data-catalog-game={contextual ? undefined : g.id}>
      <a className="game-link" href={`#/jogar/${g.id}`} aria-label={`${contextual ? "Começar com" : "Jogar"} ${g.name}`} onClick={() => rememberCatalog(g.id)}>
        <GameCover id={g.id} name={g.name} category={g.category} /><span className="game-category">{categoryGroup(g.category)}</span><h3>{g.name}</h3><p>{g.description}</p>
        <span className="game-metadata">{gameMode(g.id)} · Teclado e toque</span>
      </a>
      <button className="favorite" onClick={() => favorite(g.id)} aria-label={`${contextual ? "Seleção: " : ""}${progress.favorites.includes(g.id) ? "Remover" : "Adicionar"} ${g.name} ${progress.favorites.includes(g.id) ? "dos" : "aos"} favoritos`} aria-pressed={progress.favorites.includes(g.id)}><Heart size={19} fill={progress.favorites.includes(g.id) ? "currentColor" : "none"}/></button>
    </article>;
  }
  const sorted = useMemo(
    () =>
      [...visible].sort((a, b) =>
        sort === "nome"
          ? a.name.localeCompare(b.name, "pt-BR")
          : sort === "visitados"
            ? (progress.visits[b.id] || 0) - (progress.visits[a.id] || 0)
            : 0,
      ),
    [visible, sort, progress.visits],
  );
  return (
    <div className={`${focusMode && game ? "app-focus" : ""} ${fullscreen && game ? "app-immersive" : ""}`}>
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
            data-immersive={fullscreen}
            data-viewport-fullscreen={viewport}
            className={`player ${focusMode ? "focus-game" : ""}`}
          >
            <div className="player-toolbar">
              <a className="button" href={catalogView.current.returnPage === "favoritos" ? "#/favoritos" : "#/"}>
                <ArrowLeft size={19} />
                Voltar aos jogos
              </a>
              <details className="player-utilities" onToggle={(e) => { if (e.currentTarget.open) window.dispatchEvent(new Event("pg-arcade-pause")); }}>
                <summary>Opções da partida</summary>
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
                  onClick={(event) => void toggleFullscreen(event.currentTarget)}
                  aria-pressed={fullscreen}
                  aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
                  <span className="hide-small">
                    {fullscreen ? "Sair" : "Tela cheia"}
                  </span>
                </button>
                <a className="button" href="#conforto" onClick={(e) => { e.preventDefault(); const el=document.getElementById("conforto") as HTMLDetailsElement; el.open=true; el.scrollIntoView({block:"start"}); el.querySelector("summary")?.focus(); }}>Ajustar conforto</a>
                <button onClick={askRestart} aria-keyshortcuts="Alt+Shift+R">Reiniciar com confirmação</button>
                </div>
              </details>
            </div>
            <div className="player-coverline">
              <GameCover id={game.id} name={game.name} category={game.category} compact />
              <div>
                <div className="player-kicker" aria-hidden="true">
                  <span>{game.category}</span>
                  <span>PG Arcade</span>
                </div>
                <h1 ref={heading} tabIndex={-1}>{game.name}</h1>
                <p className="player-description">{game.description}</p>
              </div>
            </div>
            <div className="player-gameplay-orientation" data-gameplay-orientation>
              <strong>Como jogar {game.name}</strong>
              <span>{gameHelp[game.id].split(". ")[0]}</span>
              <small data-player-record>{progress.records[game.id] ? `Sua melhor marca: ${progress.records[game.id]} ${recordUnits[game.id] ?? "pontos"}` : "Primeira partida — faça sua marca"}</small>
              <button
                type="button"
                className="gameplay-control-toggle"
                aria-pressed={preferences.controls === "large"}
                onClick={() => setPreferences(p => ({
                  ...p,
                  controls: p.controls === "large" ? "standard" : "large",
                }))}
              >
                {preferences.controls === "large" ? "Controles padrão" : "Ampliar controles"}
              </button>
            </div>
            {message && <p className="feedback" role="status">{message}</p>}

            <div className="experience-tools">
              <button onClick={focusBoard} aria-keyshortcuts="Alt+Shift+B">
                Ir para o tabuleiro
              </button>
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

              <details
                ref={quickHelp}
                key={game.id}
                onToggle={(event) => {
                  if (event.currentTarget.open)
                    window.dispatchEvent(new Event("pg-arcade-pause"));
                }}
              >
                <summary aria-keyshortcuts="Alt+Shift+H">
                  Ajuda rápida e controles
                </summary>
                <p>{gameHelp[game.id]}</p>
                <p>
                  Atalhos globais: Alt + Shift + B leva ao tabuleiro; Alt +
                  Shift + H abre a ajuda; Alt + Shift + R pede confirmação para
                  reiniciar. Eles ficam inativos enquanto você edita um campo.
                </p>
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
            <Suspense fallback={<p className="empty" role="status">Preparando partida…</p>}>
            <SessionChallenge key={`${game.id}-${session}`}>
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
            </SessionChallenge>
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
            {page === "catalogo" && <section className="hero">
              <div>
                <h1 ref={heading} tabIndex={-1}>Escolha. Jogue.<br/>Faça uma pausa.</h1>
                <p>{games.length} jogos no navegador, sem cadastro. Comece com um clássico ou encontre seu próximo desafio.</p>
                <a href="#catalogo" className="button primary" onClick={(event) => { event.preventDefault(); document.getElementById("catalogo")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" }); }}>Explorar jogos <ArrowRight size={19}/></a>
                {progress.last && <a className="last-game" href={`#/jogar/${progress.last}`} onClick={() => rememberCatalog(progress.last!)}>Iniciar nova partida: {games.find(g => g.id === progress.last)?.name}<ArrowRight size={15}/></a>}
              </div>
              <img src={`${import.meta.env.BASE_URL}assets/arcade-hero.webp`} alt="" width="1707" height="924" fetchPriority="high"/>
            </section>}
            {page === "catalogo" && !query && category === "Todos" && mode === "Todos" && <div className="discovery">
              <section aria-labelledby="start-picks"><div className="section-title"><h2 id="start-picks">Por onde começar</h2><p>Seis maneiras diferentes de jogar.</p></div><div className="curated-grid">{curated.map(g => renderCard(g, true))}</div></section>
              {visited.length > 0 && <section aria-labelledby="recent-picks"><div className="section-title"><h2 id="recent-picks">Volte a um jogo</h2><p>Nova partida. Visitas e recordes ficam neste navegador.</p></div><div className="personal-grid">{visited.map(g => renderCard(g, true))}</div></section>}
              {saved.length > 0 && <section aria-labelledby="saved-picks"><div className="section-title"><h2 id="saved-picks">Seus favoritos</h2><a href="#/favoritos">Ver todos</a></div><div className="personal-grid">{saved.map(g => renderCard(g, true))}</div></section>}
            </div>}
            {page === "favoritos" && <a className="button favorites-jump" href="#catalogo" onClick={(e) => { e.preventDefault(); document.getElementById("catalogo")?.scrollIntoView({block:"start"}); }}>Ver favoritos</a>}
            <section id="catalogo" className="catalog">
              <div className="catalog-heading">
                <h2 ref={page === "favoritos" ? heading : undefined} tabIndex={page === "favoritos" ? -1 : undefined}>
                  {page === "favoritos"
                    ? "Seus favoritos"
                    : "Explore os 100 jogos"}
                </h2>
                <label className="search">
                  <Search size={18} />
                  <input
                    aria-label="Buscar jogo"
                    ref={searchInput}
                    onKeyDown={(event) => { if (event.key === "Escape") { setQuery(""); event.currentTarget.blur(); } }}
                    placeholder="Buscar jogo"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="filters" aria-label="Categorias">
                {["Todos", ...new Set(games.map((g) => categoryGroup(g.category)))].map(
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
                <label>Modo <select aria-label="Filtrar por modo" value={mode} onChange={(e) => setMode(e.target.value)}><option>Todos</option><option value="Solo">Somente solo</option><option>Dupla local</option></select></label>
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
                {(query || category !== "Todos" || mode !== "Todos") && <button onClick={() => {setQuery(""); setCategory("Todos"); setMode("Todos");}}>Limpar filtros</button>}
                <button
                  disabled={!visible.length}
                  onClick={() => {
                    const id = visible[Math.floor(Math.random() * visible.length)].id;
                    rememberCatalog(id);
                    location.hash = `/jogar/${id}`;
                  }}
                >
                  Jogo surpresa
                </button>
              </div>
              <div className="game-grid">
                {sorted.map(g => renderCard(g))}

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
                      setMode("Todos");
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
        <details
          id="conforto"
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
      </main>
      <footer>
        <a href="#/">PG Arcade</a>
        <span>Feito para jogar. Sem cadastro.</span>
      </footer>
    </div>
  );
}
