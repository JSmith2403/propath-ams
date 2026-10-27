import { Bell, Clock, Flame, Weight } from 'lucide-react';
import { useRecentUpdates } from '../../hooks/useRecentUpdates';
import { Avatar, Chip, DashCard, Empty, RAG, relTime } from './parts';

const kg = (n) => (n >= 1000 ? `${Math.round(n).toLocaleString()} kg` : `${n} kg`);

function headline(u) {
  switch (u.type) {
    case 'session':    return { title: `Completed ${u.session_name}`, sub: relTime(u.timestamp) };
    case 'wellness':   return { title: 'Submitted wellness check-in', sub: relTime(u.timestamp) };
    case 'pb':         return { title: `New PB — ${u.exercise_name}`, sub: `${Math.round(u.e1rm_kg)} kg e1RM · ${relTime(u.timestamp)}` };
    case 'meal':       return { title: `Logged ${String(u.meal_type).replace(/_/g, ' ')}`, sub: relTime(u.timestamp) };
    case 'attendance': return { title: `${u.attendance === 'attending' ? 'Attending' : 'Not attending'} — ${u.session_name}`, sub: u.note || relTime(u.timestamp) };
    default:           return { title: 'Update', sub: relTime(u.timestamp) };
  }
}

function Metrics({ u }) {
  if (u.type === 'session') {
    return (
      <div className="hidden sm:flex items-center gap-3 text-micro text-ink-600">
        {u.duration_min != null && <span className="inline-flex items-center gap-1"><Clock size={12} /> {u.duration_min} min</span>}
        {u.total_rpe != null && <span className="inline-flex items-center gap-1"><Flame size={12} /> RPE {u.total_rpe}</span>}
        {u.total_load_kg > 0 && <span className="inline-flex items-center gap-1"><Weight size={12} /> {kg(u.total_load_kg)}</span>}
      </div>
    );
  }
  if (u.type === 'wellness') return <Chip tone={RAG[u.rag] || RAG.grey}>{(RAG[u.rag] || RAG.grey).label}</Chip>;
  return null;
}

/** Latest activity across every athlete — sessions, check-ins, PBs, meals, attendance. */
export default function RecentUpdatesCard({ athleteById, onOpenAthlete, onViewAll }) {
  const { updates, loading, unreadCount, isRead, markRead } = useRecentUpdates();
  const rows = updates.slice(0, 5);
  return (
    <DashCard icon={Bell} title="Recent Updates" badge={unreadCount || null}
      subtitle="Latest training, testing and athlete activity." onViewAll={onViewAll}>
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>Nothing in the last 30 days.</Empty> : (
        <ul className="space-y-2">
          {rows.map(u => {
            const a = athleteById.get(u.athlete_id);
            const h = headline(u);
            const unread = !isRead(u);
            return (
              <li key={u.id}>
                <button onClick={() => { markRead(u); onOpenAthlete(u.athlete_id); }}
                  className="w-full flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2.5 text-left hover:bg-ink-50 transition-colors">
                  <Avatar athlete={a} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="text-meta font-semibold text-ink-900 truncate">
                      {unread && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ backgroundColor: '#dc2626' }} />}
                      {a?.name || 'Athlete'}
                    </p>
                    <p className="text-micro text-ink-700 truncate">{h.title}</p>
                    <p className="text-micro text-ink-400 truncate">{h.sub}</p>
                  </div>
                  <Metrics u={u} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </DashCard>
  );
}
