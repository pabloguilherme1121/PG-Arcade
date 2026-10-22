import { games } from './catalog';
import { categoryGroup, matchesGame, supportsPlayerMode, type CatalogView } from './discovery';
import { countModes, filterByMode, recommendGames, supportsSwipe } from './smartDiscovery';
import type { Progress } from './progress';
type CatalogGame = (typeof games)[number];
type Criteria = Pick<CatalogView, 'query' | 'category' | 'mode' | 'modeFilter' | 'swipeOnly'>;
type History = Pick<Progress, 'favorites' | 'visits' | 'last'>;
const nameOrder = new Intl.Collator('pt-BR');
export const catalogCategories: readonly string[] = ['Todos', ...new Set(games.map(game => categoryGroup(game.category)))];
/** Each facet replaces only its own selection, retaining all other constraints. */
export function selectCatalog(source: readonly CatalogGame[], criteria: Criteria, history: History, favoritesPage: boolean) {
  const candidates = source.filter(game => (!favoritesPage || history.favorites.includes(game.id)) &&
    supportsPlayerMode(game.id, criteria.mode) && (!criteria.swipeOnly || supportsSwipe(game.id)) && matchesGame(game, criteria.query));
  const matching = candidates.filter(game => criteria.category === 'Todos' || categoryGroup(game.category) === criteria.category);
  const visible = filterByMode(matching, criteria.modeFilter, history.visits, history.favorites);
  const categoryCandidates = filterByMode(candidates, criteria.modeFilter, history.visits, history.favorites);
  const categoryCounts: Record<string, number> = Object.fromEntries(catalogCategories.map(category => [category, 0]));
  categoryCounts.Todos = categoryCandidates.length;
  for (const game of categoryCandidates) categoryCounts[categoryGroup(game.category)]++;
  const modeCounts = countModes(matching, history.visits, history.favorites);
  return { visible, categoryCounts, modeCounts };
}
export function sortCatalog(source: readonly CatalogGame[], order: string, history: History) {
  if (order === 'recomendados') return recommendGames(source, history);
  return [...source].sort((a, b) => order === 'nome' ? nameOrder.compare(a.name, b.name)
    : order === 'visitados' ? (history.visits[b.id] || 0) - (history.visits[a.id] || 0) : 0);
}
