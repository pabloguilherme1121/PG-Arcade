import { expect, it } from 'vitest';
import { games } from './catalog';
import { defaultView } from './discovery';
import { emptyProgress } from './progress';
import { selectCatalog, sortCatalog } from './catalogSelection';
it('counts only candidates matching other facets and preserves the category escape', () => {
  const result = selectCatalog(games, { ...defaultView, category: 'Estratégia', mode: 'Dupla local' }, emptyProgress(), false);
  expect(result.visible.map(g => g.id).sort()).toEqual(['cofre','damas','domino','liga4','velha','xadrez']);
  expect(result.categoryCounts.Todos).toBe(8);
  expect(result.categoryCounts['Carros e corrida']).toBe(0);
  expect(result.modeCounts.bot).toBe(5);
});
it('intersects favorites, gestures and styles without leaking recommendations', () => {
  const progress = { ...emptyProgress(), favorites: ['2048' as const,'xadrez' as const], visits: { '2048': 2 } };
  const result = selectCatalog(games, { ...defaultView, swipeOnly: true, modeFilter: 'sem-pressa' }, progress, true);
  expect(result.visible.map(g => g.id)).toEqual(['2048']);
  expect(result.categoryCounts.Todos).toBe(1);
  expect(result.modeCounts.jogados).toBe(1);
});
it('sorts a copy with stable ties and keeps recommendations within the current selection', () => {
  const candidates = games.filter(g => ['snake','2048','memoria'].includes(g.id));
  const original = [...candidates];
  const progress = { ...emptyProgress(), visits: { snake: 4 }, favorites: ['memoria' as const] };
  expect(sortCatalog(candidates, 'visitados', progress)[0].id).toBe('snake');
  expect(sortCatalog(candidates, 'recomendados', progress)[0].id).toBe('memoria');
  expect(sortCatalog(candidates, 'nome', progress).map(g => g.id)).toEqual(['2048','memoria','snake']);
  expect(candidates).toEqual(original);
});
