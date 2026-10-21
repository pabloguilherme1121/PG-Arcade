import { memo, type CSSProperties } from "react";
import { coverArtFor } from "./lib/coverArt";
import "./GameCover.css";

type CoverProps = { id: string; name: string; category: string; compact?: boolean; priority?: boolean };

/** Keep one real mechanics image and one CSS background per cover, not an SVG scene for every card. */
function GameCover({ id, name, category, compact = false, priority = false }: CoverProps) {
  const art = coverArtFor({ id, name, category });
  const style = {
    "--cover-base": art.background,
    "--cover-accent": art.accent,
    "--cover-secondary": art.secondary,
    "--cover-orbit": `${70+art.offset/3}%`,
    "--cover-angle": `${112+art.rotation}deg`,
  } as CSSProperties;
  return (
    <div className={`preview game-cover${compact ? " game-cover-compact" : ""}`}
      data-game-cover={id} data-cover-fingerprint={art.fingerprint}
      aria-hidden="true" style={style}>
      <img className="cover-mechanic" src={`${import.meta.env.BASE_URL}covers/${id}.svg`}
        width="240" height="150" alt="" loading={compact || priority ? "eager" : "lazy"}
        fetchPriority={compact || priority ? "high" : "low"} decoding="async" />
      <span className="cover-brand">PG ARCADE</span>
      <span className="cover-chapter">{art.chapter}</span>
    </div>
  );
}
export default memo(GameCover);
