import { Apple, Droplet } from 'lucide-react';
import { Avatar, Chip, DashCard, Empty, TEAL, relTime } from './parts';

const STATUS = {
  reviewed: { label: 'Reviewed', fg: '#15803d', bg: '#dcfce7' },
  pending:  { label: 'Pending',  fg: '#b45309', bg: '#fef3c7' },
};
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '');

function Drops({ filled, total }) {
  const n = Math.min(Math.max(total, 1), 8);
  return (
    <span className="inline-flex items-center gap-0.5" title={`${filled} of ${total} glasses of water`}>
      {Array.from({ length: n }, (_, i) => (
        <Droplet key={i} size={13} style={{ color: i < filled ? TEAL : '#d1d5db', fill: i < filled ? TEAL : 'none' }} />
      ))}
    </span>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div className="flex-1 text-center px-2">
      <p className="text-h2 font-bold leading-none" style={{ color: tone }}>{value}</p>
      <p className="text-micro mt-1" style={{ color: tone === '#1C1C1C' ? '#6b7280' : tone }}>{label}</p>
    </div>
  );
}

/** Food + hydration submissions: today's headline numbers and the latest entries with photo and water. */
export default function NutritionCard({ data, athleteById, onOpenAthlete }) {
  const n = data?.nutrition;
  return (
    <DashCard icon={Apple} title="Nutrition Submissions" subtitle="Latest food and hydration entries from your athletes.">
      {!n ? <Empty>No nutrition data yet.</Empty> : (
        <>
          <div className="flex items-stretch divide-x divide-ink-100 rounded-lg border border-ink-100 py-3 mb-3">
            <Stat value={n.submittedToday} label="Submitted today" tone="#1C1C1C" />
            <Stat value={n.pendingReview} label="Pending review" tone="#b45309" />
            <Stat value={n.incompleteIds.length} label="Not logged today" tone="#b91c1c" />
          </div>
          {n.latest.length === 0 ? <Empty>No meals logged in the last two days.</Empty> : (
            <ul className="space-y-2">
              {n.latest.map(r => {
                const a = athleteById.get(r.athleteId);
                const st = STATUS[r.reviewed ? 'reviewed' : 'pending'];
                return (
                  <li key={r.id} className="flex items-center gap-3 rounded-lg border border-ink-100 p-2.5">
                    {r.thumb
                      ? <img src={r.thumb} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      : <span className="w-14 h-14 rounded-lg bg-ink-50 flex items-center justify-center shrink-0"><Avatar athlete={a} size={30} /></span>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-meta font-semibold text-ink-900 truncate">{a?.name || 'Athlete'}</p>
                        <Drops filled={r.glasses} total={r.target} />
                      </div>
                      <p className="text-micro text-ink-400">{relTime(r.when)}</p>
                      <p className="text-micro text-ink-700 truncate">{cap(r.mealType)}{r.description ? ` · ${r.description}` : ''}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Chip tone={st}>{st.label}</Chip>
                      <button onClick={() => onOpenAthlete(r.athleteId, { tab: 'rag-nutrition' })}
                        className="text-micro font-semibold px-2.5 py-1 rounded-md border border-ink-200 text-ink-700 hover:bg-ink-50">View</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {n.incompleteIds.length > 0 && (
            <p className="text-micro text-ink-500 mt-3">
              Not logged today: {n.incompleteIds.map(id => athleteById.get(id)?.name?.split(' ')[0] || '—').join(', ')}
            </p>
          )}
        </>
      )}
    </DashCard>
  );
}
