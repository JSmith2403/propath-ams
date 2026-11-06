import { useState } from 'react';
import { ChevronDown, UserMinus } from 'lucide-react';
import { Avatar, DashCard } from './parts';
import { StateDisc } from './status';

/**
 * Hands-off athletes (no programming, no wearable) live here, out of the main overview: a short list showing only
 * whether they have checked in, since that's the contact we do expect from them.
 */
export default function HandsOffCard({ rows, onOpenAthlete }) {
  const [open, setOpen] = useState(false);
  if (!rows.length) return null;
  return (
    <DashCard icon={UserMinus} title={`Hands-off athletes (${rows.length})`} subtitle="No programming or wearable. Online work with the team and check-ins.">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="self-start inline-flex items-center gap-1.5 text-meta font-semibold text-ink-700 rounded-lg border border-ink-200 px-2.5 py-1 hover:bg-ink-50">
        {open ? 'Hide list' : 'Show list'} <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <ul className="grid gap-x-4 gap-y-1 md:grid-cols-2 mt-2">
          {rows.map(r => {
            const done = r.checkIn.state !== 'none';
            return (
              <li key={r.id}>
                <button onClick={() => onOpenAthlete(r.id)} className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-ink-50">
                  <Avatar athlete={r.athlete} size={30} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-body font-semibold text-ink-900 truncate">{r.name}</span>
                    <span className="block text-[11px] text-ink-500">{done ? 'Checked in today' : r.checkIn.expected ? (r.checkIn.streak >= 2 ? `No check-in, ${r.checkIn.streak} days` : 'No check-in today') : 'Check-ins not switched on'}</span>
                  </span>
                  <StateDisc kind={done ? r.checkIn.state : 'none'} title={done ? 'Check-in today' : 'No check-in today'} size={24} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </DashCard>
  );
}
