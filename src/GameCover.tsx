import { memo, type CSSProperties } from "react";
import { coverArtFor } from "./lib/coverArt";
import "./GameCover.css";

type CoverProps = { id: string; name: string; category: string; compact?: boolean; priority?: boolean };

/** Arte local e leve: a capa preserva identidade e imagem sem uma árvore SVG por cartão. */
function GameCover({ id, name, category, compact = false, priority = false }: CoverProps) {
  const art = coverArtFor({ id, name, category });
  const style = {
    "--cover-background": art.background,
    "--cover-accent": art.accent,
    "--cover-secondary": art.secondary,
  } as CSSProperties;
  return (
    <div className={`preview game-cover${compact ? " game-cover-compact" : ""}`}
      data-game-cover={id} data-cover-fingerprint={art.fingerprint} aria-hidden="true">
      <div className="cover-backdrop" style={style}>
        <span className="cover-label">PG ARCADE</span>
        <span className="cover-chapter">{art.chapter}</span>
      </div>
      <img className="cover-mechanic" src={`${import.meta.env.BASE_URL}covers/${id}.svg`}
        width="240" height="150" alt="" loading={compact || priority ? "eager" : "lazy"}
        fetchPriority={compact || priority ? "high" : "low"} decoding="async" />
    </div>
  );
}
export default memo(GameCover);
