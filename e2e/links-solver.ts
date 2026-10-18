/** Independent path search using only visible terminals and already filled cells. */
export function solveLinks(initial: number[], fixed: number[], size: number): number[][] {
  const cells = [...initial], colors = [...new Set(fixed.filter(Boolean))], paths: number[][] = [];
  const adjacent = (cell: number) => [-size,size,-1,1].map(d => cell+d).filter(next => next>=0 && next<cells.length && Math.abs(Math.floor(next/size)-Math.floor(cell/size))+Math.abs(next%size-cell%size)===1);
  let budget = 300000;
  function pair(which: number): boolean {
    if (which === colors.length) return cells.every(Boolean);
    const color = colors[which], ends = fixed.flatMap((value,index)=>value===color?[index]:[]);
    const required = initial.flatMap((value,index)=>value===color?[index]:[]);
    const route = [ends[0]], seen = new Set(route), end = ends[1];
    function walk(cell: number): boolean {
      if (--budget < 0) throw new Error('Visible paths exceeded search budget');
      if (cell===end) {
        if (!required.every(index=>seen.has(index))) return false;
        paths.push([...route]);
        if (pair(which+1)) return true;
        paths.pop();return false;
      }
      const distance = (index: number) => Math.abs(Math.floor(index/size)-Math.floor(end/size))+Math.abs(index%size-end%size);
      for (const next of adjacent(cell).sort((a,b)=>distance(a)-distance(b))) {
        if (seen.has(next) || (cells[next] && cells[next]!==color) || adjacent(next).filter(index=>seen.has(index)).length!==1) continue;
        const old=cells[next];cells[next]=color;route.push(next);seen.add(next);
        if (walk(next)) return true;
        seen.delete(next);route.pop();cells[next]=old;
      }
      return false;
    }
    return walk(ends[0]);
  }
  if (!pair(0)) throw new Error('Visible terminals have no complete solution');
  return paths;
}
