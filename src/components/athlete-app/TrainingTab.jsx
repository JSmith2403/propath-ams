import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePlannedWeekDetail } from '../../hooks/usePlannedWeekDetail';
import { getDailyQuote } from '../../utils/dailyQuote';
import SessionCard from './SessionCard';
import SessionLogger from './SessionLogger';
import WellnessInline from './WellnessInline';
import MoveSessionModal from './MoveSessionModal';
import ResourcesTab from './ResourcesTab';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfWeek(d) {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - dow);
  return x;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function toISO(d) { return d.toLocaleDateString('en-CA'); }
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TrainingTab({ athleteId, athleteName, scrollToResourcesNonce = 0 }) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selectedISO, setSelectedISO] = useState(toISO(today));
  const resourcesRef = useRef(null);

  // When the bottom-nav Resources button bumps the nonce, scroll the
  // anchor into view. Skip on first mount (nonce starts at 0).
  useEffect(() => {
    if (!scrollToResourcesNonce) return;
    const node = resourcesRef.current;
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToResourcesNonce]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const fromISO = toISO(weekStart);
  const toISOEnd = toISO(addDays(weekStart, 6));

  const { planned, loading } = usePlannedWeekDetail(athleteId, fromISO, toISOEnd);

  // Active session-logger overlay (one at a time)
  const [activeLogger, setActiveLogger]   = useState(null);
  // Move-to-today confirmation. Set to the session pending the move.
  const [pendingMove,   setPendingMove]   = useState(null);
  const [moveSubmitting, setMoveSubmitting] = useState(false);

  // Athlete's local "today" used for the move check.
  const todayISO = toISO(today);

  // Intercept session-start. If the session's planned_date isn't today,
  // open the confirmation modal first; otherwise launch the logger.
  const handleStart = (session) => {
    if (session.planned_date === todayISO) {
      setActiveLogger(session);
    } else {
      setPendingMove(session);
    }
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;
    setMoveSubmitting(true);
    // Preserve the original_date the first time the session is moved
    // so the audit trail survives subsequent moves.
    const patch = {
      planned_date: todayISO,
      original_date: pendingMove.original_date || pendingMove.planned_date,
      moved_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('planned_sessions')
      .update(patch)
      .eq('id', pendingMove.id);
    setMoveSubmitting(false);
    if (error) {
      console.error('[move session] failed', error);
      alert('Could not move the session: ' + error.message);
      return;
    }
    // Optimistically launch the logger with the moved session date.
    const moved = { ...pendingMove, ...patch };
    setPendingMove(null);
    setActiveLogger(moved);
    setLogTick(t => t + 1); // refresh week view
  };

  // Track which planned_sessions are completed so the card can switch
  // its CTA to a green "logged" badge.
  const [completedIds, setCompletedIds] = useState(new Set());
  const [logTick, setLogTick] = useState(0);

  useEffect(() => {
    if (!planned.length) { setCompletedIds(new Set()); return; }
    const ids = planned.map(p => p.id);
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('session_logs')
        .select('planned_session_id, completed_at')
        .in('planned_session_id', ids)
        .not('completed_at', 'is', null);
      if (cancelled) return;
      setCompletedIds(new Set((data || []).map(d => d.planned_session_id)));
    })();
    return () => { cancelled = true; };
  }, [planned, logTick]);

  const sessionsByDate = useMemo(() => {
    const map = {};
    for (const p of planned) (map[p.planned_date] ||= []).push(p);
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => (a.session_order ?? 0) - (b.session_order ?? 0))
    );
    return map;
  }, [planned]);

  const selectedDate = new Date(selectedISO + 'T00:00:00');
  const isToday = sameDay(selectedDate, today);
  const selectedSessions = sessionsByDate[selectedISO] || [];
  const quote = useMemo(() => getDailyQuote(today), [today.toDateString()]);
  const firstName = (athleteName || '').split(' ')[0] || 'there';

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* ── 1. Week selector ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStart(s => addDays(s, -7))}
          className="w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-all bg-white border border-ink-200 text-ink-600 hover:text-gold-600"
          aria-label="Previous week"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-micro font-bold uppercase text-ink-400">This Week</p>
          <p className="text-body font-semibold text-ink-900">
            {weekStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setWeekStart(s => addDays(s, 7))}
          className="w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-all bg-white border border-ink-200 text-ink-600 hover:text-gold-600"
          aria-label="Next week"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Day strip ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5">
        {days.map((d, i) => {
          const iso = toISO(d);
          const sessionCount = (sessionsByDate[iso] || []).length;
          const isSelected = iso === selectedISO;
          const cellIsToday = sameDay(d, today);
          return (
            <button
              key={iso}
              onClick={() => setSelectedISO(iso)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-gold-500 border-gold-500'
                  : 'bg-white border-ink-200 hover:border-gold-400'
              }`}
              style={{ minHeight: 64 }}
            >
              <span className={`text-micro font-bold uppercase ${
                isSelected ? 'text-white' : 'text-ink-400'
              }`}>
                {DAY_LABELS[i]}
              </span>
              <span className={`text-body font-bold mt-0.5 ${
                isSelected ? 'text-white' : cellIsToday ? 'text-gold-600' : 'text-ink-900'
              }`}>
                {d.getDate()}
              </span>
              <div className="flex gap-0.5 mt-1 h-1">
                {Array.from({ length: sessionCount }).map((_, j) => (
                  <span key={j} className={`w-1 h-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-gold-500'
                  }`} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 2. Welcome + daily quote ────────────────────────────────────────── */}
      <div className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
        <p className="text-meta font-semibold text-gold-600 mb-0.5">
          {isToday ? 'Welcome back,' : 'Looking ahead,'}
        </p>
        <p className="text-h2 leading-tight text-ink-900">{firstName}</p>
        <div className="mt-3 pt-3 border-t border-ink-100">
          <p className="text-meta italic leading-snug text-ink-700">
            “{quote.text}”
          </p>
          <p className="text-micro mt-1.5 uppercase font-bold text-ink-400">
            — {quote.author}
          </p>
        </div>
      </div>

      {/* ── 3. Wellness CTA ─────────────────────────────────────────────────── */}
      <WellnessInline athleteId={athleteId} dateISO={selectedISO} />

      {/* ── 4. Session list ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 rounded-full border-4 animate-spin"
            style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
        </div>
      ) : selectedSessions.length === 0 ? (
        <div className="rounded-xl p-6 text-center bg-white border border-ink-100 shadow-card">
          <p className="text-body font-semibold text-ink-800">Rest day</p>
          <p className="text-meta mt-1.5 leading-relaxed text-ink-500">
            Focus on hydration, sleep, and mobility. The work you do off the floor counts too.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedSessions.map((s, i) => (
            <SessionCard
              key={s.id}
              session={s}
              index={i}
              defaultOpen={selectedSessions.length === 1}
              isCompleted={completedIds.has(s.id)}
              onStart={handleStart}
            />
          ))}
        </div>
      )}

      {/* ── Resources section — anchor for the bottom-nav scroll shortcut.
            Renders the same coach-authored content that used to live in
            its own tab; embedding here keeps the athlete on the home
            screen instead of losing the day they were looking at. */}
      <div ref={resourcesRef} id="resources" className="-mx-4 mt-6 pt-2 border-t border-ink-100">
        <ResourcesTab />
      </div>

      {/* Session logger overlay */}
      {activeLogger && (
        <SessionLogger
          session={activeLogger}
          athleteId={athleteId}
          onClose={(didFinish) => {
            setActiveLogger(null);
            if (didFinish) setLogTick(t => t + 1);
          }}
        />
      )}

      {/* Move-to-today confirmation */}
      {pendingMove && (
        <MoveSessionModal
          session={pendingMove}
          submitting={moveSubmitting}
          onConfirm={handleConfirmMove}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </div>
  );
}
