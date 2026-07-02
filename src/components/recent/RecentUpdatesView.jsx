import { useMemo } from 'react';
import {
  Bell, CheckCircle2, CheckSquare, Circle, Clock, Flame, Heart,
  Loader2, TrendingUp,
} from 'lucide-react';
import { useRecentUpdates } from '../../hooks/useRecentUpdates';

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

  const athleteById = useMemo(() => {
    const m = new Map();
    for (const a of athletes) m.set(a.id, a);
    return m;
  }, [athletes]);

  const groups = useMemo(() => groupByDay(updates), [updates]);

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

      {!loading && !error && updates.length > 0 && (
        <>
          {groups.map(group => (
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
function UpdateRow({ update, athlete, read, onMarkRead, onOpen }) {
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

      {/* Avatar with type-badge on the bottom-right */}
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
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
          style={{ width: 16, height: 16, backgroundColor: '#fff' }}
        >
          {typeMeta.badge}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] leading-snug ${read ? 'font-normal' : 'font-medium'}`} style={{ color: '#1C1C1C' }}>
          <span className="font-bold">{name}</span>{' '}{typeMeta.headline}
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
function renderTypeMeta(u) {
  switch (u.type) {
    case 'session':
      return {
        badge: <CheckCircle2 size={14} style={{ color: '#16a34a' }} fill="#dcfce7" />,
        headline: <>completed <span className="font-semibold" style={{ color: '#A58D69' }}>{u.session_name}</span></>,
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
        badge: <Heart size={12} style={{ color: RAG_COLOR[u.rag] || RAG_COLOR.grey }} fill={RAG_COLOR[u.rag] || RAG_COLOR.grey} />,
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
        badge: <TrendingUp size={12} style={{ color: '#A58D69' }} />,
        headline: <>hit a new PB on <span className="font-semibold" style={{ color: '#A58D69' }}>{u.exercise_name}</span></>,
        chips: <>
          {u.e1rm_kg != null && (
            <span className="inline-flex items-center gap-1 font-bold tabular-nums" style={{ color: '#A58D69' }}>
              e1RM {u.e1rm_kg}kg
            </span>
          )}
        </>,
      };

    default:
      return { badge: null, headline: 'logged activity', chips: null };
  }
}
