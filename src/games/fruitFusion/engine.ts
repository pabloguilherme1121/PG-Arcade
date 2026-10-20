export type FruitDifficulty = "easy" | "normal" | "hard";
export type FruitPhase = "ready" | "playing" | "paused" | "won" | "lost";
export type FruitState = Readonly<{
  cells: readonly number[];
  difficulty: FruitDifficulty;
  seed: number;
  next: 1 | 2;
  turn: number;
  turnLimit: number;
  score: number;
  phase: FruitPhase;
}>;
export const fruitSize = { width: 6, height: 7 } as const;
const turnLimits: Record<FruitDifficulty, number> = { easy: 35, normal: 27, hard: 21 };
const nextSeed = (seed:number) => (Math.imul(seed,1664525)+1013904223)>>>0;
export function createFruitGame(difficulty:FruitDifficulty="normal",seed=1):FruitState {
  if(!turnLimits[difficulty] || !Number.isInteger(seed) || seed<0 || seed>0xffffffff)
    throw Error("Configuração inválida de Frutas em Fusão.");
  return {cells:Array(fruitSize.width*fruitSize.height).fill(0),difficulty,
    seed,next:1,turn:0,turnLimit:turnLimits[difficulty],score:0,phase:"ready"};
}
export function startFruitGame(state:FruitState):FruitState {
  return state.phase==="ready"?{...state,phase:"playing"}:state;
}
export function pauseFruitGame(state:FruitState):FruitState {
  return state.phase==="playing"?{...state,phase:"paused"}:state;
}
export function resumeFruitGame(state:FruitState):FruitState {
  return state.phase==="paused"?{...state,phase:"playing"}:state;
}
function gravity(cells:number[]) {
  for(let c=0;c<fruitSize.width;c++){
    const items=[];
    for(let r=fruitSize.height-1;r>=0;r--)if(cells[r*fruitSize.width+c])items.push(cells[r*fruitSize.width+c]);
    for(let r=fruitSize.height-1;r>=0;r--)
      cells[r*fruitSize.width+c]=items[fruitSize.height-1-r]??0;
  }
}
function combine(cells:number[]):number {
  let gained=0;
  for(let i=0;i<150;i++){
    let merged=false;
    for(let r=0;r<fruitSize.height&&!merged;r++)
      for(let c=0;c<fruitSize.width&&!merged;c++){
        const pos=r*fruitSize.width+c, tier=cells[pos];
        if(!tier || tier>=6)continue;
        for(const [dr,dc] of [[1,0],[0,1]]){
          const nr=r+dr,nc=c+dc;
          if(nr>=fruitSize.height||nc>=fruitSize.width)continue;
          const other=nr*fruitSize.width+nc;
          if(cells[other]!==tier)continue;
          cells[pos]=tier+1;
          cells[other]=0;
          gained += 10*(2**tier);
          gravity(cells);
          merged=true;
          break;
        }
      }
    if(!merged)break;
  }
  return gained;
}
export function dropFruit(state:FruitState,column:number):FruitState {
  if(state.phase!=="playing" || !Number.isInteger(column) || column<0 || column>=fruitSize.width)return state;
  const cells=[...state.cells];
  let row=fruitSize.height-1;
  while(row>=0&&cells[row*fruitSize.width+column])row--;
  if(row<0)return state;
  cells[row*fruitSize.width+column]=state.next;
  const gained=combine(cells);
  const seed=nextSeed(state.seed);
  const turn=state.turn+1;
  const highest=Math.max(...cells);
  const full=cells.every(x=>x!==0);
  const phase:FruitPhase=highest>=6?"won":full||turn>=state.turnLimit?"lost":"playing";
  return {...state,cells,seed,next:(seed% (state.difficulty==="hard"?3:4)===0?2:1),
    score:state.score+gained,turn,phase};
}
