import { expect, type Page } from '@playwright/test';

/** Solve the letters shown to the player, independently of the generator. */
export async function visibleWordPaths(page: Page) {
  await expect(page.locator('.wordsearch-list [data-word]').first()).toBeAttached();
  const letters = await page.locator('.wordsearch-grid button').allTextContents();
  const words = await page.locator('.wordsearch-list [data-word]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-word')!));
  return words.map(word => {
    for (let from = 0; from < 36; from++) for (const [dy, dx] of [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]]) {
      const row = Math.floor(from / 6), col = from % 6;
      const lastRow = row + dy * (word.length - 1), lastCol = col + dx * (word.length - 1);
      if (lastRow < 0 || lastRow > 5 || lastCol < 0 || lastCol > 5) continue;
      const path = Array.from(word, (_, i) => from + i * (dy * 6 + dx));
      if (path.map(index => letters[index].trim()).join('') === word) return { word, path, from, to: path.at(-1)! };
    }
    throw new Error(`Displayed word cannot be found: ${word}`);
  });
}
