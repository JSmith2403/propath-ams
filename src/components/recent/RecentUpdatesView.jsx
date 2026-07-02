import { useMemo } from 'react';
import { Bell, CheckCircle2, Clock, Flame, Loader2 } from 'lucide-react';
import { useRecentUpdates } from '../../hooks/useRecentUpdates';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// "2 min ago", "3 h ago", "Yesterday, 4:30 pm", "Mon 30 Jun"
function relTime(iso) {
  if (!iso) return '';
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffMin = Math.round((now - t) / 60_000);
  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 12) return `${diffHr} h ago`;
  const d = new Date(iso);
  const isToday     = new Date().toDateString() === d.toDateString();
  const yest        = new Date(); yest.setDate(yest.getDate() - 1);
  const isYesterday = yest.toDateString() === d.toDateString();
  const timeStr = d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  if (isToday)     return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Group updates into date buckets ("Today", "Yesterday", or a date label)
function groupByDay(updates) {
  const today = new Date().toDateString();
  const yest  = new Date(); yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toDateString();
  const groups = [];
  let currentLabel = null;
  let currentBucket = null;
  for (const u of updates) {
    const d = new Date(u.completed_at);
    const label = d.toDateString() === today   ? 'Today'
               : d.toDateString() === yestStr ? 'Yesterday'
               : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
    if (label !== currentLabel) {
      currentBucket = { label, rows: [] };
      groups.push(currentBucket);
      currentLabel = label;
    }
    currentBucket.rows.push(u);
  }
  return groups;
}

/**
 * RecentUpdatesView — coach-side feed of the latest completed session
 * logs across every athlete. Facebook-notification style: newest first,
 * grouped by day.
 *
 * Each row shows athlete avatar, name, session name, "N min · RPE X",
 * relative timestamp, and a tap-through into the athlete's profile.
 *
 * Renders inside both the desktop main area and the mobile bottom-nav
 * "Updates" tab — same component in both places.
 *
 * Props:
 *   athletes         (required) — list of athletes to look up avatars/names
 *   onNavigateToAthlete(id)      — click handler when a row is tapped
 */
export default function RecentUpdatesView({ athletes = [], onNavigateToAthlete }) {
  const { updates, loading, error, refresh } = useRecentUpdates({ limit: 100 });

  const athleteById = useMemo(() => {
    const m = new Map();
    for (const a of athletes) m.set(a.id, a);
    return m;
  }, [athletes]);

  const groups = useMemo(() => groupByDay(updates), [updates]);

  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
      {/* Header — mirrors the sidebar accent bar spacing on desktop,
          sits above the content on mobile. */}
      <div className="px-4 md:px-8 pt-6 pb-3 flex items-center gap-2 border-b border-ink-100 bg-white sticky top-0 z-10">
        <Bell size={18} style={{ color: '#A58D69' }} />
        <div className="flex-1">
          <h1 className="text-lg md:text-2xl font-bold" style={{ color: '#1C1C1C' }}>
            Recent Updates
          </h1>
          <p className="text-[11px] md:text-xs mt-0.5" style={{ color: '#6b7280' }}>
            Sessions your athletes completed, newest first.
          </p>
        </div>
        <button
          onClick={refresh}
          className="hidden md:inline-flex text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          style={{ color: '#A58D69', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
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
            Completed sessions will appear here as soon as your athletes finish and log them.
          </div>
        </div>
      )}

      {!loading && !error && groups.map(group => (
        <div key={group.label}>
          <div
            className="px-4 md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest sticky top-[76px] md:top-[92px] z-[5]"
            style={{ color: '#9ca3af', backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}
          >
            {group.label}
          </div>
          <div>
            {group.rows.map(u => {
              const a = athleteById.get(u.athlete_id);
              const name = a?.name || 'Unknown athlete';
              const clickable = !!a;
              return (
                <div
                  key={u.id}
                  onClick={() => clickable && onNavigateToAthlete && onNavigateToAthlete(u.athlete_id)}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : -1}
                  className={`flex items-start gap-3 px-4 md:px-8 py-3 border-b border-ink-100 transition-colors ${
                    clickable ? 'cursor-pointer active:bg-gold-50/40 hover:bg-gray-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="shrink-0 relative rounded-full overflow-hidden mt-0.5"
                    style={{ width: 40, height: 40, backgroundColor: '#085777' }}
                  >
                    {a?.photo ? (
                      <img
                        src={a.photo}
                        alt={name}
                        className="w-full h-full"
                        style={{ objectFit: 'cover', objectPosition: 'top center' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ fontSize: 13 }}>
                        {initials(name)}
                      </div>
                    )}
                    {/* Completion tick badge — top-right, small */}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
                      style={{ width: 16, height: 16, backgroundColor: '#fff' }}
                    >
                      <CheckCircle2 size={14} style={{ color: '#16a34a' }} fill="#dcfce7" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] leading-snug" style={{ color: '#1C1C1C' }}>
                      <span className="font-bold">{name}</span>
                      {' '}completed{' '}
                      <span className="font-semibold" style={{ color: '#A58D69' }}>{u.session_name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: '#6b7280' }}>
                      {u.duration_min != null && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} />
                          {u.duration_min} min
                        </span>
                      )}
                      {u.total_rpe != null && (
                        <span className="inline-flex items-center gap-1">
                          <Flame size={10} />
                          RPE {u.total_rpe}
                        </span>
                      )}
                      <span className="ml-auto">{relTime(u.completed_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
