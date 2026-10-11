import { memo, useId } from "react";
import { coverArtFor } from "./lib/coverArt";
import "./GameCover.css";

type CoverProps = { id: string; name: string; category: string; compact?: boolean };

/** Lightweight, game-specific vector cover. No runtime fetches, fonts or canvas. */
function GameCover({ id, name, category, compact = false }: CoverProps) {
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
        <g transform={`translate(${196+Math.floor(art.offset/3)} 126) rotate(${art.rotation})`}>
          {art.ornament === 0 && (
            <>
              <rect x="-97" y="-78" width="194" height="156" rx="30" stroke={art.accent} fill={art.accent} fillOpacity=".12" strokeWidth="5" />
              {[-54,0,54].map(x=><path key={x} d={`M${x} -68V68M-87 ${x}H87`} stroke={art.secondary} strokeWidth="2" opacity=".5" />)}
            </>
          )}
          {art.ornament === 1 && (
            <>
              <ellipse rx="105" ry="65" stroke={art.accent} strokeWidth="6" fill={art.accent} fillOpacity=".08"/>
              <ellipse rx="76" ry="97" stroke={art.secondary} strokeWidth="3" fill="none"/>
              <circle cx="-81" cy="-41" r="11" fill={art.secondary}/>
              <circle cx="85" cy="40" r="8" fill={art.accent}/>
            </>
          )}
          {art.ornament === 2 && (
            <>
              <path d="M0 -98L100 -15L62 83L-54 91L-104 -13Z" fill={art.accent} fillOpacity=".13" stroke={art.accent} strokeWidth="5"/>
              <path d="M-82 0H82M0 -85V84" stroke={art.secondary} strokeWidth="4" opacity=".5"/>
            </>
          )}
          {art.ornament === 3 && (
            <>
              {[-1,0,1].map(i=><rect key={i} x={i*58-22} y={-62+(i%2)*12} width="44" height="124" rx="13" fill={i===0?art.accent:art.secondary} fillOpacity=".19" stroke={i===0?art.accent:art.secondary} strokeWidth="3"/>)}
            </>
          )}
          {art.ornament === 4 && (
            <>
              <path d="M-109 59L-18 -91L108 68L-109 59Z" fill={art.accent} fillOpacity=".12" stroke={art.accent} strokeWidth="5"/>
              <path d="M-65 -34L78 -34M-65 16L78 16" stroke={art.secondary} strokeWidth="4" strokeDasharray="10 9" opacity=".75"/>
              <circle cx="87" cy="-65" r="16" fill={art.secondary}/>
            </>
          )}
        </g>
        <rect x="119" y="80" width="162" height="92" rx="24" fill="#091425" fillOpacity=".66" stroke={art.accent} strokeOpacity=".58" strokeWidth="2"/>
        <text x="200" y="144" fontSize={art.code.length===3?61:68} fontFamily="system-ui, sans-serif"
          fontWeight="900" letterSpacing="2" textAnchor="middle" fill={art.accent}>{art.code}</text>
        <path d="M23 26H79M23 26V58" stroke={art.secondary} strokeWidth="4" strokeLinecap="round" />
        <text x="24" y="207" fill="#F7F9FE" fontSize="15" letterSpacing="3" fontWeight="800" fontFamily="system-ui, sans-serif">PG ARCADE</text>
        <text x="374" y="207" fill={art.secondary} fontSize="16" letterSpacing="2" textAnchor="end" fontWeight="700" fontFamily="monospace">{art.chapter}</text>
      </svg>
    </div>
  );
}
export default memo(GameCover);
