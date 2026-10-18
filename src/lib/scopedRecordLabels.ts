import { scopedRecordFamily } from './scopedRecords';

/** Presentation belongs to the lazy progress screen, not startup/storage validation. */
export function scopedRecordLabel(key: string) {
  const [game, session, variant] = key.split('|');
  const levels: Record<string, string> = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil', master: 'Mestre', expert: 'Especialista', '0': 'Fácil', '1': 'Normal', '2': 'Difícil' };
  const rhythm = session === 'free' ? 'Livre' : `${session.startsWith('sprint') ? 'Sprint' : 'Maratona'} · ${levels[session.split('-')[1]]}`;
  const family = scopedRecordFamily(game);
  const logicModes: Record<string, string> = { livre: 'Desafio livre', serie: 'Série de 5 desafios', reverso: 'Última peça perde' };
  const casualModes: Record<string, string> = { treino: 'Treino · 5 rodadas', classico: 'Clássico · 10 rodadas', maratona: 'Maratona · 15 rodadas' };
  const detail = game === 'links' ? `${['Iniciante', 'Normal', 'Avançado'][Number(variant.at(-1))]} · ${variant.startsWith('paths2-') ? 'Trilhas ampliadas' : 'Regras anteriores'}`
    : family === 'logic' ? `${levels[variant.split('-')[0]]} · ${logicModes[variant.split('-')[1]]}`
    : family === 'action' ? `${levels[variant.split('-')[0]]} · ${variant.endsWith('-mission') ? 'Missão' : 'Resistência'}`
    : family === 'casual' ? `${levels[variant.split('-')[0]]} · ${casualModes[variant.split('-')[1]]}`
    : family === 'quiz' || family === 'board' ? ['Iniciante', 'Normal', 'Avançado'][Number(variant)]
    : game === 'palavra' ? `${variant} tentativas` : game === 'minas' ? `${variant} minas` : game === 'puzzle' ? ({ '12': 'Fácil', '40': 'Normal', '100': 'Difícil' } as Record<string, string>)[variant] : game === 'memoria' ? `${variant.split('-')[0]} pares · ${Number(variant.split('-')[1]) / 1000} s`
    : game === 'snake' ? `${variant.startsWith('wrap') ? 'Portal' : 'Clássico'} · ${variant.split('-')[1]} ms · ${variant.endsWith('progressive') ? 'progressivo' : 'constante'}`
    : levels[variant];
  return `${rhythm} · ${detail}`;
}
