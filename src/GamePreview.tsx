import { newGames, type NewGameId } from "./lib/newCatalog";
import { boardSnapshots, questionSnapshots } from "./lib/previewSnapshots";
import type { ReactNode } from "react";

const colors = ["#172a34", "#c9f65a", "#79b8ff", "#ffb46b", "#b59cff", "#ff8794"];
const numeric = ["latin", "sky", "futoshiki", "magic", "fifteen", "rotate", "takuzu", "links", "memorypath"];
function BoardScene({ id }: { id: string }) {
  const state = boardSnapshots[id];
  if (!state) return null;
  const n = state.size, cell = Math.min(24, 116 / n), left = (240 - cell * n) / 2, top = (150 - cell * n) / 2;
  if (id === "hex") return <>{Array.from({length:36},(_,i)=> {
    const x=49+(i%6)*20+Math.floor(i/6)*10, y=29+Math.floor(i/6)*18;
    return <polygon key={i} points={`${x},${y-10} ${x+9},${y-5} ${x+9},${y+5} ${x},${y+10} ${x-9},${y+5} ${x-9},${y-5}`} fill={[7,13,19].includes(i)?"#c9f65a":[9,15,21].includes(i)?"#79b8ff":"#233d49"} stroke="#668997"/>;
  })}</>;
  if (id === "loop") return <><path d="M74 29h92v92H74z" stroke="#c9f65a" strokeWidth="4" fill="none"/>{Array.from({length:16},(_,i)=><circle key={i} cx={74+(i%4)*30.7} cy={29+Math.floor(i/4)*30.7} r="4" fill="#79b8ff"/>)}</>;
  if (id === "mancala") return <>{state.cells.map((v, i) => <g key={i}><ellipse cx={31 + (i % 7) * 29} cy={i < 7 ? 48 : 98} rx="12" ry="18" fill="#355261"/><text x={31 + (i % 7) * 29} y={i < 7 ? 54 : 104} fill="#c9f65a" textAnchor="middle" fontSize="16">{v}</text></g>)}</>;
  if (["colorsort", "watersort"].includes(id)) return <>{Array.from({length: 6}, (_, i) => <g key={i}><rect x={24 + i * 30} y="28" width="23" height="96" rx="8" stroke="#79b8ff" fill="none"/>{state.cells.slice(i*4,(i+1)*4).map((v,j)=><rect key={j} x={27+i*30} y={32+j*20} width="17" height="18" rx={id==="colorsort"?8:2} fill={colors[v] || colors[0]}/>)}</g>)}</>;
  return <>{state.cells.map((value, i) => {
    const x = left + (i % n) * cell, y = top + Math.floor(i / n) * cell;
    if (value < 0) return null;
    const colored = ["flood", "same", "slideblock"].includes(id);
    const demoPiece = id === "queens" && [0,12,23].includes(i) || id === "gomoku" && [30,31,32].includes(i);
    return <g key={i}>
      <rect x={x+1} y={y+1} width={cell-2} height={cell-2} rx="3" fill={colored ? colors[Math.abs(value) % colors.length] : "#233d49"} stroke={state.fixed[i] ? "#597a88" : "#233d49"}/>
      {numeric.includes(id) && value > 0 && <text x={x+cell/2} y={y+cell*.7} textAnchor="middle" fill="#eef7e7" fontSize={cell*.55}>{id==="takuzu" ? value-1 : value}</text>}
      {["peg","gomoku","ataxx","isolation","breakthrough","territory","hex"].includes(id) && (value > 0 || demoPiece) && <circle cx={x+cell/2} cy={y+cell/2} r={cell*.3} fill={value===2?"#79b8ff":"#c9f65a"}/>}
      {["queens","knight"].includes(id) && (value > 0 || demoPiece) && <path d={`M${x+cell*.2} ${y+cell*.7} L${x+cell*.3} ${y+cell*.3} L${x+cell*.5} ${y+cell*.5} L${x+cell*.7} ${y+cell*.3} L${x+cell*.8} ${y+cell*.7} Z`} fill="#c9f65a"/>}
      {id==="pipes" && [1,2,4,8].map((bit,d)=>value&bit ? <path key={bit} d={`M${x+cell/2} ${y+cell/2} l${[cell/2,0,-cell/2,0][d]} ${[0,cell/2,0,-cell/2][d]}`} stroke="#c9f65a" strokeWidth="4"/> : null)}
      {id==="laser" && value > 0 && <path d={value===1?`M${x+4} ${y+cell-4}L${x+cell-4} ${y+4}`:`M${x+4} ${y+4}L${x+cell-4} ${y+cell-4}`} stroke="#79b8ff" strokeWidth="3"/>}
      {id==="memorypath" && [0,1,5,6,10].includes(i) && <text x={x+cell/2} y={y+cell*.7} textAnchor="middle" fill="#c9f65a" fontSize="14">{[0,1,5,6,10].indexOf(i)+1}</text>}
      {id==="chomp" && <rect x={x+cell*.35} y={y+cell*.35} width={cell*.3} height={cell*.3} fill={i===0?"#ff8794":"#ffb46b"}/>}
    </g>;
  })}{id==="futoshiki" && <text x="184" y="78" fill="#c9f65a" fontSize="24">&lt;</text>}{id==="sky" && state.aux.slice(0,4).map((v,i)=><text key={i} x={left+(i+.5)*cell} y={top-5} fill="#79b8ff" textAnchor="middle" fontSize="12">{v}</text>)}</>;
}
function QuizScene({ id }: { id: string }) {
  const q = questionSnapshots[id];
  if (!q) return null;
  if (q.grid.length) return <>{q.grid.slice(0,36).map((v,i)=><text key={i} x={65+(i%6)*20} y={28+Math.floor(i/6)*22} fill={i<6?"#c9f65a":"#79b8ff"} fontSize="15">{v}</text>)}</>;
  if (id==="estimate") return <>{Array.from({length: q.numbers.length || 18},(_,i)=><circle key={i} cx={35+(i%10)*18} cy={38+Math.floor(i/10)*20} r="5" fill="#c9f65a"/>)}</>;
  const lines = q.prompt.match(/.{1,28}(?:\s|$)|.{1,28}/g) || [q.prompt];
  return <>{lines.slice(0,3).map((line,i)=><text key={i} x="120" y={45+i*23} textAnchor="middle" fill={id==="stroop"?colors[q.color+1]:"#eef7e7"} fontSize="16">{line.trim()}</text>)}<text x="120" y="124" textAnchor="middle" fill="#c9f65a" fontSize="15">{(q.choices.length?q.choices:q.numbers.length?q.numbers:["P", "G", "A", "R", "C"]).slice(0,4).join("  ·  ")}</text></>;
}
function MotionScene({ id }: { id: string }) {
  const ball = <circle cx="116" cy="65" r="9" fill="#c9f65a"/>;
  const floor = <path d="M20 127H220" stroke="#668997" strokeWidth="3"/>;
  if (id==="rhythm") return <>{[0,1,2,3].map(i=><g key={i}><path d={`M${60+i*40} 15V130`} stroke="#34535f" strokeWidth="2"/><rect x={49+i*40} y={25+i*19} width="22" height="11" rx="3" fill={colors[i+1]}/><text x={60+i*40} y="143" fill="#eef7e7" textAnchor="middle" fontSize="12">{i+1}</text></g>)}<path d="M35 117H205" stroke="#c9f65a" strokeWidth="3"/></>;
  if (id==="balloons") return <>{[0,1,2,3].map(i=><g key={i}><ellipse cx={45+i*50} cy={50+(i%2)*30} rx="17" ry="22" fill={colors[i+1]}/><path d={`M${45+i*50} ${72+(i%2)*30}v24`} stroke="#668997"/><text x={45+i*50} y={55+(i%2)*30} textAnchor="middle" fill="#101922" fontSize="15">{i===3?"×":i+1}</text></g>)}</>;
  if (id==="stack") return <>{[0,1,2,3].map(i=><rect key={i} x={65+i*5} y={109-i*22} width={100-i*8} height="18" rx="3" fill={colors[(i%4)+1]}/>)}<rect x="118" y="15" width="68" height="18" rx="3" fill="#c9f65a"/>{floor}</>;
  if (id==="balance") return <>{ball}<path d="M49 106L191 91" stroke="#79b8ff" strokeWidth="9"/><path d="m120 98-14 31h28Z" fill="#668997"/>{floor}</>;
  if (id==="ski") return <>{[0,1,2].map(i=><g key={i}><path d={`M${60+i*55} 30v30M${85+i*55} 30v30`} stroke="#c9f65a" strokeWidth="3"/><path d={`m${48+i*70} 105 10-25 10 25Z`} fill="#79b8ff"/></g>)}<path d="m120 73 8 21m-12-1h17" stroke="#ffb46b" strokeWidth="4"/></>;
  if (id==="crossroad") return <>{[0,1,2].map(i=><g key={i}><path d={`M0 ${35+i*35}h240`} stroke="#34535f" strokeWidth="24"/><rect x={25+i*50} y={25+i*35} width="35" height="19" rx="5" fill={colors[i+2]}/></g>)}<circle cx="119" cy="137" r="7" fill="#c9f65a"/></>;
  if (id==="rope") return <><path d="M30 26Q120 165 210 26" stroke="#79b8ff" strokeWidth="4" fill="none"/>{ball}<path d="m116 75-10 28m10-28 10 28" stroke="#c9f65a" strokeWidth="4"/>{floor}</>;
  if (id==="ricochet") return <><path d="M40 118 220 42 128 16 64 50" stroke="#c9f65a" strokeWidth="2" strokeDasharray="5 5" fill="none"/>{[0,1,2].map(i=><circle key={i} cx={64+i*51} cy={50+i*24} r="10" fill="#79b8ff"/>)}<circle cx="40" cy="118" r="7" fill="#c9f65a"/></>;
  return <>{[0,1,2,3].map(i=><path key={i} d={`m${35+i*51} ${22+i%2*30} 7-7 10 8-4 11-12 1Z`} fill="#ffb46b"/>)}<path d={id==="meteors"?"M85 124H155":"M95 124h50l-18-15v-22"} stroke="#c9f65a" strokeWidth="8" fill="none"/>{floor}</>;
}
export default function GamePreview({ id }: { id: NewGameId }) {
  const game = newGames.find(g => g.id === id)!;
  let scene: ReactNode = game.family === "board" ? <BoardScene id={id}/> : game.family === "quiz" ? <QuizScene id={id}/> : <MotionScene id={id}/>;
  return <div className={`preview mechanic-preview preview-${game.family}`} data-preview-game={id} aria-hidden="true"><svg width="240" height="150" viewBox="0 0 240 150" focusable="false"><rect width="240" height="150" fill="#11232d"/>{scene}</svg></div>;
}
