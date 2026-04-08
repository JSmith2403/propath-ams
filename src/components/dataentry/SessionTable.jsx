import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Save, GripVertical, CheckCircle } from 'lucide-react';
import { METRIC_MAP, getSubCols, computeBest } from '../../data/sessionMetrics';

const GOLD = '#A58D69';
const FROZEN_W = 160;
const COL_W    = 62;
const HDR1_H   = 30;

export default function SessionTable({ session, athletes, onSaveSession, onBack, readOnly = false }) {
  const [metricOrder, setMetricOrder] = useState(session.metricOrder || session.metricKeys || []);
  const [data,        setData]        = useState(session.data || {});
  const [dragging,    setDragging]    = useState(null);
  const [dragOver,    setDragOver]    = useState(null);
  const [saved,       setSaved]       = useState(false);
  const inputRefs = useRef({});

  const allMetricDefs = { ...METRIC_MAP, ...session.customMetrics };

  const columns = metricOrder
    .map(key => ({ key, meta: allMetricDefs[key] }))
    .filter(c => c.meta)
    .map(c => ({ ...c, subCols: getSubCols(c.meta) }));

  const sessionAthletes = athletes.filter(a => (session.athleteIds || []).includes(a.id));

  // Flat ordered list of editable (subKey, athleteId) pairs for keyboard nav
  const editableCells = [];
  sessionAthletes.forEach((ath, rowIdx) => {
    columns.forEach(col => {
      col.subCols.filter(s => !s.readOnly).forEach(sub => {
        editableCells.push({ athleteId: ath.id, metricKey: col.key, subKey: sub.subKey, rowIdx });
      });
    });
  });

  const refKey = (athleteId, metricKey, subKey) => `${athleteId}__${metricKey}__${subKey}`;

  // Cell value get/set
  const getCellVal = (athleteId, metricKey, subKey) =>
    data[athleteId]?.[metricKey]?.[subKey] ?? '';

  const setCellVal = useCallback((athleteId, metricKey, subKey, rawVal, meta) => {
    setData(prev => {
      const oldCell = prev[athleteId]?.[metricKey] || {};
      const parsed  = rawVal === '' ? undefined : (meta?.text ? rawVal : (isNaN(Number(rawVal)) ? rawVal : Number(rawVal)));
      const newCell = computeBest({ ...oldCell, [subKey]: parsed }, meta || {});
      return {
        ...prev,
        [athleteId]: { ...(prev[athleteId] || {}), [metricKey]: newCell },
      };
    });
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e, athleteId, metricKey, subKey) => {
    const idx = editableCells.findIndex(c => c.athleteId === athleteId && c.metricKey === metricKey && c.subKey === subKey);
    const focus = cell => {
      const el = inputRefs.current[refKey(cell.athleteId, cell.metricKey, cell.subKey)];
      if (el) { el.focus(); el.select?.(); }
    };

    if (e.key === 'Tab') {
      e.preventDefault();
      const next = editableCells[e.shiftKey ? idx - 1 : idx + 1];
      if (next) focus(next);
    } else if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = editableCells[idx];
      const below = editableCells.find((c, i) => i > idx && c.metricKey === cur.metricKey && c.subKey === cur.subKey);
      if (below) focus(below);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cur = editableCells[idx];
      const above = [...editableCells].slice(0, idx).reverse().find(c => c.metricKey === cur.metricKey && c.subKey === cur.subKey);
      if (above) focus(above);
    }
  }, [editableCells]);

  // Column drag reorder
  const handleDragStart = (e, key) => {
    setDragging(key);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
  };
  const handleDragOver = (e, key) => { e.preventDefault(); setDragOver(key); };
  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    if (!dragging || dragging === targetKey) { setDragging(null); setDragOver(null); return; }
    setMetricOrder(prev => {
      const next = prev.filter(k => k !== dragging);
      const idx  = next.indexOf(targetKey);
      next.splice(idx >= 0 ? idx : next.length, 0, dragging);
      return next;
    });
    setDragging(null); setDragOver(null);
  };

  const handleSave = () => {
    onSaveSession({ ...session, metricOrder, data });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalSubCols = columns.reduce((s, c) => s + c.subCols.length, 0);

  // Shared cell style
  const thBase = (extra = {}) => ({
    border: '1px solid #e5e7eb',
    padding: '4px 5px',
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    ...extra,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 whitespace-nowrap">
            <ArrowLeft size={13} /> Sessions
          </button>
          <div className="h-4 w-px bg-gray-200 shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-gray-800">{session.label || 'Testing Session'}</span>
            <span className="text-xs text-gray-400 ml-2">
              {session.date} · {sessionAthletes.length} athletes · {columns.length} metrics
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
              <CheckCircle size={13} className="text-green-600" /> Saved
            </span>
          )}
          {readOnly
            ? <span className="text-xs font-medium px-2.5 py-1 rounded bg-gray-100 text-gray-500">Read-only</span>
            : (
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: GOLD }}>
                <Save size={13} /> Save Session
              </button>
            )
          }
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto" style={{ userSelect: dragging ? 'none' : 'auto' }}>
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            {/* Row 1 — metric group headers */}
            <tr>
              {/* Frozen athlete header spans both header rows */}
              <th rowSpan={2} style={{
                ...thBase({
                  position: 'sticky', left: 0, top: 0, zIndex: 22,
                  width: FROZEN_W, minWidth: FROZEN_W, maxWidth: FROZEN_W,
                  backgroundColor: GOLD, color: '#fff',
                  textAlign: 'left', verticalAlign: 'middle',
                  padding: '5px 10px',
                }),
              }}>
                Athlete
              </th>
              {columns.map(col => {
                const isDragTarget = dragOver === col.key;
                const isDragging   = dragging === col.key;
                return (
                  <th
                    key={col.key}
                    colSpan={col.subCols.length}
                    draggable={!readOnly}
                    onDragStart={e => handleDragStart(e, col.key)}
                    onDragOver={e => handleDragOver(e, col.key)}
                    onDrop={e => handleDrop(e, col.key)}
                    onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    style={thBase({
                      top: 0, zIndex: 10,
                      backgroundColor: isDragTarget ? '#b8916a' : GOLD,
                      color: '#fff',
                      textAlign: 'center',
                      cursor: readOnly ? 'default' : 'grab',
                      opacity: isDragging ? 0.4 : 1,
                      width: col.subCols.length * COL_W,
                      minWidth: col.subCols.length * COL_W,
                      borderBottom: isDragTarget ? '2px solid #fff' : undefined,
                    })}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {!readOnly && <GripVertical size={9} style={{ opacity: 0.55, flexShrink: 0 }} />}
                      {col.meta.label}
                      {col.meta.unit ? <span style={{ fontWeight: 400, opacity: 0.75 }}> ({col.meta.unit})</span> : null}
                    </span>
                  </th>
                );
              })}
            </tr>
            {/* Row 2 — sub-column headers */}
            <tr>
              {columns.map(col =>
                col.subCols.map(sub => (
                  <th key={`${col.key}-${sub.subKey}`}
                    style={thBase({
                      top: HDR1_H, zIndex: 10,
                      backgroundColor: sub.isBest ? '#e8d9c5' : '#f5f2ee',
                      color: sub.isBest ? '#7c5c2a' : '#6b7280',
                      fontWeight: sub.isBest ? 800 : 600,
                      textAlign: 'center',
                      width: COL_W, minWidth: COL_W, maxWidth: COL_W,
                    })}>
                    {sub.label || <span style={{ color: '#c0b8b0' }}>val</span>}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {sessionAthletes.length === 0 ? (
              <tr>
                <td colSpan={totalSubCols + 1} style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontSize: 13 }}>
                  No athletes in this session.
                </td>
              </tr>
            ) : (
              sessionAthletes.map((ath, rowIdx) => {
                const rowBg = rowIdx % 2 ? '#fafafa' : '#fff';
                return (
                  <tr key={ath.id}>
                    {/* Frozen name */}
                    <td style={{
                      position: 'sticky', left: 0, zIndex: 11,
                      backgroundColor: rowBg,
                      width: FROZEN_W, minWidth: FROZEN_W, maxWidth: FROZEN_W,
                      padding: '4px 10px', fontSize: 12, fontWeight: 600,
                      border: '1px solid #e5e7eb',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ath.name}
                    </td>

                    {/* Data cells */}
                    {columns.map(col =>
                      col.subCols.map(sub => {
                        const val = getCellVal(ath.id, col.key, sub.subKey);
                        const rk  = refKey(ath.id, col.key, sub.subKey);

                        if (sub.isBest || readOnly) {
                          return (
                            <td key={`${col.key}-${sub.subKey}`}
                              style={{
                                width: COL_W, minWidth: COL_W, maxWidth: COL_W,
                                textAlign: 'center', fontSize: 11,
                                padding: '4px 3px',
                                backgroundColor: sub.isBest ? 'rgba(165,141,105,0.07)' : rowBg,
                                border: '1px solid #e5e7eb',
                                color: sub.isBest ? '#7c5c2a' : '#374151',
                                fontWeight: sub.isBest ? 700 : 400,
                              }}>
                              {val !== '' && val != null ? val : '\u2014'}
                            </td>
                          );
                        }

                        return (
                          <td key={`${col.key}-${sub.subKey}`}
                            style={{
                              width: COL_W, minWidth: COL_W, maxWidth: COL_W,
                              padding: 0, border: '1px solid #e5e7eb',
                            }}>
                            <input
                              ref={el => { if (el) inputRefs.current[rk] = el; else delete inputRefs.current[rk]; }}
                              type={col.meta?.text ? 'text' : 'number'}
                              step="any"
                              value={val}
                              onChange={e => setCellVal(ath.id, col.key, sub.subKey, e.target.value, col.meta)}
                              onKeyDown={e => handleKeyDown(e, ath.id, col.key, sub.subKey)}
                              onFocus={e => e.target.style.backgroundColor = '#fffbf4'}
                              onBlur={e => e.target.style.backgroundColor = 'transparent'}
                              style={{
                                width: '100%', display: 'block',
                                textAlign: 'center', fontSize: 11,
                                border: 'none', outline: 'none',
                                backgroundColor: 'transparent',
                                padding: '5px 3px',
                                MozAppearance: 'textfield',
                              }}
                            />
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      {!readOnly && (
        <div className="shrink-0 px-4 py-2 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400">
            Tab \u2014 next cell \u00a0\u00b7\u00a0 Enter / \u2193 \u2014 cell below \u00a0\u00b7\u00a0 Drag column headers to reorder
          </p>
        </div>
      )}
    </div>
  );
}
