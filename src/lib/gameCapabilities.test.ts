import { describe, expect, it } from 'vitest';
import { games } from './catalog';
import { gameCapabilities } from './gameCapabilities';
import { gameMode, supportsPlayerMode } from './discovery';
import { modeTags, supportsSwipe } from './smartDiscovery';

describe('verified catalog capabilities', () => {
  it('never advertises online multiplayer for a local engine', () => {
    for (const game of games) {
      const capabilities = gameCapabilities(game.id);
      expect(capabilities.online).toBe(false);
      expect(capabilities.solo).toBe(true);
      expect(capabilities.localPlayers).toBe(game.id === 'comum' ? 4 : modeTags(game).includes('dupla') ? 2 : 1);
      expect(capabilities.swipe).toBe(supportsSwipe(game.id));
      expect(capabilities.bot).toBe(modeTags(game).includes('bot'));
      expect(supportsPlayerMode(game.id, 'Online')).toBe(false);
    }
  });
  it('only offers timed sessions where scores are compatible', () => {
    expect(gameCapabilities('comum').timedSessions).toBe(false);
    expect(gameCapabilities('2048').timedSessions).toBe(true);
  });
  it('uses one source for player labels and local duel filtering', () => {
    expect(games.filter(g => gameCapabilities(g.id).localPlayers === 2).map(g => g.id).sort())
      .toEqual(['damas', 'domino', 'liga4', 'velha', 'xadrez']);
    expect(gameMode('xadrez')).toBe('Solo ou dupla local');
    expect(gameMode('snake')).toBe('Solo');
    expect(supportsPlayerMode('snake', 'Dupla local')).toBe(false);
    expect(supportsPlayerMode('xadrez', 'Dupla local')).toBe(true);
    expect(supportsPlayerMode('snake', 'Todos')).toBe(true);
    expect(supportsPlayerMode('snake', 'Solo')).toBe(true);
    expect(supportsPlayerMode('snake', 'unknown')).toBe(false);
  });
});
