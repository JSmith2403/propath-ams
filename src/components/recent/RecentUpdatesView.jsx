import { useMemo, useState } from 'react';
import {
  Bell, CalendarDays, CheckSquare, Circle, Clock, Dumbbell, Flame,
  Heart, Loader2, TrendingUp, Users, UtensilsCrossed,
} from 'lucide-react';
import { useRecentUpdates } from '../../hooks/useRecentUpdates';

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
export default function RecentUpdatesView({ athletes = [], onNavigateToAthlete }) {
  const {
    updates, loading, error, refresh,
    isRead, markRead, markAllRead, unreadCount, maxAgeDays,
  } = useRecentUpdates();

  const [viewMode, setViewModeState] = useState(readViewMode);
  const setViewMode = (m) => { persistViewMode(m); setViewModeState(m); };

  const athleteById = useMemo(() => {
    const m = new Map();
    for (const a of athletes) m.set(a.id, a);
    return m;
  }, [athletes]);

  const dayGroups = useMemo(
    () => (viewMode === 'time' ? groupByDay(updates) : []),
    [viewMode, updates],
  );
  const athleteBuckets = useMemo(
    () => (viewMode === 'athlete' ? groupByAthlete(updates, athleteById) : []),
    [viewMode, updates, athleteById],
  );

  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
      {/* Header — sticky so "Mark all read" is always reachable */}
      <div className="px-4 md:px-8 pt-6 pb-3 flex items-center gap-2 border-b border-ink-100 bg-white sticky top-0 z-10">
        <Bell size={18} style={{ color: '#A58D69' }} />
        <div className="flex-1 min-w-0">
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
          className="inline-flex rounded-md p-0.5"
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

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
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
          className="hidden md:inline-flex text-xs font-semibold px-3 py-1.5 rounded transition-colors"
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
    </div>
  );
}

// ── UpdateRow ────────────────────────────────────────────────────────
function UpdateRow({ update, athlete, read, onMarkRead, onOpen, hideAvatar = false }) {
  const name = athlete?.name || 'Unknown athlete';
  const clickable = !!athlete;
  const typeMeta = renderTypeMeta(update);

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
        <div
          className="shrink-0 relative rounded-full overflow-hidden mt-0.5"
          style={{ width: 40, height: 40, backgroundColor: '#085777' }}
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
        <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap" style={{ color: '#6b7280' }}>
          {typeMeta.chips}
          <span className="ml-auto">{relTime(update.timestamp)}</span>
        </div>
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

function renderTypeMeta(u) {
  switch (u.type) {
    case 'session':
      return {
        badge: <TypeBadge update={u} size={20} />,
        // Two-part headline so the coach can see at a glance the
        // category (Physical Development Session) AND the specific
        // template (Session 1 / Optional Uppers · PM / etc.). The
        // generic "Session" fallback still reads clearly when the
        // block_session pointer is missing.
        headline: <>
          completed a{' '}
          <span className="font-semibold" style={{ color: '#A58D69' }}>Physical Development Session</span>
          {u.session_name && u.session_name !== 'Session' && (
            <> — <span className="font-semibold" style={{ color: '#1C1C1C' }}>{u.session_name}</span></>
          )}
        </>,
        chips: <>
          {u.duration_min != null && (
            <span className="inline-flex items-center gap-1">
              <Clock size={10} /> {u.duration_min} min
            </span>
          )}
          {u.total_rpe != null && (
            <span className="inline-flex items-center gap-1">
              <Flame size={10} /> RPE {u.total_rpe}
            </span>
          )}
        </>,
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
