import { useState, useEffect, Fragment } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { RAG_CONFIG } from '../../data/athletes';

const RAG_OPTIONS = ['green', 'amber', 'red', 'grey'];
const DEFAULT_ENTRY_TYPES = ['Assessment', 'Check-in', 'Observation'];

function within4Months(timestamp) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 4);
  return new Date(timestamp) >= cutoff;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Single entry row ────────────────────────────────────────────────────────
function EntryRow({ entry, flashId, fading, onDelete }) {
  const config = RAG_CONFIG[entry.status] || RAG_CONFIG.grey;
  const isReview = entry.source === 'quarterly_review';
  const isFlashing = flashId === entry.id;

  const handleDelete = () => {
    if (!onDelete) return;
    if (window.confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      onDelete(entry.id);
    }
  };

  return (
    <div
      id={`entry-${entry.id}`}
      className="group flex gap-3 border-b border-gray-50 last:border-0 rounded"
      style={{
        padding: '12px 8px',
        backgroundColor: isFlashing
          ? (fading ? 'transparent' : 'rgba(165, 141, 105, 0.15)')
          : 'transparent',
        transition: isFlashing && fading ? 'background-color 1.5s ease-out' : 'none',
      }}
    >
      <div className="pt-0.5 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold text-gray-700">{entry.staff}</span>
          {entry.entryType && entry.entryType !== 'General note' && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {entry.entryType}
            </span>
          )}
          {isReview && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(165,141,105,0.12)', color: '#A58D69' }}>
              <Star size={9} /> Quarterly Review
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{formatTimestamp(entry.timestamp)}</span>
        </div>
        {entry.note
          ? <p className="text-sm text-gray-600 leading-relaxed">{entry.note}</p>
          : <p className="text-sm text-gray-300 italic">No notes recorded.</p>}
      </div>
      {onDelete && (
        <button
          onClick={handleDelete}
          title="Delete entry"
          className="shrink-0 self-start mt-0.5 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Divider marking the 4-month threshold ───────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ backgroundColor: '#fde68a' }} />
      <span className="text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap"
        style={{ color: '#92400e', backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
        Older than 4 months — not shown on overview
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: '#fde68a' }} />
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function PillarTab({
  label,
  status,
  logEntries = [],
  onStatusChange,
  onAddEntry,
  onDeleteEntry,
  highlightEntryId,
  onClearHighlight,
  extraContent = null,
  preContent = null,
  entryTypes: entryTypesProp,
  noteFormFirst = false,
}) {
  const entryTypes = entryTypesProp || DEFAULT_ENTRY_TYPES;

  const [staff, setStaff] = useState('');
  const [note, setNote] = useState('');
  const [entryType, setEntryType] = useState('Assessment');
  const [entryRag, setEntryRag] = useState(status);   // per-entry RAG rating
  const [sessionDate, setSessionDate] = useState(todayStr);
  const [flashId, setFlashId] = useState(null);
  const [fading, setFading] = useState(false);

  const config = RAG_CONFIG[status] || RAG_CONFIG.grey;

  // Scroll-to + highlight on demand from overview
  useEffect(() => {
    if (!highlightEntryId) return;

    setFlashId(highlightEntryId);
    setFading(false);

    // Scroll after current render cycle
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`entry-${highlightEntryId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Begin fade-out after short pause so the flash is noticeable
    const t1 = setTimeout(() => setFading(true), 400);
    // Clear after animation completes
    const t2 = setTimeout(() => {
      setFlashId(null);
      setFading(false);
      onClearHighlight?.();
    }, 2000);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [highlightEntryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (!staff.trim()) return;
    onAddEntry({ staff: staff.trim(), note: note.trim(), entryType, status: entryRag, sessionDate });
    setStaff('');
    setNote('');
    setEntryType('Assessment');
    setSessionDate(todayStr());
    // keep entryRag — practitioner's last rating is a sensible default for next entry
  };

  // Sort by session date (newest first) — supports manually back-dated entries
  const sorted = [...logEntries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recent = sorted.filter(e => within4Months(e.timestamp));
  const older  = sorted.filter(e => !within4Months(e.timestamp));

  // JSX blocks used in conditional order (noteFormFirst swaps history vs add-note)
  const historyBlock = (
    <div className="bg-white rounded-xl border border-gray-100 p-5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
        Notes Log
        {logEntries.length > 0 && (
          <span className="text-gray-400 font-normal ml-1.5">({logEntries.length})</span>
        )}
      </h2>

      {logEntries.length === 0 ? (
        <p className="text-xs text-gray-300 py-6 text-center">
          No entries yet. Add one using the form below.
        </p>
      ) : (
        <>
          {recent.length === 0 && (
            <p className="text-xs text-gray-400 italic mb-2">No entries in the last 4 months.</p>
          )}
          {recent.map(e => (
            <EntryRow key={e.id} entry={e} flashId={flashId} fading={fading} onDelete={onDeleteEntry} />
          ))}
          {older.length > 0 && <Divider />}
          {older.map(e => (
            <EntryRow key={e.id} entry={e} flashId={flashId} fading={fading} onDelete={onDeleteEntry} />
          ))}
        </>
      )}
    </div>
  );

  const addNoteBlock = (
    <div className="bg-white rounded-xl border border-gray-100 p-5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Add Note</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Session Date
            </label>
            <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': '#A58D69' }} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Your Name *
            </label>
            <input type="text" value={staff} onChange={e => setStaff(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. James Whitfield"
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': '#A58D69' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 items-start">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Session Rating
            </label>
            <div className="flex gap-1 flex-wrap">
              {RAG_OPTIONS.map(opt => {
                const c = RAG_CONFIG[opt];
                const isActive = entryRag === opt;
                return (
                  <button key={opt} onClick={() => setEntryRag(opt)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium border transition-all"
                    style={{
                      backgroundColor: isActive ? c.bgColor : 'transparent',
                      borderColor:     isActive ? c.bgColor : '#e5e7eb',
                      color:           isActive ? c.textColor : '#9ca3af',
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Entry Type
            </label>
            <select value={entryType} onChange={e => setEntryType(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none bg-white">
              {entryTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Notes
          </label>
          <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Record observations, interventions, or context…"
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 placeholder-gray-300 bg-white"
            style={{ '--tw-ring-color': '#A58D69' }} />
        </div>
        <button onClick={handleSave} disabled={!staff.trim()}
          className="px-4 py-2 text-xs font-semibold text-white rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: '#A58D69' }}>
          Save Note
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Title + RAG selector — constrained ── */}
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{label}</h1>
          <p className="text-xs text-gray-400 mt-0.5">RAG pillar · source of truth for this domain</p>
        </div>

        {/* RAG Selector */}
        <div className="bg-white rounded-xl border border-gray-100 p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Status</h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded"
              style={{ backgroundColor: config.bgColor, color: config.textColor }}>
              {config.label}
            </span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed mb-4">{config.meaning}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {RAG_OPTIONS.map(opt => {
              const c = RAG_CONFIG[opt];
              const isActive = opt === status;
              return (
                <button key={opt} onClick={() => onStatusChange(opt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all border"
                  style={{
                    backgroundColor: isActive ? c.bgColor : 'transparent',
                    borderColor: isActive ? c.bgColor : '#e5e7eb',
                    color: isActive ? c.textColor : '#6b7280',
                  }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 mt-3 italic">
            Updates automatically on the athlete overview. Cannot be edited there.
          </p>
        </div>
      </div>

      {/* ── Domain-specific content above notes log (e.g. ACSI-28 + Working On) ── */}
      {preContent}

      {/* ── Notes log (add note + full history) — constrained ── */}
      <div className="space-y-6 max-w-2xl">
        {noteFormFirst ? (
          <>{addNoteBlock}{historyBlock}</>
        ) : (
          <>{historyBlock}{addNoteBlock}</>
        )}
      </div>{/* end notes log max-w-2xl */}

      {/* ── Domain-specific assessment data after notes log (e.g. nutrition tables) ── */}
      {extraContent && (
        <div>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">
              Assessment Data
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          {extraContent}
        </div>
      )}
    </div>
  );
}
