/** Exact orthogonal cells affected by a move on the 5×5 grid. */
export function lightsAffectedCells(index: number): number[] {
  if (!Number.isInteger(index) || index < 0 || index >= 25) return [];
  const row=Math.floor(index/5),col=index%5;
  return [[row-1,col],[row,col-1],[row,col],[row,col+1],[row+1,col]]
    .filter(([r,c])=>r>=0&&r<5&&c>=0&&c<5)
    .map(([r,c])=>r*5+c).sort((a,b)=>a-b);
}

/** Predict the effect without changing the engine or the board. */
export function lightsMoveImpact(board: readonly boolean[], index: number) {
  return lightsAffectedCells(index).reduce((totals,cell)=>{
    if (board[cell]) totals.off++;
    else totals.on++;
    return totals;
  }, {on:0,off:0});
}

/** Move focus within a row/column; never wrap to another row. */
export function lightsFocusTarget(from: number, key: string): number | null {
  if (!Number.isInteger(from)||from<0||from>=25) return null;
  const offsets:Record<string,number>={
    ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5,
  };
  const step=offsets[key];
  if (!step) return null;
  const target=from+step;
  if (target<0||target>=25) return null;
  if (Math.abs(step)===1&&Math.floor(target/5)!==Math.floor(from/5)) return null;
  return target;
}
