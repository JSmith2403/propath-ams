import { useMemo, useState } from 'react';
import {
  Bell, CalendarDays, CheckSquare, Circle, Clock, Dumbbell, Flame,
  Heart, Loader2, Plus, StickyNote, Trophy, TrendingUp, Users,
  UtensilsCrossed, Weight, X,
} from 'lucide-react';
import { useRecentUpdates } from '../../hooks/useRecentUpdates';

// Quick note-type identifier for the "+ Note" quick-add on a completed
// session — deliberately its own small taxonomy rather than reusing
// GoalsTab's DOMAIN_META (Physical/Psych/Nutrition/Lifestyle): this one
// needs "General" and "Physio", neither of which exist there, and has
// no use for Psych/Lifestyle. Physical/Nutritional reuse those pillars'
// existing colours for visual consistency where they do overlap.
const NOTE_TYPE_META = {
  general:     { label: 'General',     color: '#6b7280' },
  physical:    { label: 'Physical',    color: '#437E8D' },
  nutritional: { label: 'Nutritional', color: '#A58D69' },
  physio:      { label: 'Physio',      color: '#085777' },
};

const VIEW_MODE_KEY = 'updates:view_mode';
const readViewMode = () => {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(VIEW_MODE_KEY) : null;
    return v === 'time' ? 'time' : 'athlete';
  } catch { return 'athlete'; }
};
const persistViewMode = (mode) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch { /* ignore */ }
};

const RAG_COLOR = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444', grey: '#9ca3af' };

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function relTime(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - t) / 60_000);
  if (diffMin < 1)   return 'Just now';
  if (diffMin < 60)  return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 12)   return `${diffHr} h ago`;
  const d = new Date(iso);
  const today = new Date().toDateString();
  const yest  = new Date(); yest.setDate(yest.getDate() - 1);
  const timeStr = d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === today)          return `Today, ${timeStr}`;
  if (d.toDateString() === yest.toDateString()) return `Yesterday, ${timeStr}`;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * groupByAthlete — walk the flat updates list and produce one bucket
 * per athlete_id, ordered by "most recent activity within". Each
 * bucket keeps its own rows sorted newest-first.
 */
function groupByAthlete(updates, athleteById) {
  const buckets = new Map(); // athlete_id -> { athlete, rows, latest }
  for (const u of updates) {
    if (!u.athlete_id) continue;
    const existing = buckets.get(u.athlete_id);
    if (existing) {
      existing.rows.push(u);
      if ((u.timestamp || '') > (existing.latest || '')) existing.latest = u.timestamp;
    } else {
      buckets.set(u.athlete_id, {
        athlete: athleteById.get(u.athlete_id),
        rows:    [u],
        latest:  u.timestamp,
      });
    }
  }
  // Sort each bucket's rows newest-first, and the buckets themselves
  // by most-recent activity.
  const list = [...buckets.values()];
  for (const b of list) b.rows.sort((a, x) => (x.timestamp || '').localeCompare(a.timestamp || ''));
  list.sort((a, b) => (b.latest || '').localeCompare(a.latest || ''));
  return list;
}

function groupByDay(updates) {
  const today = new Date().toDateString();
  const yest  = new Date(); yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toDateString();
  const groups = [];
  let lastLabel = null;
  let bucket = null;
  for (const u of updates) {
    const d = new Date(u.timestamp);
    const label =
      d.toDateString() === today   ? 'Today'
      : d.toDateString() === yestStr ? 'Yesterday'
      : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
    if (label !== lastLabel) {
      bucket = { label, rows: [] };
      groups.push(bucket);
      lastLabel = label;
    }
    bucket.rows.push(u);
  }
  return groups;
}

/**
 * RecentUpdatesView — unified activity feed for the coach.
 *
 * Sources merged: completed physical dev sessions, wellness check-ins,
 * new e1RM PBs. Same component renders on both desktop (side by side
 * with the sidebar) and mobile (inside the bottom-nav flow).
 *
 * Per-row unseen indicator (small blue dot). Tap the dot alone to mark
 * that row read without navigating. Tap the row body to open the
 * athlete's profile — which auto-marks the row read. A "Mark all
 * read" button at the top clears every currently-visible row.
 */
export default function RecentUpdatesView({
  athletes = [], onNavigateToAthlete,
  onAddRagEntry, onAddPhysioEntry, onAddGeneralNote,
}) {
  const {
    updates, loading, error, refresh,
    isRead, markRead, markAllRead, unreadCount, maxAgeDays,
  } = useRecentUpdates();

  const [viewMode, setViewModeState] = useState(readViewMode);
  const setViewMode = (m) => { persistViewMode(m); setViewModeState(m); };

  // "New" filter — show only rows not yet acknowledged, so unseen
  // activity isn't buried among rows the coach has already read.
  const [unreadOnly, setUnreadOnly] = useState(false);

  // "+ Note" quick-add — which completed-session row the popup is open
  // for, { update, athlete } | null. A single modal instance at the top
  // level rather than per-row state, same pattern as the day/block
  // popovers elsewhere in the app.
  const [noteTarget, setNoteTarget] = useState(null);
  const openAddNote = (update, athlete) => setNoteTarget({ update, athlete });

  // Routes a quick note to wherever that type already lives: Physical/
  // Nutritional file into the same ragLog the Goals & Development notes
  // log reads, Physio writes straight into the Physio Portal tab's
  // own entry list (the explicit ask — so physio staff see it there
  // without any new plumbing on their side), General has no home of its
  // own yet so it's only visible back here on the session it came from.
  // Every note carries `sourceSession` so wherever it lands can show
  // which completed session it's about.
  const saveNote = (type, { staff, note }) => {
    if (!noteTarget) return;
    const { update, athlete } = noteTarget;
    if (!athlete) return;
    const sourceSession = {
      id: update.session_log_id,
      name: update.session_name,
      date: update.timestamp,
    };
    const dateOnly = (update.timestamp || new Date().toISOString()).slice(0, 10);

    if (type === 'physio') {
      onAddPhysioEntry?.(athlete.id, {
        date: dateOnly,
        assessor: staff,
        noteType: 'Session note',
        notes: note,
        sourceSession,
      });
    } else if (type === 'physical' || type === 'nutritional') {
      onAddRagEntry?.(athlete.id, type === 'physical' ? 'physical' : 'nutrition', {
        id: crypto.randomUUID(),
        timestamp: new Date(`${dateOnly}T12:00:00`).toISOString(),
        staff,
        status: 'grey',
        note,
        source: 'manual',
        entryType: 'General note',
        sourceSession,
      });
    } else {
      onAddGeneralNote?.(athlete.id, {
        timestamp: update.timestamp || new Date().toISOString(),
        staff,
        note,
        sourceSession,
      });
    }
    setNoteTarget(null);
  };

  const athleteById = useMemo(() => {
    const m = new Map();
    for (const a of athletes) m.set(a.id, a);
    return m;
  }, [athletes]);

  const visibleUpdates = useMemo(
    () => (unreadOnly ? updates.filter(u => !isRead(u)) : updates),
    [unreadOnly, updates, isRead],
  );

  const dayGroups = useMemo(
    () => (viewMode === 'time' ? groupByDay(visibleUpdates) : []),
    [viewMode, visibleUpdates],
  );
  const athleteBuckets = useMemo(
    () => (viewMode === 'athlete' ? groupByAthlete(visibleUpdates, athleteById) : []),
    [viewMode, visibleUpdates, athleteById],
  );

  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
      {/* Header — sticky so "Mark all read" is always reachable */}
      <div className="px-4 md:px-8 pt-6 pb-3 flex items-center gap-2 flex-wrap border-b border-ink-100 bg-white sticky top-0 z-10">
        <Bell size={18} className="shrink-0" style={{ color: '#A58D69' }} />
        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-2xl font-bold" style={{ color: '#1C1C1C' }}>
              Recent Updates
            </h1>
            {unreadCount > 0 && (
              <span
                className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: '#fff', backgroundColor: '#dc2626', minWidth: 20 }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-[11px] md:text-xs mt-0.5" style={{ color: '#6b7280' }}>
            Completed sessions, check-ins, new PBs — newest first.
          </p>
        </div>
        {/* View toggle: athlete vs time. Segmented control, persists
            per-device so the coach lands back on their preferred view. */}
        <div
          className="inline-flex rounded-md p-0.5 shrink-0"
          style={{ backgroundColor: '#f3f4f6' }}
        >
          <button
            onClick={() => setViewMode('athlete')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors"
            style={{
              color:            viewMode === 'athlete' ? '#1C1C1C' : '#6b7280',
              backgroundColor:  viewMode === 'athlete' ? '#fff' : 'transparent',
              boxShadow:        viewMode === 'athlete' ? '0 1px 2px rgba(0,0,0,0.06)' : undefined,
            }}
            title="Group by athlete"
          >
            <Users size={11} />
            <span className="text-[11px] font-semibold hidden sm:inline">By athlete</span>
          </button>
          <button
            onClick={() => setViewMode('time')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors"
            style={{
              color:            viewMode === 'time' ? '#1C1C1C' : '#6b7280',
              backgroundColor:  viewMode === 'time' ? '#fff' : 'transparent',
              boxShadow:        viewMode === 'time' ? '0 1px 2px rgba(0,0,0,0.06)' : undefined,
            }}
            title="Sort by time"
          >
            <CalendarDays size={11} />
            <span className="text-[11px] font-semibold hidden sm:inline">By time</span>
          </button>
        </div>

        {/* New-only filter — hides everything already acknowledged so
            unseen activity stands out on its own. */}
        <button
          onClick={() => setUnreadOnly(v => !v)}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
          style={unreadOnly
            ? { color: '#fff', border: '1px solid #A58D69', backgroundColor: '#A58D69' }
            : { color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
          title={unreadOnly ? 'Showing new only — tap to show everything' : 'Show only new (unread) updates'}
        >
          <Bell size={12} />
          <span className="hidden sm:inline">{unreadOnly ? 'Showing new' : 'New only'}</span>
          <span className="sm:hidden">New</span>
        </button>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
            style={{ color: '#A58D69', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
            title="Mark every visible row as read"
          >
            <CheckSquare size={12} />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">All read</span>
          </button>
        )}
        <button
          onClick={refresh}
          className="hidden md:inline-flex text-xs font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
          style={{ color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin" style={{ color: '#A58D69' }} />
        </div>
      )}

      {!loading && error && (
        <div className="px-4 py-10 text-center text-sm" style={{ color: '#b91c1c' }}>
          Couldn't load updates. {error.message}
        </div>
      )}

      {!loading && !error && updates.length === 0 && (
        <div className="px-4 py-16 text-center">
          <div
            className="mx-auto inline-flex items-center justify-center rounded-full mb-4"
            style={{ width: 48, height: 48, backgroundColor: 'rgba(165,141,105,0.12)' }}
          >
            <Bell size={20} style={{ color: '#A58D69' }} />
          </div>
          <div className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>
            Nothing yet
          </div>
          <div className="text-xs mt-1 max-w-xs mx-auto" style={{ color: '#9ca3af' }}>
            Completed sessions, wellness check-ins and new PBs will appear here as your athletes log them.
          </div>
        </div>
      )}

      {/* "New only" active but everything's been read — say so instead
          of rendering an unexplained blank feed. */}
      {!loading && !error && updates.length > 0 && visibleUpdates.length === 0 && (
        <div className="px-4 py-16 text-center">
          <div
            className="mx-auto inline-flex items-center justify-center rounded-full mb-4"
            style={{ width: 48, height: 48, backgroundColor: 'rgba(34,197,94,0.12)' }}
          >
            <CheckSquare size={20} style={{ color: '#16a34a' }} />
          </div>
          <div className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>
            All caught up
          </div>
          <div className="text-xs mt-1 max-w-xs mx-auto" style={{ color: '#9ca3af' }}>
            No new updates. Tap "Showing new" to see everything you've already read.
          </div>
        </div>
      )}

      {!loading && !error && updates.length > 0 && viewMode === 'athlete' && (
        <>
          {athleteBuckets.map(bucket => {
            const a       = bucket.athlete;
            const name    = a?.name || 'Unknown athlete';
            const unread  = bucket.rows.reduce((n, u) => n + (isRead(u) ? 0 : 1), 0);
            const sessionCount = bucket.rows.filter(u => u.type === 'session').length;
            return (
              <div key={bucket.athlete?.id || 'orphan'}>
                <div
                  className="flex items-center gap-3 px-4 md:px-8 py-3 sticky top-[76px] md:top-[92px] z-[5]"
                  style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}
                >
                  <div
                    className="shrink-0 relative rounded-full overflow-hidden"
                    style={{ width: 36, height: 36, backgroundColor: '#085777' }}
                  >
                    {a?.photo ? (
                      <img
                        src={a.photo}
                        alt={name}
                        className="w-full h-full"
                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ fontSize: 12 }}>
                        {initials(name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold" style={{ color: '#1C1C1C' }}>{name}</div>
                    <div className="text-[10px]" style={{ color: '#9ca3af' }}>
                      {bucket.rows.length} update{bucket.rows.length === 1 ? '' : 's'}
                      {sessionCount > 0 && ` · ${sessionCount} session${sessionCount === 1 ? '' : 's'} complete`}
                    </div>
                  </div>
                  {unread > 0 && (
                    <span
                      className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: '#fff', backgroundColor: '#3b82f6', minWidth: 20 }}
                    >
                      {unread}
                    </span>
                  )}
                </div>
                <div>
                  {bucket.rows.map(u => (
                    <UpdateRow
                      key={u.id}
                      update={u}
                      athlete={athleteById.get(u.athlete_id)}
                      read={isRead(u)}
                      hideAvatar
                      onMarkRead={() => markRead(u)}
                      onOpen={() => {
                        markRead(u);
                        if (onNavigateToAthlete && athleteById.has(u.athlete_id)) {
                          onNavigateToAthlete(u.athlete_id);
                        }
                      }}
                      onOpenAddNote={openAddNote}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="px-4 md:px-8 py-6 text-center text-[10px]" style={{ color: '#9ca3af' }}>
            Showing the last {maxAgeDays} days · older activity rolls off the feed automatically.
          </div>
        </>
      )}

      {!loading && !error && updates.length > 0 && viewMode === 'time' && (
        <>
          {dayGroups.map(group => (
            <div key={group.label}>
              <div
                className="px-4 md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest sticky top-[76px] md:top-[92px] z-[5]"
                style={{ color: '#9ca3af', backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}
              >
                {group.label}
              </div>
              <div>
                {group.rows.map(u => (
                  <UpdateRow
                    key={u.id}
                    update={u}
                    athlete={athleteById.get(u.athlete_id)}
                    read={isRead(u)}
                    onMarkRead={() => markRead(u)}
                    onOpen={() => {
                      markRead(u);
                      if (onNavigateToAthlete && athleteById.has(u.athlete_id)) {
                        onNavigateToAthlete(u.athlete_id);
                      }
                    }}
                    onOpenAddNote={openAddNote}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="px-4 md:px-8 py-6 text-center text-[10px]" style={{ color: '#9ca3af' }}>
            Showing the last {maxAgeDays} days · older activity rolls off the feed automatically.
          </div>
        </>
      )}

      {noteTarget && (
        <AddSessionNoteModal
          athleteName={noteTarget.athlete?.name}
          sessionName={noteTarget.update.session_name}
          sessionDate={noteTarget.update.timestamp}
          onSave={saveNote}
          onClose={() => setNoteTarget(null)}
        />
      )}
    </div>
  );
}

// ── UpdateRow ────────────────────────────────────────────────────────
function UpdateRow({ update, athlete, read, onMarkRead, onOpen, onOpenAddNote, hideAvatar = false }) {
  const name = athlete?.name || 'Unknown athlete';
  const clickable = !!athlete;
  const typeMeta = renderTypeMeta(update, athlete, onOpenAddNote);

  return (
    <div
      onClick={() => clickable && onOpen()}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : -1}
      className={`flex items-start gap-3 px-4 md:px-8 py-3 border-b border-ink-100 transition-colors ${
        clickable ? 'cursor-pointer active:bg-gold-50/40 hover:bg-gray-50' : ''
      }`}
      style={{ backgroundColor: read ? undefined : 'rgba(59,130,246,0.03)' }}
    >
      {/* Unseen dot / marker — tap toggles read without navigating.
          When read, a subtle empty circle occupies the same slot so
          the row layout never jumps. */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); if (!read) onMarkRead(); }}
        aria-label={read ? 'Read' : 'Mark as read'}
        className="shrink-0 mt-2.5 flex items-center justify-center"
        style={{ width: 12, height: 12 }}
      >
        {read ? (
          <Circle size={8} style={{ color: '#e5e7eb' }} />
        ) : (
          <span
            className="inline-block rounded-full"
            style={{ width: 9, height: 9, backgroundColor: '#3b82f6' }}
          />
        )}
      </button>

      {/* When inside an athlete-grouped section, show a standalone
          type-badge (parent header already carries the avatar). In
          the time-grouped view show the avatar with a smaller type
          badge overlapping the bottom-right corner. Both paths give
          the type a distinct, coloured circular chip so sessions,
          wellness, PBs and meals are visually distinct at a glance. */}
      {hideAvatar ? (
        <div className="shrink-0 mt-1">
          <TypeBadge update={update} size={28} />
        </div>
      ) : (
        <div className="shrink-0 relative mt-0.5" style={{ width: 40, height: 40 }}>
          {/* Clip only the photo — the corner badge sits outside the
              circle, so overflow-hidden here would slice it in half. */}
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{ backgroundColor: '#085777' }}
          >
            {athlete?.photo ? (
              <img
                src={athlete.photo}
                alt={name}
                className="w-full h-full"
                style={{ objectFit: 'cover', objectPosition: 'top center' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ fontSize: 13 }}>
                {initials(name)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <TypeBadge update={update} size={20} />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] leading-snug ${read ? 'font-normal' : 'font-medium'}`} style={{ color: '#1C1C1C' }}>
          {!hideAvatar && <span className="font-bold">{name}</span>}{!hideAvatar && ' '}{typeMeta.headline}
        </div>
        {typeMeta.chips && (
          <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap" style={{ color: '#6b7280' }}>
            {typeMeta.chips}
            <span className="ml-auto">{relTime(update.timestamp)}</span>
          </div>
        )}
        {!typeMeta.chips && (
          <div className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
            {relTime(update.timestamp)}
          </div>
        )}
        {typeMeta.summary}
      </div>
    </div>
  );
}

// ── Type renderers ───────────────────────────────────────────────────
// Each event type has its own icon + accent colour. Sizes tuned so the
// per-avatar corner badge (20px) and the standalone chip (28px) both
// read clearly at a glance without competing with the athlete photo.
const TYPE_STYLES = {
  session:  { icon: Dumbbell,         fg: '#fff', bg: '#16a34a' }, // green
  wellness: { icon: Heart,            fg: '#fff', bg: '#dc2626' }, // red (overridden by RAG)
  pb:       { icon: TrendingUp,       fg: '#fff', bg: '#A58D69' }, // gold
  meal:     { icon: UtensilsCrossed,  fg: '#fff', bg: '#f97316' }, // orange
};

function TypeBadge({ update, size = 20 }) {
  const style = TYPE_STYLES[update.type] || TYPE_STYLES.session;
  const Icon  = style.icon;
  // Wellness badge takes its colour from the athlete's RAG so a red
  // check-in visually screams before the coach reads the row text.
  const bg = update.type === 'wellness'
    ? (RAG_COLOR[update.rag] || RAG_COLOR.grey)
    : style.bg;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: size, height: size,
        backgroundColor: bg,
        boxShadow: '0 0 0 2px #fff',
      }}
    >
      <Icon size={Math.round(size * 0.55)} strokeWidth={2.5} style={{ color: style.fg }} />
    </span>
  );
}

function capitalise(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// Format kilograms with a thousands separator: 2450 → "2,450 kg"
function fmtKg(n) {
  if (n == null || n === 0 || Number.isNaN(n)) return null;
  return `${Math.round(n).toLocaleString('en-GB')} kg`;
}

/**
 * Every note linked to this session, across every store it could have
 * landed in — Physical/Nutritional file into the same ragLog Goals &
 * Development reads, Physio into phase2.physio.entries, General has no
 * other home. Matched on sourceSession.id === this session's log id.
 * Cheap enough to just recompute per render — these lists are small.
 */
function findSessionNotes(athlete, sessionLogId) {
  if (!athlete || !sessionLogId) return [];
  const out = [];
  (athlete.ragLog?.physical || []).forEach(n => {
    if (n.sourceSession?.id === sessionLogId) out.push({ id: n.id, type: 'physical', staff: n.staff, note: n.note, timestamp: n.timestamp });
  });
  (athlete.ragLog?.nutrition || []).forEach(n => {
    if (n.sourceSession?.id === sessionLogId) out.push({ id: n.id, type: 'nutritional', staff: n.staff, note: n.note, timestamp: n.timestamp });
  });
  (athlete.phase2?.physio?.entries || []).forEach(n => {
    if (n.sourceSession?.id === sessionLogId) out.push({ id: n.id, type: 'physio', staff: n.assessor, note: n.notes, timestamp: n.date });
  });
  (athlete.phase2?.generalNotes || []).forEach(n => {
    if (n.sourceSession?.id === sessionLogId) out.push({ id: n.id, type: 'general', staff: n.staff, note: n.note, timestamp: n.timestamp });
  });
  return out.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
}

/**
 * SessionSummary — rich stats card that sits under the session
 * headline. Mirrors the post-session summary the athlete sees when
 * they finish a workout: duration, RPE, total load lifted, and any
 * PBs set during the session. Fields drop out when unavailable so
 * a lift-only session (no PBs) doesn't render an awkward zero chip.
 *
 * Also hosts the "+ Note" quick-add — any notes already linked to this
 * session (tagged General/Physical/Nutritional/Physio) render inline,
 * and Physio-tagged ones are simultaneously visible in that athlete's
 * Physio Portal tab (see saveNote in the parent).
 */
function SessionSummary({ update, athlete, onOpenAddNote }) {
  const stats = [];
  if (update.duration_min != null) stats.push({ Icon: Clock, label: `${update.duration_min} min` });
  if (update.total_rpe != null)     stats.push({ Icon: Flame, label: `RPE ${update.total_rpe}` });
  const loadLabel = fmtKg(update.total_load_kg);
  if (loadLabel)                    stats.push({ Icon: Weight, label: loadLabel });
  if (update.pb_count > 0)          stats.push({ Icon: Trophy, label: `${update.pb_count} PB${update.pb_count === 1 ? '' : 's'}`, gold: true });

  const linkedNotes = findSessionNotes(athlete, update.session_log_id);

  if (!stats.length && !update.pb_exercises?.length && !linkedNotes.length && !onOpenAddNote) return null;

  return (
    <div className="mt-2">
      {(stats.length > 0 || update.pb_exercises?.length > 0) && (
        <>
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 rounded-md"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f3f4f6' }}
          >
            {stats.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: s.gold ? '#A58D69' : '#1C1C1C' }}
              >
                <s.Icon size={12} style={{ color: s.gold ? '#A58D69' : '#6b7280' }} />
                {s.label}
              </span>
            ))}
          </div>
          {update.pb_exercises?.length > 0 && (
            <div className="px-3 pt-1.5 text-[10px]" style={{ color: '#A58D69' }}>
              🏆 New PB: <span className="font-semibold">{update.pb_exercises.join(' · ')}</span>
            </div>
          )}
        </>
      )}

      {linkedNotes.length > 0 && (
        <div className="mt-1.5 space-y-1">
          {linkedNotes.map(n => {
            const meta = NOTE_TYPE_META[n.type] || NOTE_TYPE_META.general;
            return (
              <div
                key={n.id}
                className="flex items-start gap-2 px-3 py-1.5 rounded-md"
                style={{ backgroundColor: `${meta.color}0d`, border: `1px solid ${meta.color}33` }}
              >
                <span
                  className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5"
                  style={{ color: meta.color, backgroundColor: `${meta.color}1a` }}
                >
                  {meta.label}
                </span>
                <p className="text-[11px] text-gray-600 leading-snug flex-1 min-w-0">
                  {n.note || <span className="italic text-gray-300">No note text.</span>}
                  {n.staff && <span className="text-gray-400"> — {n.staff}</span>}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {onOpenAddNote && (
        <button
          onClick={(e) => { e.stopPropagation(); onOpenAddNote(update, athlete); }}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: '#A58D69' }}
        >
          <Plus size={11} /> Note
        </button>
      )}
    </div>
  );
}

function renderTypeMeta(u, athlete, onOpenAddNote) {
  switch (u.type) {
    case 'session':
      return {
        badge: <TypeBadge update={u} size={20} />,
        headline: <>
          completed a{' '}
          <span className="font-semibold" style={{ color: '#A58D69' }}>Physical Development Session</span>
          {u.session_name && u.session_name !== 'Session' && (
            <> — <span className="font-semibold" style={{ color: '#1C1C1C' }}>{u.session_name}</span></>
          )}
        </>,
        chips: null,   // rendered below as a richer stats strip
        summary: <SessionSummary update={u} athlete={athlete} onOpenAddNote={onOpenAddNote} />,
      };

    case 'wellness':
      return {
        badge: <TypeBadge update={u} size={20} />,
        headline: <>submitted a <span className="font-semibold" style={{ color: '#A58D69' }}>wellness check-in</span></>,
        chips: <>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
            style={{
              color:            RAG_COLOR[u.rag] || RAG_COLOR.grey,
              backgroundColor: `${RAG_COLOR[u.rag] || RAG_COLOR.grey}20`,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {u.rag === 'green' ? 'Good' : u.rag === 'amber' ? 'Watch' : u.rag === 'red' ? 'Flagged' : 'Logged'}
          </span>
          {u.scores?.sleep_quality != null && (
            <span>Sleep {u.scores.sleep_quality}/10</span>
          )}
          {u.scores?.fatigue != null && (
            <span>Fatigue {u.scores.fatigue}/10</span>
          )}
        </>,
      };

    case 'pb':
      return {
        badge: <TypeBadge update={u} size={20} />,
        headline: <>hit a new PB on <span className="font-semibold" style={{ color: '#A58D69' }}>{u.exercise_name}</span></>,
        chips: <>
          {u.e1rm_kg != null && (
            <span className="inline-flex items-center gap-1 font-bold tabular-nums" style={{ color: '#A58D69' }}>
              e1RM {u.e1rm_kg}kg
            </span>
          )}
        </>,
      };

    case 'meal':
      return {
        badge: <TypeBadge update={u} size={20} />,
        headline: <>logged <span className="font-semibold" style={{ color: '#A58D69' }}>{capitalise(u.meal_type) || 'a meal'}</span></>,
        chips: <>
          {u.description && (
            <span className="truncate max-w-[260px] italic" title={u.description}>
              {u.description}
            </span>
          )}
        </>,
      };

    default:
      return { badge: null, headline: 'logged activity', chips: null };
  }
}

// ── Add-note modal — quick-add from a completed session ────────────────
// Type picked here decides where the note actually gets stored (see
// saveNote above): Physio lands directly in that athlete's Physio
// Assessment entries, Physical/Nutritional in the shared notes log
// Goals & Development reads, General only lives here on the session.
function AddSessionNoteModal({ athleteName, sessionName, sessionDate, onSave, onClose }) {
  const [type, setType]   = useState('general');
  const [staff, setStaff] = useState('');
  const [note, setNote]   = useState('');

  const canSave = staff.trim() && note.trim();
  const submit = () => {
    if (!canSave) return;
    onSave(type, { staff: staff.trim(), note: note.trim() });
  };

  const dateLabel = sessionDate
    ? new Date(sessionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div className="bg-white rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <StickyNote size={14} style={{ color: '#A58D69' }} /> Add note
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {athleteName}{sessionName ? ` · ${sessionName}` : ''}{dateLabel ? ` · ${dateLabel}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(NOTE_TYPE_META).map(([key, meta]) => {
                const active = type === key;
                return (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className="py-1.5 rounded text-[11px] font-semibold border transition-colors"
                    style={{
                      backgroundColor: active ? `${meta.color}1a` : 'transparent',
                      borderColor: active ? meta.color : '#e5e7eb',
                      color: active ? meta.color : '#6b7280',
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            {type === 'physio' && (
              <p className="text-[10px] text-gray-400 mt-1.5">
                Saved straight into this athlete's Physio Portal tab.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Your name *</label>
            <input
              type="text"
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
              placeholder="e.g. James Whitfield"
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Note *</label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record observations, interventions, or context..."
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none bg-white"
            />
          </div>

          <button
            onClick={submit}
            disabled={!canSave}
            className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40"
            style={{ backgroundColor: '#A58D69' }}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
