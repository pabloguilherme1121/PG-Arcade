import { useMemo } from "react";
import type { games, GameId } from "./lib/catalog";
import type { Progress } from "./lib/progress";
import { previewModeTags, modeLabel, recommendGames } from "./lib/smartDiscovery";
import "./CatalogSpotlight.css";

/** Reuse #82's filtered local recommendation without loading any game engine. */
export default function CatalogSpotlight({ candidates, progress, remember }: {
  candidates: ReadonlyArray<typeof games[number]>; progress: Progress; remember: (id: GameId) => void;
}) {
  const game = useMemo(() => recommendGames(candidates, progress)[0], [candidates, progress]);
  if (!game) return null;
  const tags = previewModeTags(game);
  return <aside className="smart-spotlight" data-smart-spotlight aria-label="Próximo jogo sugerido">
    <div className="smart-spotlight-art" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}covers/${game.id}.svg`} alt="" width="240" height="150" loading="lazy" decoding="async" />
    </div>
    <div className="smart-spotlight-copy">
      <span className="smart-spotlight-eyebrow">Sua próxima partida</span>
      <h3>{game.name}</h3><p>{game.description}</p>
      <div className="smart-spotlight-modes" role="group" aria-label="Modos disponíveis">
        {tags.map(tag => <span key={tag} data-spotlight-mode={tag}>{modeLabel(tag)}</span>)}
      </div>
      <a className="smart-spotlight-play" href={`#/jogar/${game.id}`} onClick={() => remember(game.id)}>Jogar sugestão: {game.name}</a>
    </div>
  </aside>;
}
