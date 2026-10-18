/** Independent rule solvers operating only on the board shown in the browser. */
export function solveQueens(cells: number[]) {
  const columns = Array(8).fill(-1);
  cells.forEach((value, cell) => { if (value) columns[Math.floor(cell / 8)] = cell % 8; });
  const safe = (row: number, col: number) => columns.every((c, r) => c < 0 || r === row || (c !== col && Math.abs(r - row) !== Math.abs(c - col)));
  function visit(row: number): boolean {
    if (row === 8) return true;
    if (columns[row] >= 0) return safe(row, columns[row]) && visit(row + 1);
    for (let col = 0; col < 8; col++) if (safe(row, col)) {
      columns[row] = col;
      if (visit(row + 1)) return true;
      columns[row] = -1;
    }
    return false;
  }
  if (!visit(0)) throw new Error('Displayed queens clues have no solution');
  return columns.map((col, row) => row * 8 + col).filter(cell => !cells[cell]);
}

export function solveKnight(cells: number[]) {
  const n = Math.sqrt(cells.length), seen = new Set(cells.flatMap((value, i) => value ? [i] : []));
  const start = cells.indexOf(Math.max(...cells)), route: number[] = [];
  const moves = (cell: number) => [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].flatMap(([dy, dx]) => {
    const row = Math.floor(cell / n) + dy, col = cell % n + dx;
    return row >= 0 && row < n && col >= 0 && col < n && !seen.has(row * n + col) ? [row * n + col] : [];
  });
  let budget = 150000;
  function visit(cell: number): boolean {
    if (seen.size === cells.length) return true;
    if (--budget < 0) return false;
    for (const next of moves(cell).sort((a, b) => moves(a).length - moves(b).length)) {
      seen.add(next); route.push(next);
      if (visit(next)) return true;
      route.pop(); seen.delete(next);
    }
    return false;
  }
  if (!visit(start)) throw new Error('Could not complete displayed knight tour');
  return route;
}

export function solveMagic(cells: number[]) {
  const values = [...cells], used = new Set(values.filter(Boolean));
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const valid = () => lines.every(line => {
    const sum = line.reduce((total, index) => total + values[index], 0);
    return line.every(index => values[index] > 0) ? sum === 15 : sum < 15;
  });
  function visit(cell: number): boolean {
    if (cell === 9) return valid();
    if (values[cell]) return visit(cell + 1);
    for (let value = 1; value <= 9; value++) if (!used.has(value)) {
      values[cell] = value; used.add(value);
      if (valid() && visit(cell + 1)) return true;
      used.delete(value); values[cell] = 0;
    }
    return false;
  }
  if (!visit(0)) throw new Error('Displayed magic-square clues have no solution');
  return values;
}
