import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, CheckCircle2, AlertTriangle, X, Loader2, Users, ChevronDown, Check } from 'lucide-react';
import { useWellnessAdherence } from '../../hooks/useWellnessAdherence';
import { getRagColour } from '../../utils/wellnessRag';

const RAG_HEX = { green: '#16a34a', amber: '#d97706', red: '#dc2626' };

// Which athletes the coach wants shown here — independent of whether
// wellness monitoring is actually toggled on for them (that's a
// separate, coach-controlled display preference: e.g. "I know this
// athlete has it on, but I don't want them cluttering this view").
// null = no preference saved yet, defaults to showing everyone.
const VISIBLE_IDS_KEY = 'wellness_overview:visible_ids';
function readVisibleIds() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(VISIBLE_IDS_KEY) : null;
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : null;
  } catch { return null; }
}
function persistVisibleIds(set) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(VISIBLE_IDS_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

function timeLabel(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Coach dashboard "Wellness Overview" — sits alongside Recent Updates.
 * One row per athlete with wellness monitoring toggled on: today's
 * check-in status, a 7-day completion strip, and an action column.
 *
 * "View" opens today's submitted responses in a popup (no navigation
 * away from Recent Updates). "Send reminder" is a placeholder — not
 * wired to any messaging system yet.
 */
export default function WellnessAdherencePanel({ athletes = [], onNavigate }) {
  const athleteIds = useMemo(() => athletes.map(a => a.id), [athletes]);
  const { rows, loading } = useWellnessAdherence(athleteIds);
  const athleteById = useMemo(() => {
    const m = new Map();
    for (const a of athletes) m.set(a.id, a);
    return m;
  }, [athletes]);

  const [viewingRow, setViewingRow] = useState(null); // row object or null
  const [statusFilter, setStatusFilter] = useState('all'); // all | not_completed | completed
  const [visibleIds, setVisibleIds] = useState(readVisibleIds); // Set<athleteId> | null
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close the athlete picker on outside click.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [pickerOpen]);

  const rosterSorted = useMemo(
    () => [...athletes].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [athletes]
  );

  // Base set for the first-ever edit: the full roster, so unchecking one
  // athlete reads as "everyone except this one" rather than silently
  // hiding anyone not currently wellness-active.
  const toggleVisible = (id) => {
    setVisibleIds(prev => {
      const base = prev ?? new Set(rosterSorted.map(a => a.id));
      const next = new Set(base);
      if (next.has(id)) next.delete(id); else next.add(id);
      persistVisibleIds(next);
      return next;
    });
  };

  const showAll = () => {
    const next = new Set(rosterSorted.map(a => a.id));
    persistVisibleIds(next);
    setVisibleIds(next);
  };
  const hideAll = () => {
    const next = new Set();
    persistVisibleIds(next);
    setVisibleIds(next);
  };

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (athleteById.get(a.athleteId)?.name || '').localeCompare(athleteById.get(b.athleteId)?.name || '')),
    [rows, athleteById]
  );

  const visibleRows = useMemo(
    () => (visibleIds === null ? sortedRows : sortedRows.filter(r => visibleIds.has(r.athleteId))),
    [sortedRows, visibleIds]
  );

  const counts = useMemo(() => ({
    all:           visibleRows.length,
    completed:     visibleRows.filter(r => r.todayCompleted).length,
    not_completed: visibleRows.filter(r => !r.todayCompleted).length,
  }), [visibleRows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'completed')     return visibleRows.filter(r => r.todayCompleted);
    if (statusFilter === 'not_completed') return visibleRows.filter(r => !r.todayCompleted);
    return visibleRows;
  }, [visibleRows, statusFilter]);

  return (
    <div className="w-full h-full flex flex-col rounded-xl border border-ink-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-start justify-between border-b border-ink-100">
        <div className="flex items-center gap-2">
          <Heart size={16} style={{ color: '#A58D69' }} />
          <div>
            <h2 className="text-base font-bold" style={{ color: '#1C1C1C' }}>Wellness Overview</h2>
            <p className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>
              Daily check-ins and 7-day adherence
            </p>
          </div>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('wellness')}
            className="text-xs font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
            style={{ color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
          >
            View all wellness
          </button>
        )}
      </div>

      {/* Status filter + athlete picker */}
      <div className="px-5 py-2.5 border-b border-ink-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex rounded-md p-0.5" style={{ backgroundColor: '#f3f4f6' }}>
          {[
            { key: 'all',           label: 'All' },
            { key: 'not_completed', label: 'Not completed' },
            { key: 'completed',     label: 'Completed' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
              style={{
                color:           statusFilter === opt.key ? '#1C1C1C' : '#6b7280',
                backgroundColor: statusFilter === opt.key ? '#fff' : 'transparent',
                boxShadow:       statusFilter === opt.key ? '0 1px 2px rgba(0,0,0,0.06)' : undefined,
              }}
            >
              {opt.label} ({counts[opt.key]})
            </button>
          ))}
        </div>

        {/* Athlete picker — who appears in this list at all, independent
            of whether wellness monitoring is toggled on for them. */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setPickerOpen(v => !v)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded transition-colors"
            style={{ color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
          >
            <Users size={12} />
            Athletes ({visibleIds === null ? rosterSorted.length : visibleIds.size})
            <ChevronDown size={12} />
          </button>

          {pickerOpen && (
            <div
              className="absolute right-0 mt-1 rounded-lg bg-white shadow-xl z-20 overflow-hidden"
              style={{ width: 240, border: '1px solid #e5e7eb' }}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-ink-100">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                  Show on this list
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={showAll} className="text-[10px] font-semibold" style={{ color: '#A58D69' }}>All</button>
                  <button onClick={hideAll} className="text-[10px] font-semibold" style={{ color: '#6b7280' }}>None</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {rosterSorted.map(a => {
                  const isOn = visibleIds === null ? true : visibleIds.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleVisible(a.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="shrink-0 flex items-center justify-center rounded"
                        style={{
                          width: 14, height: 14,
                          backgroundColor: isOn ? '#A58D69' : '#fff',
                          border: isOn ? 'none' : '1px solid #d1d5db',
                        }}
                      >
                        {isOn && <Check size={10} color="#fff" strokeWidth={3} />}
                      </span>
                      <span className="text-xs truncate" style={{ color: '#1C1C1C' }}>{a.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={18} className="animate-spin" style={{ color: '#A58D69' }} />
          </div>
        )}

        {!loading && sortedRows.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>No athletes on wellness</div>
            <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
              Toggle wellness monitoring on for an athlete to see them here.
            </div>
          </div>
        )}

        {!loading && sortedRows.length > 0 && visibleRows.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>No athletes selected</div>
            <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
              Use the Athletes filter above to choose who shows here.
            </div>
          </div>
        )}

        {!loading && visibleRows.length > 0 && filteredRows.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>
              {statusFilter === 'completed' ? 'No one has checked in yet' : 'Everyone has checked in'}
            </div>
          </div>
        )}

        {!loading && filteredRows.map(row => {
          const athlete = athleteById.get(row.athleteId);
          if (!athlete) return null;
          return (
            <div key={row.athleteId} className="flex items-center gap-3 px-5 py-3 border-b border-ink-50">
              {/* Avatar + name */}
              <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 32, height: 32, backgroundColor: '#085777' }}>
                {athlete.photo ? (
                  <img src={athlete.photo} alt={athlete.name} className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'top center' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ fontSize: 11 }}>
                    {initials(athlete.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0" style={{ width: 108 }}>
                <div className="text-[13px] font-semibold truncate" style={{ color: '#1C1C1C' }}>{athlete.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {row.todayCompleted ? (
                    <>
                      <CheckCircle2 size={11} style={{ color: '#16a34a' }} />
                      <span className="text-[10px] font-medium" style={{ color: '#16a34a' }}>
                        Completed {timeLabel(row.todayTime)}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={11} style={{ color: '#d97706' }} />
                      <span className="text-[10px] font-medium" style={{ color: '#d97706' }}>Not completed</span>
                    </>
                  )}
                </div>
              </div>

              {/* 7-day strip */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  {row.last7.map(d => (
                    <span
                      key={d.dateISO}
                      title={d.dateISO}
                      className="rounded-sm"
                      style={{
                        width: 14, height: 14,
                        backgroundColor: d.completed ? '#22c55e' : '#e5e7eb',
                      }}
                    />
                  ))}
                  <span className="ml-2 text-[11px] font-semibold whitespace-nowrap" style={{ color: '#1C1C1C' }}>
                    {row.adherencePct}%
                  </span>
                  <span className="text-[10px] whitespace-nowrap" style={{ color: '#9ca3af' }}>
                    {row.adherenceCount}/7
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0">
                {row.todayCompleted ? (
                  <button
                    onClick={() => setViewingRow(row)}
                    className="text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    style={{ color: '#1C1C1C', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
                  >
                    View
                  </button>
                ) : (
                  <button
                    disabled
                    title="Coming soon"
                    className="text-xs font-semibold px-3 py-1.5 rounded cursor-not-allowed"
                    style={{ color: '#A58D69', border: '1px solid #A58D69', backgroundColor: 'rgba(165,141,105,0.08)' }}
                  >
                    Send reminder
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {viewingRow && (
        <ViewResponsesModal
          row={viewingRow}
          athlete={athleteById.get(viewingRow.athleteId)}
          onClose={() => setViewingRow(null)}
        />
      )}
    </div>
  );
}

// ─── "View" popup — today's responses, read-only ────────────────────────────
function ViewResponsesModal({ row, athlete, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <div>
            <p className="text-sm font-bold" style={{ color: '#1C1C1C' }}>{athlete?.name || 'Athlete'}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>
              Today's check-in · {timeLabel(row.todayTime)}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-3">
          {row.questions.length === 0 && (
            <p className="text-xs" style={{ color: '#9ca3af' }}>No questions configured for this athlete.</p>
          )}
          {row.questions.map(q => {
            const value = row.todayResponses?.[q.id];
            const rag = getRagColour(value, q);
            const hasValue = value != null && value !== '';
            return (
              <div key={q.id} className="flex items-start justify-between gap-3">
                <span className="text-xs flex-1" style={{ color: '#374151' }}>{q.label}</span>
                <span
                  className="text-xs font-bold shrink-0"
                  style={{ color: hasValue ? (rag ? RAG_HEX[rag] : '#1C1C1C') : '#d1d5db' }}
                >
                  {hasValue ? String(value) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
