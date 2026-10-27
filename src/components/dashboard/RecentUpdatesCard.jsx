import { Dumbbell, Clock, Flame, Weight, Trophy } from 'lucide-react';
import { useRecentUpdates } from '../../hooks/useRecentUpdates';
import { Avatar, DashCard, Empty, Scroll, relTime } from './parts';

const kg = (n) => (n >= 1000 ? `${Math.round(n).toLocaleString()} kg` : `${n} kg`);

/** Recently completed training sessions, newest first, with duration / RPE / load and any PBs. */
export default function RecentUpdatesCard({ athleteById, onOpenAthlete, onViewAll }) {
  const { updates, loading, unreadCount, isRead, markRead } = useRecentUpdates({ sessionsOnly: true });
  const rows = updates.filter(u => u.type === 'session');
  return (
    <DashCard icon={Dumbbell} title="Recent Updates" badge={unreadCount || null}
      subtitle="Recently completed training sessions." onViewAll={onViewAll}>
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No completed sessions in the last 30 days.</Empty> : (
        <Scroll>
          <ul className="space-y-1.5">
            {rows.map(u => {
              const a = athleteById.get(u.athlete_id);
              const unread = !isRead(u);
              return (
                <li key={u.id}>
                  <button onClick={() => { markRead(u); onOpenAthlete(u.athlete_id); }}
                    className="w-full flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2 text-left hover:bg-ink-50 transition-colors">
                    <Avatar athlete={a} size={34} />
                    <div className="flex-1 min-w-0">
                      <p className="text-meta font-semibold text-ink-900 truncate">
                        {unread && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ backgroundColor: '#dc2626' }} />}
                        {a?.name || 'Athlete'}
                      </p>
                      <p className="text-micro text-ink-700 truncate">Completed {u.session_name}</p>
                      <p className="text-micro text-ink-400">{relTime(u.timestamp)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 text-micro text-ink-600 shrink-0">
                      <span className="inline-flex items-center gap-2.5">
                        {u.duration_min != null && <span className="inline-flex items-center gap-1"><Clock size={11} /> {u.duration_min} min</span>}
                        {u.total_rpe != null && <span className="inline-flex items-center gap-1"><Flame size={11} /> RPE {u.total_rpe}</span>}
                      </span>
                      <span className="inline-flex items-center gap-2.5">
                        {u.total_load_kg > 0 && <span className="inline-flex items-center gap-1"><Weight size={11} /> {kg(u.total_load_kg)}</span>}
                        {u.pb_count > 0 && <span className="inline-flex items-center gap-1 font-semibold" style={{ color: '#A58D69' }} title={u.pb_exercises.join(', ')}><Trophy size={11} /> {u.pb_count} PB{u.pb_count > 1 ? 's' : ''}</span>}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Scroll>
      )}
    </DashCard>
  );
}
