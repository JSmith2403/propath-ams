import { useMemo, useState } from 'react';
import { ShieldCheck, Users, Send, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useWellnessAdherence } from '../../hooks/useWellnessAdherence';
import { Avatar, DashCard, Empty, GOLD } from './parts';

const lastCheckIn = (row) => {
  const done = [...row.last7].reverse().find(d => d.completed);
  if (!done) return 'No check-in this week';
  const days = Math.round((Date.now() - new Date(`${done.dateISO}T00:00:00`).getTime()) / 86400000);
  return days <= 0 ? 'Done today' : days === 1 ? 'Last check-in yesterday' : `Last check-in ${days} days ago`;
};

function Ring({ pct }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label={`${pct}% completed`}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={GOLD} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 55 55)" />
      <text x="55" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1C1C1C">{pct}%</text>
    </svg>
  );
}

/** Who has done today's wellness check-in, who hasn't, and a real push-notification reminder. */
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
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex flex-col items-center">
              <Ring pct={pct} />
              <p className="text-micro text-ink-500 -mt-1">{done}/{rows.length}</p>
            </div>
            <dl className="flex-1 min-w-[160px] rounded-lg border border-ink-100 divide-y divide-ink-100 text-meta">
              <div className="flex justify-between px-3 py-2"><dt className="text-ink-600">Completed today</dt><dd className="font-bold text-ink-900">{done}</dd></div>
              <div className="flex justify-between px-3 py-2"><dt className="text-ink-600">Not completed</dt><dd className="font-bold text-ink-900">{missing.length}</dd></div>
            </dl>
            {onViewAll && (
              <button onClick={onViewAll} className="inline-flex items-center gap-1.5 text-meta font-semibold rounded-lg border border-ink-100 px-4 py-3" style={{ color: GOLD }}>
                <Users size={15} /> View all athletes
              </button>
            )}
          </div>

          {missing.length > 0 && (
            <>
              <p className="text-micro font-bold uppercase text-ink-400 mt-4 mb-1.5">Not completed today</p>
              <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">
                {missing.slice(0, 4).map(r => {
                  const st = sent[r.athleteId];
                  return (
                    <li key={r.athleteId} className="flex items-center gap-3 px-3 py-2">
                      <Avatar athlete={byId.get(r.athleteId)} size={30} />
                      <div className="flex-1 min-w-0">
                        <p className="text-meta font-semibold text-ink-900 truncate">{byId.get(r.athleteId)?.name || 'Athlete'}</p>
                        <p className="text-micro text-ink-400 truncate">{lastCheckIn(r)}</p>
                      </div>
                      <button onClick={() => remind(r.athleteId)} disabled={st === 'sending' || st === 'sent'}
                        className="inline-flex items-center gap-1 text-micro font-semibold px-2.5 py-1 rounded-md border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-60">
                        {st === 'sent' ? <><Check size={12} /> Sent</> : st === 'sending' ? 'Sending…' : st === 'failed' ? 'Retry' : 'Send reminder'}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button onClick={remindAll} className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-meta font-semibold bg-ink-50 hover:bg-ink-100" style={{ color: GOLD }}>
                <Send size={14} /> Send reminders to all ({missing.length})
              </button>
            </>
          )}
        </>
      )}
    </DashCard>
  );
}
