import { memo, useId } from "react";
import { coverArtFor } from "./lib/coverArt";
import "./GameCover.css";

type CoverProps = { id: string; name: string; category: string; compact?: boolean; priority?: boolean };

/** Local mechanic artwork loads on demand without loading a game engine. */
function GameCover({ id, name, category, compact = false, priority = false }: CoverProps) {
  const art = coverArtFor({ id, name, category });
  const instance = useId();
  const gradient = `cover-gradient-${id}-${instance}`;
  return (
    <div className={`preview game-cover${compact ? " game-cover-compact" : ""}`}
      data-game-cover={id} data-cover-fingerprint={art.fingerprint} aria-hidden="true">
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={art.background} />
            <stop offset="100%" stopColor="#080D1B" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill={`url(#${gradient})`} />
        <circle cx={320-art.offset} cy="57" r="116" fill={art.secondary} opacity=".10" />
        <circle cx="52" cy="224" r="134" fill={art.accent} opacity=".12" />
        <g stroke={art.secondary} fill="none" opacity=".18" strokeWidth="1.5">
          {Array.from({ length: 7 }, (_, i) =>
            <path key={i} d={`M${i*68-42} -10L${i*68+44} 250`} />)}
        </g>
        <path d="M23 26H79M23 26V58" stroke={art.secondary} strokeWidth="4" strokeLinecap="round" />
        <text x="24" y="207" fill="#F7F9FE" fontSize="15" letterSpacing="3" fontWeight="800" fontFamily="system-ui, sans-serif">PG ARCADE</text>
        <text x="374" y="207" fill={art.secondary} fontSize="16" letterSpacing="2" textAnchor="end" fontWeight="700" fontFamily="monospace">{art.chapter}</text>
      </svg>
      <img className="cover-mechanic" src={`${import.meta.env.BASE_URL}covers/${id}.svg`}
        width="240" height="150" alt="" loading={compact || priority ? "eager" : "lazy"} decoding="async" />
    </div>
  );
}
export default memo(GameCover);
