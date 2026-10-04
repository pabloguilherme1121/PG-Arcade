export type DominoTile = readonly [number, number];
export type DominoSide = "left" | "right";
export type DominoDifficulty = "easy" | "normal" | "hard" | "master" | "expert";
export type DominoMove = { index: number; side: DominoSide };

export function createDominoSet(): DominoTile[] {
  const tiles: DominoTile[] = [];
  for (let left = 0; left <= 6; left += 1) {
    for (let right = left; right <= 6; right += 1) tiles.push([left, right]);
  }
  return tiles;
}

export function shuffleDominoTiles(
  tiles: DominoTile[],
  random: () => number = Math.random,
) {
  const next = [...tiles];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function dealDominoRound(
  handSize: 5 | 7 = 7,
  random: () => number = Math.random,
) {
  const tiles = shuffleDominoTiles(createDominoSet(), random);
  return {
    player: tiles.slice(0, handSize),
    opponent: tiles.slice(handSize, handSize * 2),
    boneyard: tiles.slice(handSize * 2),
  };
}

export function getDominoEnds(chain: DominoTile[]) {
  if (!chain.length) return null;
  return { left: chain[0][0], right: chain[chain.length - 1][1] };
}

export function getPlayableDominoSides(
  tile: DominoTile,
  chain: DominoTile[],
): DominoSide[] {
  if (!chain.length) return ["left", "right"];
  const ends = getDominoEnds(chain)!;
  const sides: DominoSide[] = [];
  if (tile[0] === ends.left || tile[1] === ends.left) sides.push("left");
  if (tile[0] === ends.right || tile[1] === ends.right) sides.push("right");
  return sides;
}

export function hasPlayableDominoTile(hand: DominoTile[], chain: DominoTile[]) {
  return hand.some((tile) => getPlayableDominoSides(tile, chain).length > 0);
}

export function placeDominoTile(
  chain: DominoTile[],
  tile: DominoTile,
  side: DominoSide,
): DominoTile[] {
  if (!chain.length) return [[tile[0], tile[1]]];

  const ends = getDominoEnds(chain)!;
  if (side === "left") {
    if (tile[1] === ends.left) return [[tile[0], tile[1]], ...chain];
    if (tile[0] === ends.left) return [[tile[1], tile[0]], ...chain];
    return chain;
  }

  if (tile[0] === ends.right) return [...chain, [tile[0], tile[1]]];
  if (tile[1] === ends.right) return [...chain, [tile[1], tile[0]]];
  return chain;
}

export function getDominoRoundPoints(loserHand: DominoTile[]) {
  return getDominoPipTotal(loserHand);
}

export function sortDominoHand(hand: DominoTile[], chain: DominoTile[]) {
  return [...hand].sort((a, b) => {
    const playableDelta =
      Number(getPlayableDominoSides(b, chain).length > 0) -
      Number(getPlayableDominoSides(a, chain).length > 0);
    if (playableDelta) return playableDelta;
    const doubleDelta = Number(b[0] === b[1]) - Number(a[0] === a[1]);
    if (doubleDelta) return doubleDelta;
    return b[0] + b[1] - (a[0] + a[1]);
  });
}

export function getDominoPipTotal(hand: DominoTile[]) {
  return hand.reduce((total, tile) => total + tile[0] + tile[1], 0);
}

export function getLegalDominoMoves(
  hand: DominoTile[],
  chain: DominoTile[],
): DominoMove[] {
  return hand.flatMap((tile, index) =>
    getPlayableDominoSides(tile, chain).map((side) => ({ index, side })),
  );
}

function countValueSupport(hand: DominoTile[], value: number) {
  return hand.reduce(
    (count, tile) => count + (tile[0] === value || tile[1] === value ? 1 : 0),
    0,
  );
}

function scoreMasterMove(
  hand: DominoTile[],
  chain: DominoTile[],
  move: DominoMove,
) {
  const tile = hand[move.index];
  const nextChain = placeDominoTile(chain, tile, move.side);
  const remaining = hand.filter((_, index) => index !== move.index);
  const ends = getDominoEnds(nextChain);
  const pipScore = tile[0] + tile[1];
  const doubleBonus = tile[0] === tile[1] ? 5 : 0;
  const futureOptions = getLegalDominoMoves(remaining, nextChain).length;
  const support = ends
    ? countValueSupport(remaining, ends.left) +
      countValueSupport(remaining, ends.right)
    : 0;

  return pipScore * 2 + doubleBonus + futureOptions * 4 + support * 2;
}

export function chooseDominoBotMove(
  hand: DominoTile[],
  chain: DominoTile[],
  difficulty: DominoDifficulty,
  random: () => number = Math.random,
): DominoMove | null {
  const moves = getLegalDominoMoves(hand, chain);
  if (!moves.length) return null;
  if (difficulty === "easy")
    return moves[Math.floor(random() * moves.length)] ?? moves[0];

  const scoreMove = (move: DominoMove) => {
    const tile = hand[move.index];
    const pipScore = tile[0] + tile[1];
    const doubleBonus = tile[0] === tile[1] ? 3 : 0;

    if (difficulty === "normal") return pipScore + doubleBonus;

    const nextChain = placeDominoTile(chain, tile, move.side);
    const remaining = hand.filter((_, index) => index !== move.index);
    const futureOptions = getLegalDominoMoves(remaining, nextChain).length;

    if (difficulty === "hard") {
      return pipScore * 2 + doubleBonus * 2 + futureOptions * 3;
    }

    return (
      scoreMasterMove(hand, chain, move) +
      (difficulty === "expert"
        ? futureOptions * 3 - getDominoPipTotal(remaining) * 0.12
        : 0)
    );
  };

  return [...moves].sort((a, b) => scoreMove(b) - scoreMove(a))[0];
}
