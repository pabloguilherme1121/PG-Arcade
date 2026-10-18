import { expect, it } from 'vitest';
import { question, selectedWord } from './quizExpansion';

it('offers increasingly demanding, reproducible and always solvable word searches', () => {
  for (const level of [0, 1, 2]) {
    const layouts = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const q = question('wordsearch', level, seed, 0);
      expect(q.grid).toHaveLength(36);
      expect(q.words).toHaveLength(4 + level);
      expect(new Set(q.words).size).toBe(q.words.length);
      expect(question('wordsearch', level, seed, 0)).toEqual(q);
      for (const word of q.words) {
        expect(word.length).toBeGreaterThanOrEqual(3 + level);
        expect(q.grid.some((_, a) => q.grid.some((_, b) => selectedWord(q.grid, a, b).word === word))).toBe(true);
      }
      layouts.add(q.grid.join(''));
    }
    expect(layouts.size).toBeGreaterThan(35);
  }
});
