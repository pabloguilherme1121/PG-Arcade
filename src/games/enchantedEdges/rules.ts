export type Difficulty=0|1|2;
export type Edge=0|1|2|3;
export type Tile=Readonly<{base:readonly [Edge,Edge,Edge,Edge];rotation:number}>;
export type EdgeGame=Readonly<{difficulty:Difficulty;seed:number;size:number;tiles:readonly Tile[];
 moves:number;history:readonly (readonly number[])[];phase:"playing"|"won";score:number}>;
const next=(n:number)=>(Math.imul(n,1664525)+1013904223)>>>0;
export function rotatedEdges(tile:Tile):[Edge,Edge,Edge,Edge] {
 return [0,1,2,3].map(i=>tile.base[((i-tile.rotation)%4+4)%4] as Edge) as [Edge,Edge,Edge,Edge];
}
export function countJoinedEdges(game:EdgeGame):number {
 let joined=0;
 for(let row=0;row<game.size;row++)for(let col=0;col<game.size;col++){
  const edges=rotatedEdges(game.tiles[row*game.size+col]);
  if(col+1<game.size){const right=rotatedEdges(game.tiles[row*game.size+col+1]);if(edges[1]!==0&&edges[1]===right[3])joined++;}
  if(row+1<game.size){const bottom=rotatedEdges(game.tiles[(row+1)*game.size+col]);if(edges[2]!==0&&edges[2]===bottom[0])joined++;}
 }
 return joined;
}
export function edgesSolved(game:EdgeGame):boolean {
 const size=game.size;
 if(countJoinedEdges(game)!==2*size*(size-1))return false;
 for(let row=0;row<size;row++)for(let col=0;col<size;col++){
  const e=rotatedEdges(game.tiles[row*size+col]);
  if((row===0&&e[0]!==0)||(col===size-1&&e[1]!==0)||
    (row===size-1&&e[2]!==0)||(col===0&&e[3]!==0))return false;
 }
 return true;
}
export function newEdgeGame(difficulty:Difficulty=0,seed=53):EdgeGame {
 if(![0,1,2].includes(difficulty)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)
  throw Error("Configuração inválida");
 const size=3+difficulty;let rng=seed;
 const horiz=Array.from({length:size*(size-1)},()=>{rng=next(rng);return (1+(rng%3)) as Edge;});
 const vertical=Array.from({length:size*(size-1)},()=>{rng=next(rng);return (1+(rng%3)) as Edge;});
 const tiles:Tile[]=Array.from({length:size*size},(_,i)=>{
  const row=Math.floor(i/size),col=i%size;
  const base:[Edge,Edge,Edge,Edge]=[
   row===0?0:vertical[(row-1)*size+col],
   col===size-1?0:horiz[row*(size-1)+col],
   row===size-1?0:vertical[row*size+col],
   col===0?0:horiz[row*(size-1)+col-1]
  ];
  rng=next(rng);return {base,rotation:(rng>>>16)%4};
 });
 const start={difficulty,seed,size,tiles,moves:0,history:[],phase:"playing" as const,score:0};
 if(edgesSolved(start))tiles[0]={...tiles[0],rotation:(tiles[0].rotation+1)%4};
 return {...start,tiles};
}
export function turnEdge(game:EdgeGame,index:number):EdgeGame {
 if(game.phase!=="playing"||!Number.isInteger(index)||index<0||index>=game.tiles.length)return game;
 const tiles=game.tiles.map((t,i)=>i===index?{...t,rotation:(t.rotation+1)%4}:t);
 const draft={...game,tiles,moves:game.moves+1,history:[...game.history,game.tiles.map(t=>t.rotation)]};
 const won=edgesSolved(draft);
 return {...draft,phase:won?"won":"playing",score:won?Math.max(100,1550+game.difficulty*200-draft.moves*14):0};
}
export function undoEdge(game:EdgeGame):EdgeGame {
 if(!game.history.length)return game;
 const rotations=game.history[game.history.length-1];
 return {...game,tiles:game.tiles.map((tile,i)=>({...tile,rotation:rotations[i]})),
  history:game.history.slice(0,-1),moves:Math.max(0,game.moves-1),phase:"playing",score:0};
}
export const restartEdges=(game:EdgeGame)=>newEdgeGame(game.difficulty,game.seed);
export const nextEdges=(game:EdgeGame)=>newEdgeGame(game.difficulty,next(game.seed));
