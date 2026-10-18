import { expect, it } from 'vitest';
import { question } from './quizExpansion';

it('uses word length bands to make hangman and anagrams meaningfully harder', () => {
  for (const id of ['hangman', 'anagram']) for (const level of [0, 1, 2]) {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const q = question(id, level, seed, 0);
      const [min, max] = [[5, 6], [7, 8], [9, 11]][level];
      expect(q.answer.length).toBeGreaterThanOrEqual(min);
      expect(q.answer.length).toBeLessThanOrEqual(max);
      seen.add(q.answer);
      if (id === 'anagram') {
        const scrambled = q.prompt.split(' · ').join('');
        expect(scrambled).not.toBe(q.answer);
        expect([...scrambled].sort()).toEqual([...q.answer].sort());
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(6);
    expect(new Set(Array.from({ length: 10 }, (_, round) => question(id, level, 1, round).answer)).size).toBe(10);
  }
});
