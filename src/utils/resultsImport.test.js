import { describe, it, expect } from 'vitest';
import { parseResultsText, parseCell, matchAthlete, matchColumn, buildPlan, resolveImport } from './resultsImport';

const athletes = [
  { id: 'k', name: 'Kaiden Higgins' },
  { id: 'mg', name: 'Maggie Urda' },
  { id: 'mh', name: 'Mahra Alshehhi' },
  { id: 'ma', name: 'Maha Alshehhi' },
];

describe('parseResultsText', () => {
  it('reads tab-separated, comma-separated and a date column', () => {
    const tab = parseResultsText('Athlete\tCMJ (cm)\tDate\nKaiden Higgins\t42.3\t2026-10-01');
    expect(tab.headers).toEqual(['Athlete', 'CMJ (cm)', 'Date']);
    expect(tab.dateColumn).toBe(2);
    expect(tab.rows[0]).toEqual({ name: 'Kaiden Higgins', cells: ['Kaiden Higgins', '42.3', '2026-10-01'] });
    const csv = parseResultsText('Name,CMJ,RSI\nMaggie Urda,38.7,1.12\n"Higgins, Kaiden",40,1.3');
    expect(csv.rows.map(r => r.name)).toEqual(['Maggie Urda', 'Higgins, Kaiden']);
  });
  it('returns nothing for a single line', () => { expect(parseResultsText('just one line').rows).toEqual([]); });
});

describe('parseCell', () => {
  it.each([
    ['42.3', { kind: 'value', value: 42.3 }],
    ['42.3 cm', { kind: 'value', value: 42.3 }],
    ['18/20', { kind: 'lr', left: 18, right: 20 }],
    ['L 18 R 20', { kind: 'lr', left: 18, right: 20 }],
    ['', { kind: 'empty' }],
    ['—', { kind: 'empty' }],
    ['DNS', { kind: 'empty' }],
    ['abc', { kind: 'bad' }],
    ['12 15', { kind: 'bad' }],
  ])('%s', (raw, want) => expect(parseCell(raw)).toEqual(want));
});

describe('matchAthlete', () => {
  it('exact, unique-first-name, shared-surname, unknown', () => {
    expect(matchAthlete('Kaiden Higgins', athletes)).toMatchObject({ id: 'k', confidence: 'exact' });
    expect(matchAthlete('Maggie', athletes)).toMatchObject({ id: 'mg', confidence: 'likely' });
    expect(matchAthlete('M Urda', athletes)).toMatchObject({ id: 'mg', confidence: 'likely' });
    expect(matchAthlete('Alshehhi', athletes)).toMatchObject({ id: null, confidence: 'ambiguous' });
    expect(matchAthlete('Alshehhi', athletes).candidates.sort()).toEqual(['ma', 'mh']);
    expect(matchAthlete('Someone Else', athletes).confidence).toBe('none');
  });
});

describe('matchColumn', () => {
  it('uses the test name, ignores units, falls back to the metric label', () => {
    expect(matchColumn('CMJ (cm)')).toMatchObject({ key: 'cmjBilateral', confidence: 'exact' });
    expect(matchColumn('Chin-up')).toMatchObject({ key: 'chinUpMaxReps', confidence: 'exact' });
    expect(matchColumn('Pull-ups').confidence).toBe('ambiguous');
    expect(matchColumn('Hamstring 90°')).toMatchObject({ key: 'hamstring90', confidence: 'exact' });
    expect(matchColumn('Mystery metric').confidence).toBe('none');
  });
});

const SHEET = 'Athlete\tCMJ (cm)\tPull-ups\tHamstring 90°\nKaiden Higgins\t42.3\t8\t18/20\nMaggie\t38.7\t6\t19/21\nAlshehhi\t40\t5\t17/17';
const date = '2026-10-27';

describe('resolveImport — the confirmation layer', () => {
  const plan = buildPlan(parseResultsText(SHEET), athletes);

  it('blocks the upload while anything is uncertain, and says what', () => {
    const r = resolveImport(plan, {}, { defaultDate: date });
    expect(r.canUpload).toBe(false);
    const reasons = r.problems.map(p => `${p.type}:${p.reason}`).sort();
    expect(reasons).toEqual(['column:ambiguous', 'person:ambiguous', 'person:check']);
    expect(r.toSave.length).toBeLessThan(9);               // the unsettled rows/columns are held back
  });

  it('allows the upload only once every question is answered', () => {
    const choices = { columns: { 2: { key: 'pullUpWideMaxReps' } }, people: { 1: { confirmed: true }, 2: { id: 'mh' } } };
    const r = resolveImport(plan, choices, { defaultDate: date });
    expect(r.problems).toEqual([]);
    expect(r.canUpload).toBe(true);
    expect(r.toSave).toHaveLength(9);
    expect(r.toSave).toContainEqual({ athleteId: 'k', metricKey: 'cmjBilateral', entry: { date, value: 42.3 } });
    expect(r.toSave).toContainEqual({ athleteId: 'mg', metricKey: 'hamstring90', entry: { date, left: 19, right: 21 } });
    expect(r.toSave).toContainEqual({ athleteId: 'mh', metricKey: 'pullUpWideMaxReps', entry: { date, value: 5 } });
  });

  it('a skipped column or athlete is a decision, not a blocker', () => {
    const r = resolveImport(plan, { columns: { 2: { skip: true } }, people: { 1: { confirmed: true }, 2: { skip: true } } }, { defaultDate: date });
    expect(r.canUpload).toBe(true);
    expect(r.toSave).toHaveLength(4);                      // Kaiden CMJ + hamstring, Maggie CMJ + hamstring
  });

  it('flags values that do not fit the test', () => {
    const p = buildPlan(parseResultsText('Athlete\tHamstring 90°\tCMJ\nKaiden Higgins\t19\t40/41'), athletes);
    const r = resolveImport(p, {}, { defaultDate: date });
    expect(r.problems.map(x => x.reason).sort()).toEqual(['needs-left-right', 'single-value']);
    expect(r.canUpload).toBe(false);
    const fixed = resolveImport(p, { cells: { '0:1': { raw: '19/20' }, '0:2': { raw: '40.5' } } }, { defaultDate: date });
    expect(fixed.canUpload).toBe(true);
  });

  it('makes a person decide about a result the athlete already has on that date', () => {
    const p = buildPlan(parseResultsText('Athlete\tCMJ\nKaiden Higgins\t42'), athletes);
    const existing = new Set(['k|cmjBilateral|' + date]);
    expect(resolveImport(p, {}, { defaultDate: date, existing }).problems[0].reason).toBe('duplicate');
    expect(resolveImport(p, { cells: { '0:1': { dup: 'skip' } } }, { defaultDate: date, existing }).toSave).toHaveLength(0);
    expect(resolveImport(p, { cells: { '0:1': { dup: 'add' } } }, { defaultDate: date, existing }).canUpload).toBe(true);
  });

  it('never saves anything for an unconfirmed item, even if the rest is fine', () => {
    const p = buildPlan(parseResultsText('Athlete\tPull-up\nKaiden Higgins\t8'), athletes);
    const r = resolveImport(p, {}, { defaultDate: date });
    expect(r.canUpload).toBe(false);
    expect(r.toSave).toHaveLength(0);
  });
});
