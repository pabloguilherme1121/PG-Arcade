/** Solve only the visible stacks, independently of the production move engine. */
export function solveSort(initial: number[][], liquid: boolean): [number, number][] {
  type Node = { stacks: number[][]; parent: number; move?: [number, number] };
  const key = (stacks: number[][]) => stacks.map(stack => stack.join('')).sort().join('|');
  const won = (stacks: number[][]) => stacks.every(stack => !stack.length || (stack.length === 4 && stack.every(value => value === stack[0])));
  const queue: Node[] = [{ stacks: initial.map(stack => [...stack]), parent: -1 }];
  const seen = new Set([key(initial)]);
  for (let cursor = 0; cursor < queue.length && cursor < 150000; cursor++) {
    const { stacks } = queue[cursor];
    if (won(stacks)) {
      const route: [number, number][] = [];
      for (let node = cursor; queue[node].parent >= 0; node = queue[node].parent) route.push(queue[node].move!);
      return route.reverse();
    }
    for (let from = 0; from < stacks.length; from++) {
      const source = stacks[from], color = source.at(-1);
      if (!source.length) continue;
      for (let to = 0; to < stacks.length; to++) {
        const target = stacks[to];
        if (from === to || target.length === 4 || (target.length && target.at(-1) !== color)) continue;
        const next = stacks.map(stack => [...stack]);
        let count = 1;
        if (liquid) while (count < source.length && source[source.length - count - 1] === color) count++;
        count = Math.min(count, 4 - target.length);
        next[to].push(...next[from].splice(source.length - count, count));
        const hash = key(next);
        if (seen.has(hash)) continue;
        seen.add(hash);
        queue.push({ stacks: next, parent: cursor, move: [from, to] });
      }
    }
  }
  throw new Error('Visible stacks have no solution within the search budget');
}
