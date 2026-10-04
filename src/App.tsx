import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
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
import { readProgress, saveProgress, type Progress } from "./lib/progress";
import "./features/portfolio/components/PortfolioArcade.css";
const players = {
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
      setMessage("");
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
      if (!isGameId(page) || value <= 0) return;
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
    <>
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
          href="https://pabloguilherme1121.github.io/PG-portfolio/"
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
          <div ref={arena} className="player">
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
            <h1 ref={heading} tabIndex={-1}>
              {game.name}
            </h1>
            <p className="player-description">{game.description}</p>
            <p className="feedback" role="status">
              {message}
            </p>
            <GameError key={game.id}>
              <Suspense
                fallback={
                  <p className="empty" role="status">
                    Carregando {game.name}…
                  </p>
                }
              >
                <div
                  className={
                    ["2048", "snake", "memoria", "liga4", "puzzle"].includes(
                      game.id,
                    )
                      ? ""
                      : "legacy-game arcade-hub"
                  }
                  data-arcade-arena
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
            <div className="record-list">
              {games
                .filter((g) =>
                  ["2048", "snake", "memoria", "puzzle"].includes(g.id),
                )
                .map((g) => (
                  <a href={`#/jogar/${g.id}`} key={g.id}>
                    <span>{g.name}</span>
                    <strong>
                      {progress.records[g.id]
                        ? `${progress.records[g.id]} ${["memoria", "puzzle"].includes(g.id) ? "jogadas" : "pontos"}`
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
                    : "Clássicos e novos desafios para jogar no seu ritmo."}
                </p>
                <a
                  href="#catalogo"
                  className="button primary"
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById("catalogo")
                      ?.scrollIntoView({
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
                {["Todos", "Estratégia", "Reflexos", "Memória", "Esportes"].map(
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
                  <article className="game-card" key={g.id}>
                    <a
                      className="game-link"
                      href={`#/jogar/${g.id}`}
                      aria-label={`Jogar ${g.name}`}
                    >
                      <Preview id={g.id} />
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
    </>
  );
}
