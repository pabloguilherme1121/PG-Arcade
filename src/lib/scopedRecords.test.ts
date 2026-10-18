import { expect, it } from "vitest";
import { addScopedRecord, normalizeScopedRecords } from "./scopedRecords";
import { scopedRecordLabel } from './scopedRecordLabels';
import { emptyProgress, mergeProgress, normalizeProgress } from "./progress";
import { validateProgressBackup } from "./progressBackup";

it('keeps quiz difficulty records separate and preserves unclassified history', () => {
  const values = { 'wordsearch|free|0': 1000, 'wordsearch|free|2': 4500, 'arithmetic|sprint-hard|1': 200 };
  expect(normalizeScopedRecords(values)).toEqual(values);
  expect(validateProgressBackup({ favorites: [], records: {}, recordsV2: values })).toBe('valid');
  const merged = mergeProgress({ ...emptyProgress(), records: { wordsearch: 9999 } }, { recordsV2: values });
  expect(merged.records.wordsearch).toBe(9999);
  expect(scopedRecordLabel('wordsearch|free|2')).toBe('Livre · Avançado');
  for (const id of ['arithmetic', 'fractions', 'primes', 'equation', 'twentyfour', 'numsequence', 'anagram', 'hangman', 'wordsearch', 'stroop', 'oddone', 'estimate']) {
    for (const level of [0, 1, 2]) expect(normalizeScopedRecords({ [`${id}|free|${level}`]: 100 })).toEqual({ [`${id}|free|${level}`]: 100 });
    expect(normalizeScopedRecords({ [`${id}|free|3`]: 100 })).toEqual({});
  }
});

it('preserves casual records by difficulty, round format and session in backups', () => {
  const ids = ['vinteum', 'dados', 'boliche', 'basquete', 'golfe', 'arco', 'pesca', 'match3'];
  for (const id of ids) {
    const values = { [`${id}|free|0-treino`]: 525, [`${id}|free|0-maratona`]: 1575, [`${id}|sprint-hard|2-classico`]: 400 };
    expect(normalizeScopedRecords(values)).toEqual(values);
    expect(validateProgressBackup({ favorites: [], records: {}, recordsV2: values })).toBe('valid');
    expect(normalizeScopedRecords({ [`${id}|free|3-treino`]: 100, [`${id}|free|1-unknown`]: 100 })).toEqual({});
    expect(addScopedRecord(values, `${id}|free|0-treino`, 100)).toBe(values);
  }
  const merged = mergeProgress({ ...emptyProgress(), records: { dados: 999 } }, { recordsV2: { 'dados|free|0-treino': 525 } });
  expect(merged.records.dados).toBe(999);
  expect(merged.recordsV2).toEqual({ 'dados|free|0-treino': 525 });
  expect(scopedRecordLabel('dados|free|0-treino')).toBe('Livre · Fácil · Treino · 5 rodadas');
  expect(scopedRecordLabel('pesca|sprint-hard|2-maratona')).toBe('Sprint · Difícil · Difícil · Maratona · 15 rodadas');
});

it('keeps action difficulty, engine mode and session records independent on import', () => {
  const values = { 'runner|free|normal-mission': 50, 'runner|free|normal-endless': 500, 'voo|sprint-hard|expert-mission': 200 };
  const merged = mergeProgress({ ...emptyProgress(), records: { runner: 999 } }, { recordsV2: values });
  expect(merged.records.runner).toBe(999);
  expect(merged.recordsV2).toEqual(values);
  expect(validateProgressBackup({ favorites: [], records: {}, recordsV2: values })).toBe('valid');
  expect(scopedRecordLabel('voo|sprint-hard|expert-mission')).toBe('Sprint · Difícil · Especialista · Missão');
  expect(addScopedRecord(values, 'runner|free|normal-mission', 40)).toBe(values);
  const ids = ['breakout', 'pong', 'asteroides', 'invasores', 'runner', 'voo', 'jetpack', 'esquiva', 'pouso', 'drift'];
  for (const id of ids) {
    expect(normalizeScopedRecords({ [`${id}|free|master-endless`]: 200 })).toEqual({ [`${id}|free|master-endless`]: 200 });
    expect(normalizeScopedRecords({ [`${id}|free|unknown-mission`]: 200, [`${id}|free|normal-unknown`]: 100 })).toEqual({});
  }
});

it('separates logic difficulties, modes and sessions without relabeling legacy records', () => {
  const incoming = { 'hanoi|free|0-livre': 100, 'hanoi|free|2-serie': 1500, 'nim|sprint-hard|1-reverso': 200 };
  const merged = mergeProgress({ ...emptyProgress(), records: { hanoi: 999 } }, { recordsV2: incoming });
  expect(merged.records).toEqual({ hanoi: 999 });
  expect(merged.recordsV2).toEqual(incoming);
  expect(validateProgressBackup({ favorites: [], records: {}, recordsV2: incoming })).toBe('valid');
  expect(addScopedRecord(incoming, 'hanoi|free|0-livre', 80)).toBe(incoming);
  expect(addScopedRecord(incoming, 'hanoi|free|0-livre', 200)['hanoi|free|0-livre']).toBe(200);
  expect(scopedRecordLabel('hanoi|free|0-livre')).toBe('Livre · Fácil · Desafio livre');
  expect(scopedRecordLabel('nim|sprint-hard|1-reverso')).toBe('Sprint · Difícil · Normal · Última peça perde');
});

it('accepts only implemented logic modes across all ten engines', () => {
  const ids = ['sudoku', 'nonograma', 'labirinto', 'sokoban', 'hanoi', 'senha', 'nim', 'reversi', 'batalha', 'pontes'];
  for (const id of ids) {
    expect(normalizeScopedRecords({ [`${id}|free|1-serie`]: 200 })).toEqual({ [`${id}|free|1-serie`]: 200 });
    expect(normalizeScopedRecords({ [`${id}|free|3-livre`]: 200, [`${id}|free|1-unknown`]: 200 })).toEqual({});
    expect(normalizeScopedRecords({ [`${id}|free|1-reverso`]: 200 })).toEqual(id === 'nim' ? { 'nim|free|1-reverso': 200 } : {});
  }
});
it("keeps legacy records without assigning them to an unknown difficulty", () => {
  const progress = normalizeProgress({ records: { memoria: 4, '2048': 8192 } });
  expect(progress.recordsV2).toBeUndefined();
  const merged = mergeProgress(progress, { recordsV2: { 'memoria|free|12-900': 30, '2048|sprint-hard|normal': 256 } });
  expect(merged.records).toEqual(progress.records);
  expect(merged.recordsV2).toEqual({ 'memoria|free|12-900': 30, '2048|sprint-hard|normal': 256 });
});
it("separates difficulty and timed sessions and preserves the best result on import", () => {
  const original = { ...emptyProgress(), recordsV2: { 'memoria|free|4-900': 6, '2048|free|easy': 100 } };
  const merged = mergeProgress(original, { recordsV2: { 'memoria|free|4-900': 8, 'memoria|free|12-900': 24, '2048|free|easy': 80, '2048|sprint-hard|easy': 12 } });
  expect(merged.recordsV2).toEqual({ 'memoria|free|4-900': 6, 'memoria|free|12-900': 24, '2048|free|easy': 100, '2048|sprint-hard|easy': 12 });
  expect(addScopedRecord(merged.recordsV2!, 'memoria|free|4-900', 4)['memoria|free|4-900']).toBe(4);
});
it("rejects malformed keys, unsupported variants and unsafe scores", () => {
  expect(normalizeScopedRecords({ '__proto__': 9, 'snake|free|classic-220-constant': 10, 'snake|free|wrap-220-progressive': 20, 'blocos|free|4': 9, '2048|free|hard': Infinity, 'blocos|free|0': 1.5, 'memoria|free|4-900|extra': 5 })).toEqual({ 'snake|free|classic-220-constant': 10, 'snake|free|wrap-220-progressive': 20 });
});

it("keeps reaction difficulty and session records separate without relabeling legacy scores", () => {
  const imported = mergeProgress({ ...emptyProgress(), records: { reflexo: 4800 } }, {
    recordsV2: { "reflexo|free|easy": 4700, "reflexo|free|hard": 3200, "reflexo|sprint-normal|easy": 4100, "reflexo|free|unknown": 5 },
  });
  expect(imported.records.reflexo).toBe(4800);
  expect(imported.recordsV2).toEqual({ "reflexo|free|easy": 4700, "reflexo|free|hard": 3200, "reflexo|sprint-normal|easy": 4100 });
  expect(addScopedRecord(imported.recordsV2!, "reflexo|free|hard", 3000)).toBe(imported.recordsV2);
});

it("compares mines scores upwards and puzzle moves downwards within their own difficulties", () => {
  const records = { "minas|free|6": 500, "puzzle|free|12": 8 };
  expect(addScopedRecord(records, "minas|free|6", 490)).toBe(records);
  expect(addScopedRecord(records, "minas|free|16", 1300)["minas|free|16"]).toBe(1300);
  expect(addScopedRecord(records, "puzzle|free|12", 6)["puzzle|free|12"]).toBe(6);
  expect(addScopedRecord(records, "puzzle|free|40", 30)["puzzle|free|40"]).toBe(30);
  expect(normalizeScopedRecords({ "minas|free|9": 30, "puzzle|free|10": 5 })).toEqual({});
});

it("keeps word records independent for four and six attempts and preserves better scores", () => {
  const records = normalizeScopedRecords({ "palavra|free|6": 600, "palavra|free|4": 400, "palavra|free|5": 500 });
  expect(records).toEqual({ "palavra|free|6": 600, "palavra|free|4": 400 });
  expect(addScopedRecord(records, "palavra|free|4", 300)).toBe(records);
  expect(addScopedRecord(records, "palavra|sprint-normal|4", 400)["palavra|sprint-normal|4"]).toBe(400);
});
