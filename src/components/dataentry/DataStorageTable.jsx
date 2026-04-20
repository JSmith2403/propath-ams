/**
 * DataStorageTable — longitudinal view of all physical/mobility testing data.
 *
 * Reads directly from athlete.phase2.performance.entries, .mobility.entries,
 * and .maturation.entries — the same source Performance Testing uses.
 * Edits write back to the same location via updateEntryById.
 */
import { useMemo, useState, useRef } from 'react';
import { METRIC_CATEGORIES, METRIC_MAP, SYNC_MAP } from '../../data/sessionMetrics';

const GOLD = '#A58D69';
const METRIC_W = 60;

// ── Frozen identity columns ───────────────────────────────────────────────────
const FROZEN = (() => {
  const defs = [
    { key: 'name',  label: 'Athlete', width: 148 },
    { key: 'sport', label: 'Sport',   width: 84  },
    { key: 'date',  label: 'Date',    width: 92  },
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
  const groups = METRIC_CATEGORIES.map(cat => {
    const cols = cat.metrics.flatMap(m => {
      const base = { metricKey: m.key, label: m.label, unit: m.unit || '', isCalc: false, isCustom: false };
      return m.bilateral
        ? [{ ...base, side: 'L' }, { ...base, side: 'R' }]
        : [{ ...base, side: null }];
    });

    // Inject the IMTP Relative Force read-only column into the Strength group,
    // placed immediately after IMTP Peak Force so it reads naturally.
    if (cat.key === 'strength') {
      const calcCol = {
        metricKey: 'imtpRelForce',
        label:     'IMTP Rel Force',
        unit:      'N/kg',
        isCalc:    true,
        isCustom:  false,
        side:      null,
        calcType:  'imtp_rel_force',
      };
      const idx = cols.findIndex(c => c.metricKey === 'imtpPeakForce');
      if (idx >= 0) cols.splice(idx + 1, 0, calcCol);
      else cols.push(calcCol);
    }

    return { catKey: cat.key, catLabel: cat.label, cols };
  });

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

// ── Determine which bucket a metricKey lives in ──────────────────────────────
function getBucket(metricKey) {
  const sync = SYNC_MAP[metricKey];
  if (!sync) return 'performance';
  return sync.type; // 'performance' | 'mobility' | 'maturation'
}

function getStorageKey(metricKey) {
  const sync = SYNC_MAP[metricKey];
  if (!sync) return metricKey;
  if (sync.type === 'maturation') return null; // maturation uses fields, not metric keys
  return sync.key;
}

// ── Value extraction from entries ────────────────────────────────────────────
// Accepts both the current value/left/right format and legacy best/bestL/bestR
// format so entries created before the refactor still render.
function getEntryVal(entry, side) {
  if (!entry) return null;
  if (side === 'L') return entry.left ?? entry.bestL ?? null;
  if (side === 'R') return entry.right ?? entry.bestR ?? null;
  return entry.value ?? entry.best ?? null;
}

function computeCalc(col, entryMap) {
  // Cross-metric IMTP Relative Force: peak force / (bodyweight * 9.81)
  // Both inputs come from the same session (same row in Data Storage).
  if (col.calcType === 'imtp_rel_force') {
    const forceEntry  = entryMap.imtpPeakForce;
    const weightEntry = entryMap.weight;
    const f  = forceEntry?.value  ?? forceEntry?.best  ?? null;
    const bw = weightEntry?.value ?? weightEntry?.best ?? null;
    if (f == null || bw == null || bw <= 0) return null;
    return parseFloat((Number(f) / (Number(bw) * 9.81)).toFixed(1));
  }

  const entry = entryMap[col.metricKey];
  if (!entry) return null;
  const L = entry.left ?? entry.bestL ?? null;
  const R = entry.right ?? entry.bestR ?? null;
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

// ── Build rows from athlete phase2 data ──────────────────────────────────────
function buildRows(athletes, allCols) {
  const rows = [];

  (athletes || []).forEach(athlete => {
    // Skip athletes without phase2 or with a malformed shape — renders shouldn't
    // crash because one athlete is missing a nested bucket.
    if (!athlete || !athlete.phase2) return;
    const p2 = athlete.phase2;

    // Collect all entries grouped by date
    const dateMap = {}; // date → { metricKey → entry }

    // Performance entries — tolerate missing/null bucket
    const perfEntries = p2.performance?.entries || {};
    Object.entries(perfEntries).forEach(([metricKey, entryList]) => {
      (entryList || []).forEach(entry => {
        if (!entry || !entry.date) return;
        if (!dateMap[entry.date]) dateMap[entry.date] = {};
        dateMap[entry.date][metricKey] = entry;
      });
    });

    // Mobility entries — tolerate missing/null bucket
    const mobEntries = p2.mobility?.entries || {};
    Object.entries(mobEntries).forEach(([joint, entryList]) => {
      (entryList || []).forEach(entry => {
        if (!entry || !entry.date) return;
        if (!dateMap[entry.date]) dateMap[entry.date] = {};
        // Map back from mobility storage key to session metric key
        dateMap[entry.date][joint] = entry;
      });
    });

    // Maturation entries → map fields back to metric keys
    const matEntries = p2.maturation?.entries || [];
    const matFieldToMetric = {};
    Object.entries(SYNC_MAP).forEach(([metricKey, sync]) => {
      if (sync.type === 'maturation') matFieldToMetric[sync.field] = metricKey;
    });
    matEntries.forEach(entry => {
      if (!entry.date) return;
      if (!dateMap[entry.date]) dateMap[entry.date] = {};
      // Map each maturation field to its corresponding metric key
      Object.entries(matFieldToMetric).forEach(([field, metricKey]) => {
        if (entry[field] != null && entry[field] !== '') {
          dateMap[entry.date][metricKey] = {
            id: entry.id,
            date: entry.date,
            value: entry[field],
            _matField: field,
            _matEntryId: entry.id,
          };
        }
      });
    });

    // Build a row for each date
    Object.entries(dateMap).forEach(([date, entryMap]) => {
      // Check at least one column has data
      const hasData = allCols.some(col => {
        if (col.isCalc) return false;
        const entry = entryMap[col.metricKey];
        return entry && getEntryVal(entry, col.side) != null;
      });
      if (!hasData) return;

      rows.push({
        key: `${athlete.id}:${date}`,
        athleteId: athlete.id,
        name: athlete.name,
        sport: athlete.sport || 'N/A',
        date,
        entryMap, // { metricKey → entry }
      });
    });
  });

  rows.sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
  return rows;
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
  customMetrics = {},
  updateEntryById,
  onUpdateAthlete,
}) {
  const schema  = useMemo(() => buildSchema(customMetrics), [customMetrics]);
  const allCols = useMemo(() => schema.flatMap(g => g.cols), [schema]);

  const [editCell, setEditCell] = useState(null);
  const editInputRef = useRef(null);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState(null);

  // ── Rows from athlete phase2 data ─────────────────────────────────────────
  const rows = useMemo(() => buildRows(athletes, allCols), [athletes, allCols]);

  // ── Editing ────────────────────────────────────────────────────────────────
  function startEdit(rowKey, field, currentValue) {
    setEditCell({ rowKey, field, initValue: String(currentValue ?? '') });
  }

  function cancelEdit() { setEditCell(null); }

  function commitEdit() {
    if (!editCell) return;
    const { rowKey, field } = editCell;
    const value = (editInputRef.current?.value ?? editCell.initValue).trim();
    const row = rows.find(r => r.key === rowKey);
    if (!row) { setEditCell(null); return; }

    if (field === 'name') {
      if (value) onUpdateAthlete?.(row.athleteId, { name: value });
    } else if (field === 'sport') {
      if (value) onUpdateAthlete?.(row.athleteId, { sport: value });
    } else if (field.startsWith('m')) {
      const colIdx = parseInt(field.slice(1), 10);
      const col = allCols[colIdx];
      if (!col || col.isCalc) { setEditCell(null); return; }

      const mDef = METRIC_MAP[col.metricKey] || (customMetrics || {})[col.metricKey];
      const isText = mDef?.text === true;
      const parsed = isText ? value : parseFloat(value);
      if (!isText && (!value || isNaN(parsed))) { setEditCell(null); return; }

      const entry = row.entryMap[col.metricKey];
      if (!entry) { setEditCell(null); return; }

      // Determine which field to update on the entry
      let patch;
      if (entry._matField) {
        // Maturation entry — update the specific field
        const bucket = 'maturation';
        const matPatch = { [entry._matField]: parsed };
        updateEntryById?.(row.athleteId, bucket, null, entry._matEntryId, matPatch);
        setDirtyCount(c => c + 1);
        setEditCell(null);
        return;
      }

      if (col.side === 'L') {
        patch = { left: parsed };
      } else if (col.side === 'R') {
        patch = { right: parsed };
      } else {
        patch = { value: parsed };
      }

      const bucket = getBucket(col.metricKey);
      const storageKey = getStorageKey(col.metricKey) || col.metricKey;
      updateEntryById?.(row.athleteId, bucket, storageKey, entry.id, patch);
      setDirtyCount(c => c + 1);
    }

    setEditCell(null);
  }

  function handleSaveAll() {
    setDirtyCount(0);
    setSaveMessage('Changes saved');
    setTimeout(() => setSaveMessage(null), 2500);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') cancelEdit();
  }

  function isEditingCell(rowKey, field) {
    return editCell?.rowKey === rowKey && editCell?.field === field;
  }

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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Save bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <span className="text-xs text-gray-400">
          {dirtyCount > 0
            ? `${dirtyCount} unsaved change${dirtyCount > 1 ? 's' : ''}`
            : 'All changes saved'}
        </span>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs font-medium" style={{ color: '#22c55e' }}>{saveMessage}</span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={dirtyCount === 0}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity"
            style={{
              backgroundColor: GOLD,
              opacity: dirtyCount === 0 ? 0.4 : 1,
              cursor: dirtyCount === 0 ? 'default' : 'pointer',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

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

                {/* Athlete Name — editable */}
                <td style={frozenCell(FROZEN[0], bg, { overflow: 'visible' })}>
                  {isEditingCell(row.key, 'name') ? renderInput({ fontWeight: 600, fontSize: 12 }) : (
                    <div
                      title="Click to edit"
                      onClick={() => startEdit(row.key, 'name', row.name)}
                      style={{ cursor: 'text' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.name}
                      </div>
                    </div>
                  )}
                </td>

                {/* Sport — editable */}
                <td style={frozenCell(FROZEN[1], bg, { overflow: 'visible' })}>
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

                {/* Date — read-only */}
                <td style={frozenCell(FROZEN[2], bg)}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.date}
                  </div>
                </td>

                {/* Metric cells */}
                {allCols.map((col, ci) => {
                  const field   = `m${ci}`;
                  const entry   = row.entryMap[col.metricKey];
                  const raw     = col.isCalc
                    ? computeCalc(col, row.entryMap)
                    : fmt(getEntryVal(entry, col.side));
                  const editable = !col.isCalc && !!entry;
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
    </div>
  );
}
