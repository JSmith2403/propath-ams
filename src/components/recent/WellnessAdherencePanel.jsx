import { useMemo, useState } from 'react';
import { Heart, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useWellnessAdherence } from '../../hooks/useWellnessAdherence';
import { getRagColour } from '../../utils/wellnessRag';

const RAG_HEX = { green: '#16a34a', amber: '#d97706', red: '#dc2626' };

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

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (athleteById.get(a.athleteId)?.name || '').localeCompare(athleteById.get(b.athleteId)?.name || '')),
    [rows, athleteById]
  );

  return (
    <div className="w-full h-full flex flex-col border-l border-ink-100 bg-white">
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

        {!loading && sortedRows.map(row => {
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
