import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, Compass, Crown, Flag,
  Heart, Map as MapIcon, RotateCcw, Search, Shield, Swords, Undo2,
} from "lucide-react";
import GameCover from "../GameCover";
import type { games, GameId } from "../lib/catalog";
import {
  STRATEGY_FAMILIES, STRATEGY_MISSIONS, STRATEGY_PATH, missionById,
  newStrategySession, playCell, playWave,
  type BuildKind, type Mission, type StrategyFamily, type StrategySession,
} from "./strategyEngine";
import "./StrategySite.css";

type ArcadeGame = (typeof games)[number];
type Props = {
  games: readonly ArcadeGame[];
  favorites: readonly GameId[];
  onOpen: (id: GameId) => void;
  onFavorite: (id: GameId) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};
type FamilyFilter = StrategyFamily | "todos";
const KEY = "pg-strategy-records-v1";
const FAMILY_ICON = {
  territorio: Crown, rotas: MapIcon, exploracao: Compass,
  economia: Flag, defesa: Shield,
} as const;
const icons: Record<string, string> = {fazenda: "◆", mercado: "◈", torre: "♜"};
const path = new Set<number>(STRATEGY_PATH);

function readMission(): string | null {
  if (typeof window === "undefined") return null;
  const match = /^#\/estrategia\/jogo\/([a-z0-9-]+)$/.exec(window.location.hash);
  return match && missionById(match[1]) ? match[1] : null;
}
function readScores(): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id, score]) =>
      Boolean(missionById(id)) && typeof score === "number" &&
      Number.isSafeInteger(score) && score > 0 && score <= 100000));
  } catch { return {}; }
}
function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}
function cellName(cell: number, mission: Mission, session: StrategySession) {
  const label = "Linha " + (Math.floor(cell / 6) + 1) + ", coluna " + (cell % 6 + 1);
  if (mission.obstacles.includes(cell)) return label + ", terreno bloqueado";
  if (mission.family === "defesa" && cell === 35) return label + ", base protegida";
  if (session.structures.some(s => s.cell === cell)) return label + ", construção instalada";
  if (session.position === cell && mission.family === "exploracao") return label + ", sua expedição";
  if (cell === 35) return label + ", destino estratégico";
  if (mission.family === "exploracao" && [3, 23].includes(cell)) {
    return label + (session.collected.includes(cell) ? ", relíquia coletada" : ", relíquia disponível");
  }
  if (session.captured.includes(cell)) return label + ", território controlado";
  return label + ", terreno disponível";
}
function Board({ mission, session, onCell }: {
  mission: Mission; session: StrategySession; onCell: (index: number) => void;
}) {
  return (
    <div className="st-board-scroll">
      <div className="st-board" role="group" aria-label={"Tabuleiro estratégico de " + mission.name}>
        {Array.from({ length: 36 }, (_, cell) => {
          const obstacle = mission.obstacles.includes(cell);
          const building = session.structures.find(s => s.cell === cell);
          const owned = session.captured.includes(cell);
          const onRoute = path.has(cell);
          const goal = cell === 35;
          const actor = mission.family === "exploracao" && session.position === cell;
          const artifact = mission.family === "exploracao" && [3, 23].includes(cell) && !session.collected.includes(cell);
          const disabled = obstacle || session.phase !== "playing" || mission.family === "defesa" && session.wave > 0;
          return (
            <button
              type="button"
              key={cell}
              aria-label={cellName(cell, mission, session)}
              aria-pressed={owned && !actor}
              disabled={disabled}
              onClick={() => onCell(cell)}
              className={[
                "st-cell", obstacle ? "st-cell--blocked" : "",
                onRoute ? "st-cell--route" : "", owned ? "st-cell--owned" : "",
                goal ? "st-cell--goal" : "", actor ? "st-cell--actor" : "",
                building ? "st-cell--building" : "",
              ].filter(Boolean).join(" ")}
            >
              <span aria-hidden="true">{building ? icons[building.kind] :
                actor ? "●" : artifact ? "✦" : goal ? mission.family === "defesa" ? "♜" : "⚑" :
                  cell === 0 && mission.family !== "economia" && mission.family !== "defesa" ? "⌂" :
                    owned ? "•" : obstacle ? "×" : onRoute ? "·" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function getInstructions(mission: Mission) {
  switch (mission.family) {
    case "territorio": return "Conquiste apenas casas vizinhas a uma posição sua. Alcance a bandeira antes que os movimentos acabem.";
    case "rotas": return "Conecte casas vizinhas à última via construída. É preciso levar a rota do posto inicial à bandeira.";
    case "exploracao": return "Clique em casas vizinhas ao explorador. Recolha as duas estrelas nos setores 3 e 23 e depois alcance a bandeira.";
    case "economia": return "Selecione fazendas ou mercados e toque no território. Fazendas geram 3; mercados junto a uma fazenda geram 5.";
    case "defesa": return "Posicione torres em casas disponíveis. Depois avance cada onda. Torres próximas à rota interceptam os ataques.";
  }
}
function MissionPlayer({ mission, onBack, scores, onWin }: {
  mission: Mission; onBack: () => void;
  scores: Record<string, number>; onWin: (missionId: string, score: number) => void;
}) {
  const [session, setSession] = useState(() => newStrategySession(mission));
  const [past, setPast] = useState<StrategySession[]>([]);
  const [build, setBuild] = useState<BuildKind>("fazenda");
  useEffect(() => { setSession(newStrategySession(mission)); setPast([]); setBuild("fazenda"); }, [mission]);
  const advance = useCallback((next: StrategySession) => {
    if (next === session) return;
    setPast(previous => [...previous.slice(-29), session]);
    setSession(next);
    if (next.phase === "won") onWin(mission.id, next.score);
  }, [session, mission.id, onWin]);
  const handleCell = (cell: number) => {
    const kind: BuildKind = mission.family === "defesa" ? "torre" : build;
    advance(playCell(session, mission, cell, kind));
  };
  const family = STRATEGY_FAMILIES.find(item => item.id === mission.family)!;
  const Icon = FAMILY_ICON[mission.family];
  return (
    <section className="st-arena" aria-label={"Partida: " + mission.name} data-strategy-arena={mission.id}>
      <div className="st-arena-head">
        <button type="button" onClick={onBack}><ArrowLeft size={18}/> Voltar à campanha</button>
        <span className="st-level-pill"><Icon size={15}/>{family.name} / Nível {mission.tier}</span>
      </div>
      <div className="st-arena-layout">
        <div>
          <p className="st-eyebrow">OPERAÇÃO {String(mission.index).padStart(2, "0")}</p>
          <h2>{mission.name}</h2>
          <p className="st-arena-lead">{getInstructions(mission)}</p>
          <div className="st-metrics" aria-label="Estado da partida">
            <span><small>Recursos</small><strong>{session.energy}</strong></span>
            <span><small>Turnos</small><strong>{session.turns}</strong></span>
            <span><small>{mission.family === "defesa" ? "Base" : "Meta"}</small>
              <strong>{mission.family === "defesa" ? session.health + "/5" :
                mission.family === "economia" ? session.production + "/" + mission.target :
                mission.family === "exploracao" ? session.collected.length + "/2" : "Bandeira"}</strong></span>
            {mission.family === "defesa" && <span><small>Onda</small><strong>{session.wave}/3</strong></span>}
          </div>
          {(mission.family === "economia") &&
            <div className="st-build" role="group" aria-label="Tipo de construção">
              <button type="button" aria-pressed={build === "fazenda"} onClick={() => setBuild("fazenda")}>◆ Fazenda · 3</button>
              <button type="button" aria-pressed={build === "mercado"} onClick={() => setBuild("mercado")}>◈ Mercado · até 5</button>
            </div>}
          {mission.family === "defesa" && <p className="st-hint">Torre ♜ · custo de 1 recurso. A rota luminosa indica o caminho dos ataques.</p>}
          <div className="st-actions">
            {mission.family === "defesa" && session.phase === "playing" &&
              <button type="button" className="st-primary" onClick={() => advance(playWave(session, mission))}>
                <Shield size={17}/> Avançar onda {Math.min(3, session.wave + 1)}
              </button>}
            <button type="button" disabled={!past.length} onClick={() => {
              const previous = past[past.length - 1];
              if (!previous) return;
              setPast(items => items.slice(0, -1));
              setSession(previous);
            }}><Undo2 size={16}/> Desfazer</button>
            <button type="button" onClick={() => { setSession(newStrategySession(mission)); setPast([]); }}>
              <RotateCcw size={16}/> Reiniciar
            </button>
          </div>
          <p className="st-session-status" role="status" aria-live="polite" data-strategy-result={session.phase}>
            {session.phase === "won" ? "Operação concluída. Vitória estratégica! " + session.score + " pontos." :
              session.phase === "lost" ? "Operação encerrada. Reveja o plano e tente novamente." :
                mission.family === "defesa" ? "Prepare torres e avance as ondas para proteger a base." :
                  "Escolha um setor do tabuleiro. Cada decisão consome um recurso."}
          </p>
          {scores[mission.id] && <p className="st-best">Melhor pontuação neste aparelho: {scores[mission.id]}</p>}
        </div>
        <Board mission={mission} session={session} onCell={handleCell}/>
      </div>
    </section>
  );
}
export default function StrategySite({ games, favorites, onOpen, onFavorite, headingRef }: Props) {
  const [activeId, setActiveId] = useState(readMission);
  const [family, setFamily] = useState<FamilyFilter>("todos");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(24);
  const [scores, setScores] = useState(readScores);
  useEffect(() => {
    const update = () => setActiveId(readMission());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const onWin = useCallback((id: string, score: number) => {
    setScores(current => {
      if ((current[id] || 0) >= score) return current;
      const updated = { ...current, [id]: score };
      try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* Local scores are optional. */ }
      return updated;
    });
  }, []);
  const missions = useMemo(() => {
    const q = normalize(query);
    return STRATEGY_MISSIONS.filter(m => (family === "todos" || m.family === family) &&
      (!q || normalize(m.name + " " + m.description + " " + m.id).includes(q)));
  }, [query, family]);
  const game = activeId ? missionById(activeId) : undefined;
  const played = Object.keys(scores).length;
  const completed = played;
  const startMission = (mission: Mission) => {
    setActiveId(mission.id);
    window.location.hash = "/estrategia/jogo/" + mission.id;
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const leaveMission = () => {
    setActiveId(null);
    window.location.hash = "/estrategia";
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <div className="strategy-site" data-pg-strategy>
      <div className="st-mini-nav" role="navigation" aria-label="Conexão PG Estratégia e PG Arcade">
        <a href="#/" className="st-back"><ArrowLeft size={17}/> PG Arcade</a>
        <span>PG TECH <span aria-hidden="true">/</span> UNIVERSO DE JOGOS <span aria-hidden="true">/</span> ESTRATÉGIA</span>
        <a href="https://pabloguilherme1121.github.io/PG-portfolio/#projetos" target="_blank" rel="noopener noreferrer">Portfólio <ArrowRight size={16}/></a>
      </div>
      {game ? (
        <MissionPlayer key={game.id} mission={game} scores={scores} onBack={leaveMission} onWin={onWin}/>
      ) : (
        <>
          <section className="st-hero" aria-labelledby="st-title">
            <div className="st-hero-copy">
              <p className="st-eyebrow"><Swords size={16}/> NOVO UNIVERSO · PG TECH</p>
              <h1 id="st-title" ref={headingRef} tabIndex={-1}>PG <em>Estratégia.</em></h1>
              <p>Planeje o próximo movimento. Domine o tabuleiro. Vença por decisão, não por sorte.</p>
              <div className="st-hero-buttons">
                <button type="button" className="st-primary" onClick={() => document.getElementById("st-campaign")?.scrollIntoView({block:"start"})}>Explorar 150 operações <ArrowRight size={18}/></button>
                <button type="button" onClick={() => document.getElementById("st-classics")?.scrollIntoView({block:"start"})}>Jogos estratégicos do Arcade</button>
              </div>
              <div className="st-hero-stats">
                <span><strong>150</strong><small>missões jogáveis</small></span>
                <span><strong>05</strong><small>mecânicas táticas</small></span>
                <span><strong>{completed}</strong><small>vitórias locais</small></span>
              </div>
            </div>
            <div className="st-hero-visual" aria-hidden="true">
              <div className="st-visual-frame">
                <span className="st-visual-hud">MAPA TÁTICO <span>01 / 05</span></span>
                <div className="st-visual-grid">
                  {Array.from({ length: 36 }, (_, i) => <span key={i} className={path.has(i) ? "st-visual-path" : ""}>{i === 0 ? "⌂" : i === 35 ? "⚑" : [3, 11, 23].includes(i) ? "◈" : ""}</span>)}
                </div>
                <span className="st-visual-foot">PENSE · CONSTRUA · CONQUISTE</span>
              </div>
            </div>
          </section>
          <section className="st-campaign" id="st-campaign" aria-labelledby="st-campaign-title">
            <div className="st-section-heading">
              <div><p className="st-eyebrow">CENTRAL DE CAMPANHAS</p><h2 id="st-campaign-title">Escolha sua operação</h2></div>
              <span>{missions.length} / 150 missões</span>
            </div>
            <p className="st-section-lead">Cinco mecânicas originais e 30 mapas determinísticos por mecânica. Cada missão é jogável e possui recursos, objetivo e condição de vitória próprios.</p>
            <div className="st-filter-row">
              <div className="st-family-filters" role="group" aria-label="Filtrar estilo de estratégia">
                <button type="button" aria-pressed={family === "todos"} onClick={() => { setFamily("todos"); setShown(24); }}>Todas <span>150</span></button>
                {STRATEGY_FAMILIES.map(f => {
                  const Icon = FAMILY_ICON[f.id];
                  return <button type="button" key={f.id} aria-pressed={family === f.id} onClick={() => { setFamily(f.id); setShown(24); }}>
                    <Icon size={16}/> {f.name} <span>30</span>
                  </button>;
                })}
              </div>
              <label className="st-search"><Search size={18}/><span className="sr-only">Buscar missões de estratégia</span>
                <input type="search" value={query} placeholder="Buscar operação…" onChange={e => { setQuery(e.target.value); setShown(24); }} aria-label="Buscar missões"/>
              </label>
            </div>
            <div className="st-missions-grid">
              {missions.slice(0, shown).map(m => {
                const f = STRATEGY_FAMILIES.find(item => item.id === m.family)!;
                const Icon = FAMILY_ICON[m.family];
                return (
                  <article key={m.id} className={"st-mission-card st-mission-card--" + f.tone}>
                    <div className="st-mission-art" aria-hidden="true"><Icon size={38}/><span>{String(m.index).padStart(2, "0")}</span></div>
                    <div className="st-mission-copy">
                      <span className="st-mission-overline">{f.name} · nível {m.tier}</span>
                      <h3>{m.name}</h3><p>{m.description}</p>
                      <div className="st-mission-bottom">
                        <span>{scores[m.id] ? "Concluída · " + scores[m.id] + " pts" : m.budget + " recursos"}</span>
                        <button type="button" onClick={() => startMission(m)} aria-label={"Jogar missão " + m.name}>
                          Jogar <ChevronRight size={16}/>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {!missions.length && <p className="st-empty" role="status">Nenhuma missão encontrada. Tente outra busca ou família.</p>}
            {missions.length > shown && <button type="button" className="st-show-more" onClick={() => setShown(x => Math.min(missions.length, x + 24))}>
              Ver mais operações ({missions.length - shown} restantes) <ArrowRight size={17}/>
            </button>}
          </section>
          <section className="st-classics" id="st-classics" aria-labelledby="st-classics-title">
            <div className="st-section-heading"><div><p className="st-eyebrow">CONEXÃO COM PG ARCADE</p>
              <h2 id="st-classics-title">Jogos estratégicos originais</h2></div>
              <span>{games.length} jogos já publicados</span>
            </div>
            <p className="st-section-lead">Os jogos de estratégia existentes continuam no mesmo motor PG Arcade, compartilhando favoritos, recordes, modos e controles. Volte para esta central após a partida.</p>
            <div className="st-original-grid">
              {games.map(g => (
                <article key={g.id} className="st-original-card">
                  <a href={"#/jogar/" + g.id} onClick={() => onOpen(g.id)} aria-label={"Jogar " + g.name + " no PG Arcade"}>
                    <GameCover id={g.id} name={g.name} category={g.category}/>
                    <h3>{g.name}</h3><p>{g.description}</p><span>Jogar no Arcade <ArrowRight size={15}/></span>
                  </a>
                  <button type="button" aria-pressed={favorites.includes(g.id)}
                    onClick={() => onFavorite(g.id)}
                    aria-label={(favorites.includes(g.id) ? "Remover " : "Adicionar ") + g.name + (favorites.includes(g.id) ? " dos favoritos" : " aos favoritos")}>
                    <Heart size={18} fill={favorites.includes(g.id) ? "currentColor" : "none"}/>
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section className="st-transparency">
            <BookOpen size={22}/><div><h2>150 operações, cinco motores de estratégia.</h2>
              <p>As 150 missões são variações jogáveis de cinco conjuntos de regras — não 150 motores independentes. Todas funcionam no navegador, sem cadastro ou compras. Seus resultados ficam apenas neste aparelho. O PG Arcade mantém seu catálogo original de 150 jogos sem misturar categorias.</p>
            </div><a href="#/">Explorar PG Arcade <ArrowRight size={16}/></a>
          </section>
        </>
      )}
    </div>
  );
}
