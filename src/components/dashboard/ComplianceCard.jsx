import { useMemo, useState } from 'react';
import { ShieldCheck, Users, Send, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useWellnessAdherence } from '../../hooks/useWellnessAdherence';
import { Avatar, DashCard, Empty, GOLD, Scroll } from './parts';

const lastCheckIn = (row) => {
  const done = [...row.last7].reverse().find(d => d.completed);
  if (!done) return 'No check-in this week';
  const days = Math.round((Date.now() - new Date(`${done.dateISO}T00:00:00`).getTime()) / 86400000);
  return days <= 0 ? 'Done today' : days === 1 ? 'Last check-in yesterday' : `Last check-in ${days} days ago`;
};

function Ring({ pct, done, total }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label={`${pct}% completed`} className="shrink-0">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={GOLD} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 44 44)" />
      <text x="44" y="43" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1C1C1C">{pct}%</text>
      <text x="44" y="58" textAnchor="middle" fontSize="10" fill="#6b7280">{done}/{total}</text>
    </svg>
  );
}

/** Who has done today's wellness check-in, who hasn't (scrolling list), and a real push reminder. */
export default function ComplianceCard({ athletes, onViewAll }) {
  const ids = useMemo(() => athletes.map(a => a.id), [athletes]);
  const byId = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);
  const { rows, loading } = useWellnessAdherence(ids);
  const [sent, setSent] = useState({});   // athleteId → 'sending' | 'sent' | 'failed'

  const done = rows.filter(r => r.todayCompleted).length;
  const missing = rows.filter(r => !r.todayCompleted);
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;

  const remind = async (id) => {
    setSent(s => ({ ...s, [id]: 'sending' }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ athlete_id: id, title: 'Daily check-in', body: 'Quick one — please complete today’s wellness check-in.', url: '/athlete' }),
      });
      const json = await res.json().catch(() => ({}));
      setSent(s => ({ ...s, [id]: res.ok && json.ok ? 'sent' : 'failed' }));
    } catch { setSent(s => ({ ...s, [id]: 'failed' })); }
  };
  const remindAll = async () => { for (const r of missing) if (sent[r.athleteId] !== 'sent') await remind(r.athleteId); };

  return (
    <DashCard icon={ShieldCheck} title="Wellness Compliance" subtitle="Athletes with wellness completed today.">
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No athletes have wellness switched on.</Empty> : (
        <>
          <div className="flex items-center gap-4 shrink-0 mb-2">
            <Ring pct={pct} done={done} total={rows.length} />
            <dl className="flex-1 min-w-0 rounded-lg border border-ink-100 divide-y divide-ink-100 text-meta">
              <div className="flex justify-between px-3 py-1.5"><dt className="text-ink-600">Completed today</dt><dd className="font-bold text-ink-900">{done}</dd></div>
              <div className="flex justify-between px-3 py-1.5"><dt className="text-ink-600">Not completed</dt><dd className="font-bold text-ink-900">{missing.length}</dd></div>
            </dl>
            {onViewAll && (
              <button onClick={onViewAll} className="inline-flex items-center gap-1.5 text-meta font-semibold rounded-lg border border-ink-100 px-3 py-2 shrink-0" style={{ color: GOLD }}>
                <Users size={14} /> All athletes
              </button>
            )}
          </div>

          {missing.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase text-ink-400 mb-1 shrink-0">Not completed today</p>
              <Scroll>
                <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">
                  {missing.map(r => {
                    const st = sent[r.athleteId];
                    return (
                      <li key={r.athleteId} className="flex items-center gap-2.5 px-2.5 py-1.5">
                        <Avatar athlete={byId.get(r.athleteId)} size={26} />
                        <div className="flex-1 min-w-0">
                          <p className="text-meta font-semibold text-ink-900 truncate">{byId.get(r.athleteId)?.name || 'Athlete'}</p>
                          <p className="text-micro text-ink-400 truncate">{lastCheckIn(r)}</p>
                        </div>
                        <button onClick={() => remind(r.athleteId)} disabled={st === 'sending' || st === 'sent'}
                          className="inline-flex items-center gap-1 text-micro font-semibold px-2 py-0.5 rounded-md border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-60 whitespace-nowrap">
                          {st === 'sent' ? <><Check size={11} /> Sent</> : st === 'sending' ? 'Sending…' : st === 'failed' ? 'Retry' : 'Send reminder'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Scroll>
              <button onClick={remindAll} className="w-full mt-2 shrink-0 inline-flex items-center justify-center gap-2 rounded-lg py-1.5 text-meta font-semibold bg-ink-50 hover:bg-ink-100" style={{ color: GOLD }}>
                <Send size={13} /> Send reminders to all ({missing.length})
              </button>
            </>
          )}
        </>
      )}
    </DashCard>
  );
}
