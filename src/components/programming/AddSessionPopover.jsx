import { useEffect, useRef, useState } from 'react';
import { Plus, X, Loader2, FilePlus } from 'lucide-react';
import {
  listAddableSessionsForDate,
  createPlannedSession,
} from '../../hooks/usePlannedSessionMutations';

/**
 * AddSessionPopover — anchored popover that lists every block_session
 * template available to the athlete on `targetDateISO`, grouped by
 * block. Tap a template → inserts a planned_sessions row → onAdded()
 * fires so the parent can refresh its week view.
 *
 * The empty-day "+ Add session" hint inside AthleteWeekViewV2 opens
 * this. Renders as fixed-position overlay anchored to a screen rect
 * the parent provides (anchorRect) — keeps the popover next to the
 * day the coach clicked even if the grid scrolls under it.
 *
 * Props:
 *   athleteId       — required, scopes the block lookup
 *   targetDateISO   — required, the day the session will land on
 *   anchorRect      — DOMRect-shape { left, top, right, bottom } from
 *                      getBoundingClientRect() of the trigger element
 *   onClose         — close handler (X button, outside click, esc)
 *   onAdded         — fires with the new planned_session row on success
 */
export default function AddSessionPopover({
  athleteId, targetDateISO, anchorRect, onClose, onAdded,
}) {
  const [loading, setLoading] = useState(true);
  const [groups,  setGroups]  = useState([]);
  const [error,   setError]   = useState(null);
  const [busy,    setBusy]    = useState(false);

  const ref = useRef(null);

  // Load templates for this date
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await listAddableSessionsForDate(athleteId, targetDateISO);
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error?.message || 'Could not load session templates.');
        setGroups([]);
      } else {
        setError(null);
        setGroups(res.groups);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, targetDateISO]);

  // Outside click / escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose && onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  const handlePick = async (block, session) => {
    setBusy(true);
    const res = await createPlannedSession({
      athleteId,
      blockId:        block.id,
      blockSessionId: session.id,
      plannedDateISO: targetDateISO,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error?.message || 'Could not add session.');
      return;
    }
    onAdded && onAdded(res.data);
    onClose && onClose();
  };

  // Position: prefer below the anchor, flip above if not enough room.
  // Anchor rect is in viewport coordinates → we render as fixed.
  const POP_W = 280, POP_H = 320;
  const margin = 8;
  let left = (anchorRect?.left ?? 0);
  let top  = (anchorRect?.bottom ?? 0) + margin;
  if (typeof window !== 'undefined') {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (left + POP_W > vw - 8) left = vw - POP_W - 8;
    if (left < 8) left = 8;
    if (top + POP_H > vh - 8) {
      // flip above
      top = (anchorRect?.top ?? 0) - POP_H - margin;
      if (top < 8) top = 8;
    }
  }

  const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <div
      ref={ref}
      className="fixed z-50 rounded-xl bg-white shadow-2xl flex flex-col"
      style={{
        left, top, width: POP_W, maxHeight: POP_H,
        border: '1px solid #e5e7eb',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <FilePlus size={14} style={{ color: '#A58D69' }} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold" style={{ color: '#1C1C1C' }}>
            Add session
          </div>
          <div className="text-[10px]" style={{ color: '#9ca3af' }}>
            {fmtDate(targetDateISO)}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={12} style={{ color: '#9ca3af' }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={16} className="animate-spin" style={{ color: '#A58D69' }} />
          </div>
        )}

        {!loading && error && (
          <div className="px-3 py-3 text-[11px]" style={{ color: '#b91c1c' }}>
            {error}
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="px-3 py-6 text-center">
            <div className="text-[11px] font-semibold mb-1" style={{ color: '#6b7280' }}>
              No block covers this date
            </div>
            <div className="text-[10px]" style={{ color: '#9ca3af' }}>
              Add a training block first that spans this day,
              then come back to drop sessions onto it.
            </div>
          </div>
        )}

        {!loading && !error && groups.map(group => (
          <div key={group.block.id} className="mb-1">
            <div
              className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest"
              style={{ color: '#9ca3af' }}
            >
              {group.block.block_name}
            </div>
            {group.sessions.length === 0 && (
              <div className="px-3 py-2 text-[10px] italic" style={{ color: '#9ca3af' }}>
                This block has no sessions defined yet.
              </div>
            )}
            {group.sessions.map(s => (
              <button
                key={s.id}
                onClick={() => handlePick(group.block, s)}
                disabled={busy}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gold-50 transition-colors disabled:opacity-50"
              >
                <Plus size={11} style={{ color: '#A58D69' }} />
                <span className="flex-1 text-[11px] font-semibold truncate" style={{ color: '#1C1C1C' }}>
                  {s.session_name || `Session ${(s.session_order ?? 0) + 1}`}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
