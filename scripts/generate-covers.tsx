import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { games } from '../src/lib/catalog';
import { newGames } from '../src/lib/newCatalog';
import { expandedGames } from '../src/lib/expandedCatalog';
import GamePreview from '../src/GamePreview';

function OriginalScene({ id }: {id: string}) {
  if (id==='xadrez') return <>{Array.from({length:64},(_,i)=><rect key={i} x={64+i%8*14} y={19+Math.floor(i/8)*14} width="14" height="14" fill={(i+Math.floor(i/8))%2?'#42636a':'#cfdbc0'}/>)}<g transform="translate(120 63)" stroke="#0e2330" strokeWidth="2" fill="#fff2cc"><path d="M-6-13H6V-5H12V1H6V12H-6V1H-12V-5H-6ZM-10 14H10L15 34H-15Z"/><path d="M-18 36H18V42H-18Z"/></g></>;
  if (id==='velha') return <><path d="M94 20v110M146 20v110M43 56h154M43 94h154" stroke="#527584" strokeWidth="4"/><path d="m56 28 24 20m0-20-24 20m52 48 24 20m0-20-24 20m52 48 24 20m0-20-24 20" stroke="#c9f65a" strokeWidth="5"/><circle cx="171" cy="37" r="12" stroke="#79b8ff" strokeWidth="5" fill="none"/><circle cx="68" cy="112" r="12" stroke="#79b8ff" strokeWidth="5" fill="none"/></>;
  if (id==='sequencia') return <>{['#ff8794','#79b8ff','#c9f65a','#ffb46b'].map((color,i)=><rect key={color} x={63+i%2*59} y={22+Math.floor(i/2)*56} width="53" height="50" rx="12" fill={color} opacity={i===2?1:.45} stroke={i===2?'white':'#ffffff44'} strokeWidth="3"/>)}</>;
  if (['corrida','rally','coleta','estacionamento'].includes(id)) return <><path d="M62 0h116l34 150H28Z" fill="#314252"/><path d="M120 0v150" stroke="#fff2b4" strokeWidth="3" strokeDasharray="12 12"/><rect x="80" y="77" width="29" height="49" rx="8" fill="#c9f65a"/><rect x="84" y="88" width="21" height="15" rx="3" fill="#203c56"/><rect x="144" y="29" width="28" height="45" rx="7" fill="#ff8794"/></>;
  if (['tiro','orbital','estrelas'].includes(id)) return <>{Array.from({length:24},(_,i)=><circle key={i} cx={(i*71)%240} cy={(i*43)%150} r={i%3===0?2:1} fill="#79b8ff"/>)}<path d="m120 92-21 42 21-10 21 10Z" fill="#c9f65a"/><path d="M120 78V48" stroke="#ffe8a3" strokeWidth="4"/><circle cx="120" cy="31" r="15" fill="#ff8794"/><circle cx="187" cy="67" r="10" fill="#ffb46b"/></>;
  if (id==='blocos') return <><rect x="43" y="6" width="154" height="138" rx="14" fill="#1d3948"/>{Array.from({length:64},(_,i)=><rect key={i} x={50+i%8*18} y={13+Math.floor(i/8)*16} width="15" height="13" rx="2" fill={[4,12,20,28,35,36,37,38,39,47,55,63].includes(i)?"#c9f65a":[0,1,8,17,18,25,26].includes(i)?"#79b8ff":"#38566a"}/>)}</>;
  if (id==='snake') return <><path d="M47 115V47h72v38h45" stroke="#86b855" strokeWidth="18" fill="none" strokeLinejoin="round"/><rect x="155" y="74" width="25" height="23" rx="7" fill="#c9f65a"/><circle cx="172" cy="78" r="3" fill="#102132"/><circle cx="199" cy="112" r="9" fill="#ff8794"/></>;
  if (id==='futebol') return <><rect x="18" y="17" width="204" height="116" rx="4" fill="#245d40" stroke="#d6ead4"/><path d="M120 17v116M18 46h30v58H18M222 46h-30v58h30" stroke="#d6ead4" fill="none"/><circle cx="120" cy="75" r="25" stroke="#d6ead4" fill="none"/><circle cx="143" cy="86" r="8" fill="white"/><circle cx="93" cy="86" r="10" fill="#79b8ff"/></>;
  if (id==='domino') return <>{[0,1,2].map(i=><g key={i} transform={`translate(${44+i*61} ${38+i%2*15}) rotate(${i*8-8})`}><rect width="40" height="76" rx="7" fill="#e7e7cc"/><path d="M3 38h34" stroke="#3a4749"/>{Array.from({length:i+2},(_,j)=><circle key={j} cx={12+j%2*16} cy={12+Math.floor(j/2)*14} r="3" fill="#152638"/>)}<circle cx="20" cy="56" r="4" fill="#152638"/></g>)}</>;
  if (['reflexo','luzes','sequencia','memoria','minas','liga4','puzzle','2048','palavra','velha','xadrez','damas'].includes(id)) {
    const n=id==='liga4'?7:id==='palavra'?5:4;
    return <>{Array.from({length:n*4},(_,i)=>{const x=29+i%n*(182/n),y=23+Math.floor(i/n)*27;const lit=[1,5,6,10,14].includes(i);return <g key={i}><rect x={x} y={y} width={182/n-3} height="24" rx="4" fill={lit?'#466674':'#233d49'} stroke="#527584"/>{id==='2048'||id==='puzzle'?<text x={x+182/n/2-2} y={y+18} textAnchor="middle" fill="#c9f65a" fontSize="15">{id==='2048'?[2,4,8,16][i%4]:i+1}</text>:id==='palavra'?<text x={x+14} y={y+18} fill="#c9f65a" fontSize="16">{'JOGAR'[i%5]}</text>:lit?<circle cx={x+182/n/2-2} cy={y+12} r="8" fill={id==='damas'||id==='xadrez'?'#e8d9b0':i%2?'#c9f65a':'#79b8ff'}/>:null}</g>})}</>;
  }
  return <><circle cx="120" cy="75" r="49" stroke="#79b8ff" strokeWidth="5" fill="#233d49"/><circle cx="120" cy="75" r="30" stroke="#ffb46b" strokeWidth="7" fill="none"/><circle cx="120" cy="75" r="12" fill="#c9f65a"/></>;
}

mkdirSync('public/covers', {recursive:true});
for (const game of games) {
  let svg: string;
  const recent = newGames.find(g=>g.id===game.id);
  if (recent) {
    const markup=renderToStaticMarkup(<GamePreview id={recent.id}/>);
    svg=markup.slice(markup.indexOf('<svg'),markup.indexOf('</svg>')+6);
  } else if (expandedGames.some(g=>g.id===game.id)) {
    svg=readFileSync(`public/previews/${game.id}.svg`,'utf8');
  } else {
    svg=renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150" viewBox="0 0 240 150"><rect width="240" height="150" fill="#11232d"/><OriginalScene id={game.id}/></svg>);
  }
  if (!svg.includes('xmlns=')) svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
  writeFileSync(`public/covers/${game.id}.svg`,svg);
}
