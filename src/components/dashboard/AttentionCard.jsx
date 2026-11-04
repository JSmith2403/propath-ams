import { AlertTriangle, Check } from 'lucide-react';
import { Avatar, DashCard, Empty, Scroll } from './parts';

const TONE = {
  red: { bg: '#fef2f2', fg: '#b91c1c' },
  amber: { bg: '#fffbeb', fg: '#8a4510' },
  grey: { bg: '#f4f4f5', fg: '#52525b' },
};
const REMIND_KIND = { 'remind-checkin': 'checkin', 'remind-timetable': 'timetable', 'remind-watch': 'watch' };

/** "Needing coach attention": the things to do first, each with a one-tap action. */
export default function AttentionCard({ items, loading, athleteById, onOpenAthlete, onNavigate, reminders }) {
  const act = (it) => {
    if (it.action === 'programme') onNavigate('programme');
    else if (it.action === 'open') onOpenAthlete(it.ids[0], it.tag === 'Pain' || it.tag === 'Flagged' ? { tab: 'wellness' } : undefined);
    else reminders.send(it.id, it.ids, REMIND_KIND[it.action]);
  };
  const label = (it) => {
    const st = reminders.state[it.id];
    if (it.action === 'programme') return 'Programmes';
    if (it.action === 'open') return 'Open';
    if (st === 'sending') return 'Sending…';
    if (st === 'sent') return <><Check size={13} /> Sent</>;
    if (st === 'failed') return 'Retry';
    return it.action === 'remind-watch' ? 'Ask to sync' : it.ids.length > 1 ? 'Remind all' : 'Remind';
  };

  return (
    <DashCard icon={AlertTriangle} title="Needing coach attention" badge={items.length || null}>
      {loading ? <Empty>Loading…</Empty> : items.length === 0 ? <Empty>Nothing needs you right now.</Empty> : (
        <Scroll className="max-h-[520px]">
          <ul className="divide-y divide-ink-100">
            {items.map(it => {
              const t = TONE[it.tone];
              const single = it.ids.length === 1 ? athleteById.get(it.ids[0]) : null;
              const st = reminders.state[it.id];
              return (
                <li key={it.id} className="flex items-center gap-3 py-2.5">
                  {single
                    ? <Avatar athlete={single} size={36} />
                    : <span className="w-9 h-9 rounded-full flex items-center justify-center text-meta font-bold shrink-0" style={{ background: t.bg, color: t.fg }}>{it.ids.length}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-bold text-ink-900">{it.who}</span>
                      <span className="text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5" style={{ background: t.bg, color: t.fg }}>{it.tag}</span>
                    </p>
                    <p className="text-meta text-ink-600">{it.what}</p>
                  </div>
                  <button onClick={() => act(it)} disabled={st === 'sending' || st === 'sent'}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-meta font-semibold disabled:opacity-60 hover:brightness-95"
                    style={{ background: t.bg, color: t.fg }}>
                    {label(it)}
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
