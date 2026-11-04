import { Users, X } from 'lucide-react';
import { Avatar, DashCard, Empty, GOLD, Scroll } from './parts';
import { SessionRing, StateDisc, TONE } from './status';

const CHECKIN_TITLE = {
  green: 'Check-in today: nothing flagged', amber: 'Check-in today: needs a look', red: 'Check-in today: flagged',
};
const WATCH = {
  none: { kind: 'none', title: 'Watch: no Garmin data' },
  silent: { kind: 'silent', title: 'Watch: connected but silent for 2+ days' },
  ok: { kind: 'ok', title: 'Watch: data coming in (readiness scoring comes later)' },
};

/** One compact row per athlete: sessions ring, today's check-in, watch status, and the one thing to know. */
export default function AthleteOverviewCard({ rows, total, loading, filterLabel, onClearFilter, onOpenAthlete }) {
  return (
    <DashCard icon={Users} title="Athlete overview"
      subtitle={filterLabel ? undefined : 'Ring: sessions done this week. Circles: check-in, then watch.'}>
      {filterLabel && (
        <button onClick={onClearFilter} className="self-start mb-2 inline-flex items-center gap-1.5 text-meta font-semibold rounded-full border border-ink-200 px-2.5 py-1 text-ink-700 hover:bg-ink-50">
          {filterLabel} · {rows.length} of {total} <X size={12} />
        </button>
      )}
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No athletes match.</Empty> : (
        <Scroll className="max-h-[560px]">
          <ul className="grid gap-x-4 gap-y-1 md:grid-cols-2">
            {rows.map(r => {
              const tone = TONE[r.verdict.tone];
              const ci = r.checkIn.state === 'none'
                ? { kind: 'none', title: r.checkIn.expected ? 'Check-in today: not done yet' : 'Check-in: not switched on' }
                : { kind: r.checkIn.state, title: CHECKIN_TITLE[r.checkIn.state] };
              return (
                <li key={r.id}>
                  <button onClick={() => onOpenAthlete(r.id)} className="w-full grid items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:brightness-95 transition"
                    style={{ gridTemplateColumns: '34px minmax(0,1fr) 40px 28px 28px', background: tone.bg }}>
                    <Avatar athlete={r.athlete} size={34} />
                    <span className="min-w-0">
                      <span className="block text-body font-semibold text-ink-900 truncate">{r.name}</span>
                      <span className="block text-[11px] font-bold truncate" style={{ color: tone.fg }}>{r.verdict.label}</span>
                    </span>
                    <SessionRing done={r.sessions.done} planned={r.sessions.planned} />
                    <StateDisc kind={ci.kind} title={ci.title} />
                    <StateDisc kind={WATCH[r.watch.state].kind} title={WATCH[r.watch.state].title} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Scroll>
      )}
      <p className="text-[10px] text-ink-400 mt-2 shrink-0">
        <span style={{ color: '#15803d' }} className="font-bold">✓</span> good · <span className="font-bold" style={{ color: '#8a4510' }}>!</span> needs a look · dashed = no data · <span className="font-bold" style={{ color: GOLD }}>click a name</span> to open the athlete
      </p>
    </DashCard>
  );
}
