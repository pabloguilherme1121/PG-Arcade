import { expect, it } from 'vitest';
import { games } from './catalog';
import { MAX_PROGRESS_BACKUP_BYTES, validateProgressBackup } from './progressBackup';
it('accepts a complete exported calendar at the largest supported visit counts', () => {
  const visits = Object.fromEntries(games.map(game => [game.id, Number.MAX_SAFE_INTEGER]));
  const days = Object.fromEntries(Array.from({ length: 400 }, (_, index) => [
    new Date(Date.UTC(2025, 0, 1 + index)).toISOString().slice(0, 10), visits,
  ]));
  const backup = { favorites: [], records: {}, dailyActivity: { version: 1, days } };
  expect(Buffer.byteLength(JSON.stringify(backup, null, 2))).toBeGreaterThan(512000);
  expect(Buffer.byteLength(JSON.stringify(backup, null, 2))).toBeLessThan(MAX_PROGRESS_BACKUP_BYTES);
  expect(validateProgressBackup(backup)).toBe('valid');
});
