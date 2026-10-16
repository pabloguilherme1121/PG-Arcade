import { Heart } from "lucide-react";
import GameCover from "./GameCover";
import "./CatalogGameCard.css";
import type { games, GameId } from "./lib/catalog";
import { categoryGroup, gameMode } from "./lib/discovery";
import { modeLabel, previewModeTags } from "./lib/smartDiscovery";

type Game = (typeof games)[number];

type Props = {
  game: Game;
  contextual?: boolean;
  priority?: boolean;
  isFavorite: boolean;
  onOpen: (id: GameId) => void;
  onFavorite: (id: GameId) => void;
};

/** Single source of truth for curated and searchable game cards. */
export default function CatalogGameCard({
  game, contextual = false, priority = false, isFavorite, onOpen, onFavorite,
}: Props) {
  const modes = previewModeTags(game);
  return (
    <article
      className={contextual ? "curated-card" : "game-card"}
      data-game-category={game.category}
      data-catalog-game={contextual ? undefined : game.id}
    >
      <a
        className="game-link"
        href={`#/jogar/${game.id}`}
        aria-label={`${contextual ? "Começar com" : "Jogar"} ${game.name}`}
        onClick={() => onOpen(game.id)}
      >
        <GameCover id={game.id} name={game.name} category={game.category} priority={priority} />
        <span className="game-category">{categoryGroup(game.category)}</span>
        <div className="card-mode-tags" role="group" aria-label="Estilos e modos disponíveis">
          {modes.map(mode => <span key={mode} data-game-mode={mode}>{modeLabel(mode)}</span>)}
        </div>
        <h3>{game.name}</h3>
        <p>{game.description}</p>
        <span className="game-metadata">{gameMode(game.id)} · Teclado e toque</span>
      </a>
      <button
        className="favorite"
        onClick={() => onFavorite(game.id)}
        aria-label={`${contextual ? "Seleção: " : ""}${isFavorite ? "Remover" : "Adicionar"} ${game.name} ${isFavorite ? "dos" : "aos"} favoritos`}
        aria-pressed={isFavorite}
      >
        <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </article>
  );
}
