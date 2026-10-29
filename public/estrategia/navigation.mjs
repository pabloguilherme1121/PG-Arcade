// Movimentação de teclado salta casas desabilitadas, sem cruzar as bordas.
const DELTAS = Object.freeze({ ArrowUp: -5, ArrowDown: 5, ArrowLeft: -1, ArrowRight: 1 });
const valid = value => Number.isInteger(value) && value >= 0 && value < 25;
export function nextPlayableCell(current, direction, legal) {
  if (!valid(current) || !Object.hasOwn(DELTAS, direction) || !Array.isArray(legal)) return null;
  const step = DELTAS[direction];
  const playable = new Set(legal.filter(valid));
  let index = current;
  for (;;) {
    if (step === -1 && index % 5 === 0) return null;
    if (step === 1 && index % 5 === 4) return null;
    index += step;
    if (!valid(index)) return null;
    if (playable.has(index)) return index;
  }
}
export function nearestPlayableCell(current, legal) {
  if (!valid(current) || !Array.isArray(legal)) return null;
  const candidates = legal.filter(valid);
  if (!candidates.length) return null;
  const distance = index => Math.abs(Math.floor(index / 5) - Math.floor(current / 5)) + Math.abs(index % 5 - current % 5);
  return [...candidates].sort((a,b) => distance(a) - distance(b) || a - b)[0];
}