/**
 * DataStorageTable — single source of truth for all physical and mobility testing data.
 *
 * Schema: derived on every render from METRIC_CATEGORIES (master list) + customMetrics.
 *         Columns are never removed; adding metrics/custom metrics immediately adds columns.
 *
 * Rows:   one row per (saved session × athlete). Multiple rows per athlete are expected.
 *         Values come directly from session.data so they appear the moment a session is saved.
 */
import { useMemo } from 'react';
import { METRIC_CATEGORIES } from '../../data/sessionMetrics';

const GOLD = '#A58D69';
const METRIC_W = 60; // px per metric column

// ── Frozen identity columns ────────────────────────────────────────────────────
const FROZEN = (() => {
  const defs = [
    { key: 'athleteId', label: 'ID',      width: 76  },
    { key: 'name',      label: 'Athlete', width: 148 },
    { key: 'sport',     label: 'Sport',   width: 84  },
    { key: 'date',      label: 'Date',    width: 92  },
  ];
  let left = 0;
  return defs.map(d => { const f = { ...d, left }; left += d.width; return f; });
})();

// ── Category colour palette (matches Data Entry categories) ───────────────────
const CAT_PALETTE = {
  biometrics:      { bg: '#f0fdf4', hd: '#15803d' },
  movementScreens: { bg: '#eff6ff', hd: '#1d4ed8' },
  power:           { bg: '#fdf4ff', hd: '#7e22ce' },
  reactivity:      { bg: '#fff7ed', hd: '#c2410c' },
  strength:        { bg: '#fefce8', hd: '#a16207' },
  capacity:        { bg: '#ecfdf5', hd: '#047857' },
  speedAgility:    { bg: '#fff1f2', hd: '#be123c' },
  aerobic:         { bg: '#f8fafc', hd: '#475569' },
  cognitive:       { bg: '#f0f9ff', hd: '#0369a1' },
  _custom:         { bg: '#fef3c7', hd: '#92400e' },
};

// Header row heights
const H0 = 22; // category row
const H1 = 34; // metric label row (allows 2-line wrap)
const H2 = 18; // side / unit row

// ── Schema builder ─────────────────────────────────────────────────────────────
function calcUnit(formulaType) {
  if (formulaType === 'pct_discrepancy_lr' || formulaType === 'pct_change') return '%';
  if (formulaType === 'ratio') return 'ratio';
  return '';
}

/**
 * Build the full column schema from:
 *  1. METRIC_CATEGORIES — the master metric list (always complete, never shrinks)
 *  2. customMetrics — practitioner-defined metrics (persist in localStorage)
 *
 * Returns an array of category groups, each containing column definitions.
 * Bilateral metrics produce two columns (L, R). Dependent calculations produce
 * additional italic columns styled to distinguish them from recorded columns.
 */
function buildSchema(customMetrics) {
  // Standard categories from master metric list
  const groups = METRIC_CATEGORIES.map(cat => ({
    catKey:   cat.key,
    catLabel: cat.label,
    cols: cat.metrics.flatMap(m => {
      const base = {
        metricKey: m.key,
        label:     m.label,
        unit:      m.unit || '',
        isCalc:    false,
        isCustom:  false,
      };
      return m.bilateral
        ? [{ ...base, side: 'L' }, { ...base, side: 'R' }]
        : [{ ...base, side: null }];
    }),
  }));

  // Custom metrics — grouped by their categoryLabel
  const byCategory = {};
  Object.values(customMetrics || {}).forEach(cm => {
    const cat = cm.categoryLabel || 'Custom';
    if (!byCategory[cat]) byCategory[cat] = [];
    const base = {
      metricKey: cm.key,
      label:     cm.label,
      unit:      cm.unit || '',
      isCalc:    false,
      isCustom:  true,
    };
    if (cm.bilateral) {
      byCategory[cat].push({ ...base, side: 'L' });
      byCategory[cat].push({ ...base, side: 'R' });
    } else {
      byCategory[cat].push({ ...base, side: null });
    }
    // Dependent calculations — visually distinguished (italic / tinted)
    (cm.dependentCalcs || []).forEach(calc => {
      byCategory[cat].push({
        metricKey: cm.key,
        label:     calc.name,
        unit:      calcUnit(calc.formulaType),
        side:      null,
        isCalc:    true,
        isCustom:  true,
        calcType:  calc.formulaType,
      });
    });
  });

  // Merge custom cols into existing category group or create a new group
  Object.entries(byCategory).forEach(([catLabel, cols]) => {
    const existing = groups.find(g => g.catLabel === catLabel);
    if (existing) {
      existing.cols.push(...cols);
    } else {
      groups.push({ catKey: '_custom', catLabel, cols });
    }
  });

  return groups.filter(g => g.cols.length > 0);
}

// ── Value extraction ───────────────────────────────────────────────────────────
/**
 * Extract a display value from a session cell for a given side.
 * Handles all cell formats produced by SessionTable:
 *   bilateral + attempts > 1 → { bestL, bestR, att1L… }
 *   bilateral + 1 attempt   → { L, R }
 *   unilateral + attempts   → { best, att1… }
 *   unilateral + 1 attempt  → { value }
 * Also handles phase2 format (left/right/value) for forward compatibility.
 */
function getVal(cell, side) {
  if (!cell) return null;
  if (side === 'L') return cell.bestL ?? cell.L ?? cell.left  ?? null;
  if (side === 'R') return cell.bestR ?? cell.R ?? cell.right ?? null;
  return cell.best ?? cell.value ?? null;
}

/** Compute a within-row calculated value (for custom metric dependent calcs). */
function computeCalc(col, data) {
  const cell = data[col.metricKey];
  if (!cell) return null;

  const L = cell.bestL ?? cell.L ?? cell.left  ?? null;
  const R = cell.bestR ?? cell.R ?? cell.right ?? null;

  if (col.calcType === 'pct_discrepancy_lr') {
    if (L == null || R == null) return null;
    const avg = (Math.abs(L) + Math.abs(R)) / 2;
    return avg === 0 ? null : parseFloat(((Math.abs(L - R) / avg) * 100).toFixed(1));
  }
  if (col.calcType === 'diff_lr') {
    if (L == null || R == null) return null;
    return parseFloat((L - R).toFixed(2));
  }
  // pct_change and ratio require cross-row context — not available per-row
  return null;
}

function fmt(v) {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isInteger(v) ? v : parseFloat(v.toFixed(2));
  return v;
}

// ── Shared style helpers ───────────────────────────────────────────────────────
function frozenHdr(f) {
  return {
    position: 'sticky', top: 0, left: f.left, zIndex: 22,
    width: f.width, minWidth: f.width, maxWidth: f.width,
    backgroundColor: GOLD, color: '#fff',
    padding: '4px 8px', fontSize: 10, fontWeight: 700,
    border: '1px solid rgba(255,255,255,0.18)',
    textAlign: 'left', verticalAlign: 'middle',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  };
}

function frozenCell(f, bg, extra = {}) {
  return {
    position: 'sticky', left: f.left, zIndex: 4,
    width: f.width, minWidth: f.width, maxWidth: f.width,
    backgroundColor: bg, border: '1px solid #f0f0f0',
    padding: '5px 8px', verticalAlign: 'middle',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    ...extra,
  };
}

function metricHdr(extra = {}) {
  return {
    padding: '3px 4px', fontSize: 9, fontWeight: 700,
    border: '1px solid #e5e7eb', textAlign: 'center',
    overflow: 'hidden', textOverflow: 'ellipsis',
    ...extra,
  };
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DataStorageTable({ athletes, sessions = [], customMetrics = {} }) {
  // Schema is rebuilt whenever customMetrics changes — covers the "immediately create
  // column at point of metric creation" requirement.
  const schema  = useMemo(() => buildSchema(customMetrics), [customMetrics]);
  const allCols = useMemo(() => schema.flatMap(g => g.cols), [schema]);

  // Build one row per (saved session × athlete)
  const rows = useMemo(() => {
    const athMap = new Map(athletes.map(a => [a.id, a]));
    const out = [];

    (sessions || [])
      .filter(s => s.savedAt)
      .forEach(s => {
        (s.athleteIds || []).forEach(aid => {
          const a = athMap.get(aid);
          if (!a) return;
          const data = s.data?.[aid] ?? {};
          // Skip athletes with no recorded values in this session
          const hasData = Object.values(data).some(
            cell => cell && Object.values(cell).some(v => v != null && v !== '')
          );
          if (!hasData) return;
          out.push({
            key:       `${s.id}:${aid}`,
            date:      s.date  || '',
            label:     s.label || 'Session',
            athleteId: aid,
            name:      a.name,
            sport:     a.sport || 'N/A',
            data,
          });
        });
      });

    // Sort: most recent date first, then alphabetically by name
    out.sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
    return out;
  }, [athletes, sessions]);

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-center">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">No testing data yet</p>
          <p className="text-xs text-gray-400">Save a testing session in Data Entry to see rows here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        {/* Explicit column widths for fixed layout */}
        <colgroup>
          {FROZEN.map(f => <col key={f.key} style={{ width: f.width }} />)}
          {allCols.map((_, i) => <col key={i} style={{ width: METRIC_W }} />)}
        </colgroup>

        <thead>
          {/* ── Row 0: Category spans ─────────────────────────────────────── */}
          <tr style={{ height: H0 }}>
            {/* Frozen identity headers — each spans all 3 header rows */}
            {FROZEN.map(f => (
              <th key={f.key} rowSpan={3} style={frozenHdr(f)}>
                {f.label}
              </th>
            ))}

            {/* Category group headers */}
            {schema.map((g, gi) => {
              const pal = CAT_PALETTE[g.catKey] || CAT_PALETTE._custom;
              return (
                <th key={gi} colSpan={g.cols.length} style={metricHdr({
                  position: 'sticky', top: 0, zIndex: 10,
                  backgroundColor: pal.bg, color: pal.hd,
                  fontSize: 8, fontWeight: 800, letterSpacing: '0.05em',
                  textTransform: 'uppercase', borderBottom: 'none',
                })}>
                  {g.catLabel}
                </th>
              );
            })}
          </tr>

          {/* ── Row 1: Metric labels ──────────────────────────────────────── */}
          <tr style={{ height: H1 }}>
            {allCols.map((col, i) => (
              <th
                key={i}
                title={`${col.label}${col.side ? ` (${col.side})` : ''}`}
                style={metricHdr({
                  position: 'sticky', top: H0, zIndex: 10,
                  backgroundColor: col.isCalc
                    ? '#fdf4ff'
                    : col.isCustom ? 'rgba(253,244,255,0.5)' : '#f9fafb',
                  color:     col.isCalc ? '#a21caf' : '#6b7280',
                  fontStyle: col.isCalc ? 'italic'  : 'normal',
                  whiteSpace: 'normal', lineHeight: 1.2,
                  borderTop: 'none', borderBottom: 'none',
                })}
              >
                {col.label}
              </th>
            ))}
          </tr>

          {/* ── Row 2: Side indicator + unit ─────────────────────────────── */}
          <tr style={{ height: H2 }}>
            {allCols.map((col, i) => (
              <th key={i} style={metricHdr({
                position: 'sticky', top: H0 + H1, zIndex: 10,
                backgroundColor: col.isCalc
                  ? '#fdf4ff'
                  : col.isCustom ? 'rgba(253,244,255,0.5)' : '#f9fafb',
                fontWeight: 400, color: '#9ca3af', fontSize: 8,
                borderTop: 'none',
              })}>
                {col.side ? `${col.side} · ${col.unit}` : col.unit}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, ri) => {
            const bg = ri % 2 === 0 ? '#fff' : '#fafafa';
            return (
              <tr key={row.key}>
                {/* Frozen: Athlete ID */}
                <td style={frozenCell(FROZEN[0], bg, { fontSize: 10, color: '#9ca3af', fontWeight: 500 })}>
                  {row.athleteId}
                </td>

                {/* Frozen: Athlete Name + session label sub-line */}
                <td style={frozenCell(FROZEN[1], bg)}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937' }}>{row.name}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{row.label}</div>
                </td>

                {/* Frozen: Sport */}
                <td style={frozenCell(FROZEN[2], bg, { fontSize: 11, color: '#374151' })}>
                  {row.sport}
                </td>

                {/* Frozen: Date */}
                <td style={frozenCell(FROZEN[3], bg, { fontSize: 11, fontWeight: 600, color: '#374151' })}>
                  {row.date}
                </td>

                {/* Metric value cells */}
                {allCols.map((col, ci) => {
                  const raw = col.isCalc
                    ? computeCalc(col, row.data)
                    : fmt(getVal(row.data[col.metricKey], col.side));

                  return (
                    <td key={ci} style={{
                      padding: '5px 3px', fontSize: 11, textAlign: 'center',
                      border: '1px solid #f0f0f0', verticalAlign: 'middle',
                      backgroundColor: col.isCalc ? 'rgba(253,244,255,0.35)' : bg,
                      color:     col.isCalc ? '#a21caf' : '#374151',
                      fontStyle: col.isCalc ? 'italic'  : 'normal',
                    }}>
                      {raw != null
                        ? <span style={{ fontWeight: 600 }}>{raw}</span>
                        : <span style={{ color: '#e0e0e0', fontSize: 10 }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
