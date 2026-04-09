/**
 * DataStorageTable — single source of truth for all physical and mobility testing data.
 *
 * All cells are inline-editable: click any data cell to edit, press Enter or click away to save.
 * Changes are written to Supabase immediately via onUpsertSession / onUpdateAthlete.
 */
import { useMemo, useState, useRef } from 'react';
import { METRIC_CATEGORIES, METRIC_MAP } from '../../data/sessionMetrics';

const GOLD = '#A58D69';
const METRIC_W = 60;

// ── Frozen identity columns ───────────────────────────────────────────────────
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

// ── Category colour palette ───────────────────────────────────────────────────
const CAT_PALETTE = {
  biometrics:      { bg: '#f0fdf4', hd: '#15803d' },
  pahMaturation:   { bg: '#faf5ff', hd: '#7c3aed' },
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

const H0 = 22;
const H1 = 34;
const H2 = 18;

// ── Schema builder ────────────────────────────────────────────────────────────
function calcUnit(formulaType) {
  if (formulaType === 'pct_discrepancy_lr' || formulaType === 'pct_change') return '%';
  if (formulaType === 'ratio') return 'ratio';
  return '';
}

function buildSchema(customMetrics) {
  const groups = METRIC_CATEGORIES.map(cat => ({
    catKey:   cat.key,
    catLabel: cat.label,
    cols: cat.metrics.flatMap(m => {
      const base = { metricKey: m.key, label: m.label, unit: m.unit || '', isCalc: false, isCustom: false };
      return m.bilateral
        ? [{ ...base, side: 'L' }, { ...base, side: 'R' }]
        : [{ ...base, side: null }];
    }),
  }));

  const byCategory = {};
  Object.values(customMetrics || {}).forEach(cm => {
    const cat = cm.categoryLabel || 'Custom';
    if (!byCategory[cat]) byCategory[cat] = [];
    const base = { metricKey: cm.key, label: cm.label, unit: cm.unit || '', isCalc: false, isCustom: true };
    if (cm.bilateral) {
      byCategory[cat].push({ ...base, side: 'L' });
      byCategory[cat].push({ ...base, side: 'R' });
    } else {
      byCategory[cat].push({ ...base, side: null });
    }
    (cm.dependentCalcs || []).forEach(calc => {
      byCategory[cat].push({
        metricKey: cm.key, label: calc.name, unit: calcUnit(calc.formulaType),
        side: null, isCalc: true, isCustom: true, calcType: calc.formulaType,
      });
    });
  });

  Object.entries(byCategory).forEach(([catLabel, cols]) => {
    const existing = groups.find(g => g.catLabel === catLabel);
    if (existing) existing.cols.push(...cols);
    else groups.push({ catKey: '_custom', catLabel, cols });
  });

  return groups.filter(g => g.cols.length > 0);
}

// ── Value extraction ──────────────────────────────────────────────────────────
function getVal(cell, side) {
  if (!cell) return null;
  if (side === 'L') return cell.bestL ?? cell.L ?? cell.left  ?? null;
  if (side === 'R') return cell.bestR ?? cell.R ?? cell.right ?? null;
  return cell.best ?? cell.value ?? null;
}

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
  return null;
}

function fmt(v) {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isInteger(v) ? v : parseFloat(v.toFixed(2));
  return v;
}

// ── Style helpers ─────────────────────────────────────────────────────────────
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

const INPUT_BASE = {
  border: 'none',
  outline: `1px solid ${GOLD}`,
  borderRadius: 2,
  backgroundColor: '#fffbf5',
  boxSizing: 'border-box',
  width: '100%',
  padding: '2px 4px',
  fontSize: 11,
};

// ── Main component ────────────────────────────────────────────────────────────
export default function DataStorageTable({
  athletes,
  sessions = [],
  customMetrics = {},
  onUpsertSession,
  onSyncSession,
  onUpdateAthlete,
}) {
  const schema  = useMemo(() => buildSchema(customMetrics), [customMetrics]);
  const allCols = useMemo(() => schema.flatMap(g => g.cols), [schema]);

  // editCell: { rowKey, field, initValue }
  // field: 'name' | 'sport' | 'date' | `m${colIdx}`
  const [editCell, setEditCell] = useState(null);
  const editInputRef = useRef(null);

  // ── Rows ───────────────────────────────────────────────────────────────────
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
          const hasData = Object.values(data).some(
            cell => cell && Object.values(cell).some(v => v != null && v !== '')
          );
          if (!hasData) return;
          out.push({
            key:       `${s.id}:${aid}`,
            sessionId: s.id,
            date:      s.date  || '',
            label:     s.label || 'Session',
            athleteId: aid,
            name:      a.name,
            sport:     a.sport || 'N/A',
            data,
          });
        });
      });
    out.sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
    return out;
  }, [athletes, sessions]);

  // ── Editing ────────────────────────────────────────────────────────────────
  function startEdit(rowKey, field, currentValue) {
    setEditCell({ rowKey, field, initValue: String(currentValue ?? '') });
  }

  function cancelEdit() { setEditCell(null); }

  function commitEdit() {
    if (!editCell) return;
    const { rowKey, field } = editCell;
    // Read from DOM input directly — avoids stale closure with rapid typing
    const value = (editInputRef.current?.value ?? editCell.initValue).trim();
    const row = rows.find(r => r.key === rowKey);
    if (!row) { setEditCell(null); return; }

    if (field === 'name') {
      if (value) onUpdateAthlete?.(row.athleteId, { name: value });

    } else if (field === 'sport') {
      if (value) onUpdateAthlete?.(row.athleteId, { sport: value });

    } else if (field === 'date') {
      const session = (sessions || []).find(s => s.id === row.sessionId);
      if (session && value && onUpsertSession) {
        const updated = { ...session, date: value };
        onUpsertSession(updated);
        onSyncSession?.(updated);
      }

    } else if (field.startsWith('m')) {
      const colIdx = parseInt(field.slice(1), 10);
      const col = allCols[colIdx];
      if (!col || col.isCalc) { setEditCell(null); return; }
      const session = (sessions || []).find(s => s.id === row.sessionId);
      if (!session || !value) { setEditCell(null); return; }

      const mDef   = METRIC_MAP[col.metricKey] || (customMetrics || {})[col.metricKey];
      const isText = mDef?.text === true;
      const parsed = isText ? value : parseFloat(value);
      if (!isText && isNaN(parsed)) { setEditCell(null); return; }

      // Preserve the existing field name format (bestL/L/bestR/R/best/value)
      const existing = session.data?.[row.athleteId]?.[col.metricKey] || {};
      let updatedCell;
      if (col.side === 'L') {
        updatedCell = { ...existing, ['bestL' in existing ? 'bestL' : 'L']: parsed };
      } else if (col.side === 'R') {
        updatedCell = { ...existing, ['bestR' in existing ? 'bestR' : 'R']: parsed };
      } else {
        updatedCell = { ...existing, ['best' in existing ? 'best' : 'value']: parsed };
      }

      const updatedData = {
        ...session.data,
        [row.athleteId]: { ...(session.data?.[row.athleteId] || {}), [col.metricKey]: updatedCell },
      };
      const updatedSession = { ...session, data: updatedData };
      onUpsertSession?.(updatedSession);
      onSyncSession?.(updatedSession);
    }

    setEditCell(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') cancelEdit();
  }

  function isEditingCell(rowKey, field) {
    return editCell?.rowKey === rowKey && editCell?.field === field;
  }

  // Shared input element rendered into any editing cell
  function renderInput(extraStyle = {}) {
    return (
      <input
        ref={editInputRef}
        autoFocus
        defaultValue={editCell?.initValue ?? ''}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        style={{ ...INPUT_BASE, ...extraStyle }}
      />
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
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
        <colgroup>
          {FROZEN.map(f => <col key={f.key} style={{ width: f.width }} />)}
          {allCols.map((_, i) => <col key={i} style={{ width: METRIC_W }} />)}
        </colgroup>

        <thead>
          {/* Row 0: Category spans */}
          <tr style={{ height: H0 }}>
            {FROZEN.map(f => (
              <th key={f.key} rowSpan={3} style={frozenHdr(f)}>{f.label}</th>
            ))}
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

          {/* Row 1: Metric labels */}
          <tr style={{ height: H1 }}>
            {allCols.map((col, i) => (
              <th key={i} title={`${col.label}${col.side ? ` (${col.side})` : ''}`}
                style={metricHdr({
                  position: 'sticky', top: H0, zIndex: 10,
                  backgroundColor: col.isCalc ? '#fdf4ff' : col.isCustom ? 'rgba(253,244,255,0.5)' : '#f9fafb',
                  color: col.isCalc ? '#a21caf' : '#6b7280',
                  fontStyle: col.isCalc ? 'italic' : 'normal',
                  whiteSpace: 'normal', lineHeight: 1.2,
                  borderTop: 'none', borderBottom: 'none',
                })}>
                {col.label}
              </th>
            ))}
          </tr>

          {/* Row 2: Side + unit */}
          <tr style={{ height: H2 }}>
            {allCols.map((col, i) => (
              <th key={i} style={metricHdr({
                position: 'sticky', top: H0 + H1, zIndex: 10,
                backgroundColor: col.isCalc ? '#fdf4ff' : col.isCustom ? 'rgba(253,244,255,0.5)' : '#f9fafb',
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

                {/* Athlete ID — read-only */}
                <td style={frozenCell(FROZEN[0], bg, {
                  fontSize: 10, color: '#9ca3af', fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                })}>
                  {row.athleteId}
                </td>

                {/* Athlete Name — editable */}
                <td style={frozenCell(FROZEN[1], bg, { overflow: 'visible' })}>
                  {isEditingCell(row.key, 'name') ? renderInput({ fontWeight: 600, fontSize: 12 }) : (
                    <div
                      title="Click to edit"
                      onClick={() => startEdit(row.key, 'name', row.name)}
                      style={{ cursor: 'text' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.name}
                      </div>
                      <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{row.label}</div>
                    </div>
                  )}
                </td>

                {/* Sport — editable */}
                <td style={frozenCell(FROZEN[2], bg, { overflow: 'visible' })}>
                  {isEditingCell(row.key, 'sport') ? renderInput({ fontSize: 11 }) : (
                    <div
                      title="Click to edit"
                      onClick={() => startEdit(row.key, 'sport', row.sport)}
                      style={{ cursor: 'text', fontSize: 11, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {row.sport}
                    </div>
                  )}
                </td>

                {/* Date — editable */}
                <td style={frozenCell(FROZEN[3], bg, { overflow: 'visible' })}>
                  {isEditingCell(row.key, 'date') ? renderInput({ fontSize: 11, fontWeight: 600 }) : (
                    <div
                      title="Click to edit"
                      onClick={() => startEdit(row.key, 'date', row.date)}
                      style={{ cursor: 'text', fontSize: 11, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {row.date}
                    </div>
                  )}
                </td>

                {/* Metric cells */}
                {allCols.map((col, ci) => {
                  const field    = `m${ci}`;
                  const raw      = col.isCalc ? computeCalc(col, row.data) : fmt(getVal(row.data[col.metricKey], col.side));
                  const editable = !col.isCalc;
                  const editing  = isEditingCell(row.key, field);

                  return (
                    <td key={ci} style={{
                      padding: 0, fontSize: 11, textAlign: 'center',
                      border: '1px solid #f0f0f0', verticalAlign: 'middle',
                      backgroundColor: col.isCalc ? 'rgba(253,244,255,0.35)' : bg,
                      color: col.isCalc ? '#a21caf' : '#374151',
                      fontStyle: col.isCalc ? 'italic' : 'normal',
                    }}>
                      {editing ? renderInput({ textAlign: 'center', fontWeight: 600, padding: '4px 2px' }) : (
                        <div
                          onClick={editable ? () => startEdit(row.key, field, raw) : undefined}
                          style={{ padding: '5px 3px', cursor: editable ? 'text' : 'default', minHeight: 26 }}
                        >
                          {raw != null
                            ? <span style={{ fontWeight: 600 }}>{raw}</span>
                            : <span style={{ color: '#e0e0e0', fontSize: 10 }}>—</span>}
                        </div>
                      )}
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
