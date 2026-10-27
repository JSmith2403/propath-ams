/**
 * Results import — turn pasted / uploaded text into results, with a CONFIRMATION LAYER.
 *
 * Nothing is saved until every uncertain item has been confirmed by a person:
 *   • a test column the app can't pin to ONE test  ("Pull-up" — chin-up? wide? neutral grip?)
 *   • an athlete name that matches nobody or several people
 *   • a value it can't read, or one that doesn't fit the test (single number for a left/right test)
 *   • a result the athlete already has on that date (skip it, or add it anyway)
 * Anything the app is certain about is accepted but stays visible and editable.
 *
 * Pure functions only — the screen (UploadResultsView) holds the choices and calls resolveImport() on every
 * change; `canUpload` is true only when there are results to save and zero open questions.
 */

import { matchTest, TEST_INFO } from '../data/testCatalog';
import { ALL_METRICS } from '../data/sessionMetrics';

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// ── 1. text → table ─────────────────────────────────────────────────────────
function splitLine(line, delim) {
  if (delim === 'multi') return line.split(/\s{2,}/).map(c => c.trim());
  const out = []; let cur = ''; let q = false;
  for (const ch of line) {
    if (ch === '"') { q = !q; continue; }
    if (ch === delim && !q) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** First column = athlete, first row = headers. Tab, comma, semicolon or 2+ spaces. */
export function parseResultsText(text) {
  const lines = String(text || '').split(/\r?\n/).map(l => l.replace(/\s+$/, '')).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [], dateColumn: -1 };
  const delim = lines.some(l => l.includes('\t')) ? '\t'
    : lines.filter(l => l.includes(',')).length >= lines.length - 1 ? ','
    : lines.filter(l => l.includes(';')).length >= lines.length - 1 ? ';'
    : 'multi';
  const grid = lines.map(l => splitLine(l, delim));
  const headers = grid[0];
  const rows = grid.slice(1).filter(r => r[0]).map(r => ({ name: r[0], cells: headers.map((_, i) => r[i] ?? '') }));
  const dateColumn = headers.findIndex((h, i) => i > 0 && /^date$/i.test(h.trim()));
  return { headers, rows, dateColumn };
}

// ── 2. cells ────────────────────────────────────────────────────────────────
const num = (s) => { const n = Number(String(s).replace(/,/g, '.')); return Number.isFinite(n) ? n : NaN; };

/** → { kind: 'empty' } | { kind: 'value', value } | { kind: 'lr', left, right } | { kind: 'bad' } */
export function parseCell(raw) {
  const s = String(raw ?? '').trim();
  if (!s || /^(-|—|n\/?a|dns|dnf)$/i.test(s)) return { kind: 'empty' };
  const lr = s.match(/^(?:l\s*)?(-?\d+(?:[.,]\d+)?)\s*(?:[/|&]|\s+r\s*|,\s*r\s*)\s*(-?\d+(?:[.,]\d+)?)/i);
  if (lr) return { kind: 'lr', left: num(lr[1]), right: num(lr[2]) };
  const v = s.match(/^-?\d+(?:[.,]\d+)?/);
  if (v && !/\d\s+\d/.test(s)) return { kind: 'value', value: num(v[0]) };
  return { kind: 'bad' };
}

// ── 3. athletes ─────────────────────────────────────────────────────────────
/** → { id, confidence: 'exact'|'likely'|'ambiguous'|'none', candidates: [ids] } */
export function matchAthlete(label, athletes = []) {
  const t = norm(label);
  if (!t) return { id: null, confidence: 'none', candidates: [] };
  const people = athletes.map(a => ({ id: a.id, full: norm(a.name), tokens: norm(a.name).split(' ') }));
  const exact = people.filter(p => p.full === t);
  if (exact.length === 1) return { id: exact[0].id, confidence: 'exact', candidates: [exact[0].id] };
  const tt = t.split(' ');
  const hits = people.filter(p => tt.every(w => p.tokens.some(x => x === w || (w.length === 1 && x.startsWith(w)))));
  if (hits.length === 1) return { id: hits[0].id, confidence: 'likely', candidates: [hits[0].id] };
  if (hits.length > 1) return { id: null, confidence: 'ambiguous', candidates: hits.map(h => h.id) };
  return { id: null, confidence: 'none', candidates: [] };
}

// ── 4. columns → tests ──────────────────────────────────────────────────────
const stripUnits = (label) => String(label || '').replace(/\([^)]*\)|\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();

export function matchColumn(label, customMetrics = {}) {
  const core = stripUnits(label);
  const byAlias = matchTest(core);
  if (byAlias.confidence === 'exact' || byAlias.confidence === 'ambiguous') return byAlias;
  // the metric's own label, e.g. "Hamstring 90°" or a custom metric
  const t = norm(core);
  const pool = [...ALL_METRICS.map(m => ({ key: m.key, label: m.label })), ...Object.entries(customMetrics).map(([key, m]) => ({ key, label: m.label || key }))];
  const own = pool.filter(m => norm(m.label) === t);
  if (own.length === 1) return { key: own[0].key, confidence: 'exact', candidates: [own[0].key] };
  return byAlias;
}

// ── 5. plan + resolve ───────────────────────────────────────────────────────
/**
 * @param parsed      from parseResultsText()
 * @param athletes    [{ id, name }]
 * @param customMetrics  { key: { label, unit, bilateral } }
 * @returns a plan: the app's best guess for every column and every athlete.
 */
export function buildPlan(parsed, athletes, customMetrics = {}) {
  const dateCol = parsed.dateColumn;
  const columns = parsed.headers.map((label, index) => ({ index, label, isAthleteCol: index === 0, isDateCol: index === dateCol }))
    .filter(c => !c.isAthleteCol && !c.isDateCol)
    .map(c => ({ index: c.index, label: c.label, match: matchColumn(c.label, customMetrics) }));
  const people = parsed.rows.map((r, row) => ({ row, label: r.name, match: matchAthlete(r.name, athletes) }));
  return { parsed, columns, people, dateCol };
}

/**
 * Apply the person's choices and report what is still open.
 *   choices.columns[index] = { key?, confirmed?, skip? }
 *   choices.people[row]    = { id?, confirmed?, skip? }
 *   choices.cells[`row:col`] = { raw?, skip?, dup?: 'skip' | 'add' }
 *   existing = Set of `${athleteId}|${metricKey}|${date}` already in the results
 */
export function resolveImport(plan, choices = {}, { defaultDate, existing = new Set(), customMetrics = {} } = {}) {
  const metricDef = (key) => ALL_METRICS.find(m => m.key === key) || customMetrics[key] || null;
  const problems = [];

  const columns = plan.columns.map(c => {
    const ch = choices.columns?.[c.index] || {};
    const key = ch.key ?? (c.match.confidence === 'exact' || c.match.confidence === 'likely' ? c.match.key : null);
    let status = 'ok', reason = null;
    // Choosing a test from the list IS the confirmation. Otherwise: exact is accepted, 'likely' needs a tick,
    // 'ambiguous' / 'none' have no default at all — a person has to pick.
    if (ch.skip) status = 'skipped';
    else if (!key) { status = 'needs'; reason = c.match.confidence === 'ambiguous' ? 'ambiguous' : 'unknown'; }
    else if (ch.key == null && c.match.confidence === 'likely' && !ch.confirmed) { status = 'needs'; reason = 'check'; }
    if (status === 'needs') problems.push({ type: 'column', index: c.index, reason });
    return { ...c, key, status, reason, def: key ? metricDef(key) : null };
  });

  const people = plan.people.map(p => {
    const ch = choices.people?.[p.row] || {};
    const id = ch.id ?? (p.match.confidence === 'exact' || p.match.confidence === 'likely' ? p.match.id : null);
    let status = 'ok', reason = null;
    if (ch.skip) status = 'skipped';
    else if (!id) { status = 'needs'; reason = p.match.confidence === 'ambiguous' ? 'ambiguous' : 'unknown'; }
    else if (ch.id == null && p.match.confidence === 'likely' && !ch.confirmed) { status = 'needs'; reason = 'check'; }
    if (status === 'needs') problems.push({ type: 'person', row: p.row, reason });
    return { ...p, id, status, reason };
  });

  const toSave = [];
  const cells = [];
  plan.people.forEach((p, row) => {
    plan.columns.forEach(c => {
      const cellKey = `${row}:${c.index}`;
      const ch = choices.cells?.[cellKey] || {};
      const raw = ch.raw ?? plan.parsed.rows[row].cells[c.index];
      const col = columns.find(x => x.index === c.index);
      const person = people[row];
      const parsed = parseCell(raw);
      let status = 'ok', reason = null, entry = null;
      const date = plan.dateCol >= 0 ? (plan.parsed.rows[row].cells[plan.dateCol] || defaultDate) : defaultDate;

      if (ch.skip || parsed.kind === 'empty' || col.status === 'skipped' || person.status === 'skipped') status = 'skipped';
      else if (col.status === 'needs' || person.status === 'needs') status = 'waiting';          // blocked by an open question above
      else {
        const bilateral = !!col.def?.bilateral;
        if (parsed.kind === 'bad') { status = 'needs'; reason = 'unreadable'; }
        else if (bilateral && parsed.kind !== 'lr') { status = 'needs'; reason = 'needs-left-right'; }
        else if (!bilateral && parsed.kind === 'lr') { status = 'needs'; reason = 'single-value'; }
        else {
          entry = parsed.kind === 'lr' ? { date, left: parsed.left, right: parsed.right } : { date, value: parsed.value };
          if (existing.has(`${person.id}|${col.key}|${date}`) && ch.dup !== 'add') {
            if (ch.dup === 'skip') status = 'skipped';
            else { status = 'needs'; reason = 'duplicate'; }
          }
        }
      }
      if (status === 'needs') problems.push({ type: 'cell', row, col: c.index, reason });
      if (status === 'ok') toSave.push({ athleteId: person.id, metricKey: col.key, entry });
      cells.push({ row, col: c.index, raw, status, reason, entry });
    });
  });

  return { columns, people, cells, problems, toSave, canUpload: problems.length === 0 && toSave.length > 0 };
}

export const knownTestCount = Object.keys(TEST_INFO).length;
