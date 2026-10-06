import { useState } from 'react';
import { Check, X, UserRound } from 'lucide-react';
import AttendanceToggle from './AttendanceToggle';
import { fmtRange, dayLabel } from '../../utils/timetable';
import { sendCoachMessage } from '../../utils/coachMessage';

const GOLD = '#A58D69';

/**
 * 1:1 slots (placeholder until packages are locked in): the athlete says
 * whether they'll take their 1:1 this week and, if so, what time they intend
 * to take it. That note is saved with their answer AND sent to the coaching
 * team as a message, so a coach can book it in. Caps per package aren't
 * enforced yet.
 */
function OneToOneResponse({ slot, onRespond }) {
  const taking = slot.status === 'attending';
  const skipping = slot.status === 'not_attending';
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(slot.note || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    const intended = time.trim();
    if (!intended) { setError('Let your coach know roughly what time.'); return; }
    setBusy(true); setError(null);
    const changed = !taking || (slot.note || '') !== intended;
    const r = await onRespond(slot.id, 'attending', intended);
    if (!r?.ok) { setBusy(false); setError('Couldn\'t save that — try again.'); return; }
    if (changed) {
      await sendCoachMessage(
        `1:1 session — ${dayLabel(slot.slot_date)} (${fmtRange(slot.start_time, slot.end_time)}): `
        + `I'd like to take my 1:1 at ${intended}.`
      );
    }
    setBusy(false);
    setEditing(false);
  };

  const skip = async () => {
    setEditing(false); setError(null);
    const r = await onRespond(slot.id, skipping ? null : 'not_attending', '');
    if (!r?.ok) setError('Couldn\'t save that — try again.');
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <button
          onClick={() => { setTime(slot.note || ''); setEditing(true); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-meta font-semibold border transition-colors"
          style={taking || editing
            ? { backgroundColor: 'rgba(22,163,74,0.10)', borderColor: '#16a34a', color: '#15803d' }
            : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
        >
          <Check size={14} /> I&rsquo;ll take my 1:1
        </button>
        <button
          onClick={skip}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-meta font-semibold border transition-colors"
          style={skipping
            ? { backgroundColor: 'rgba(220,38,38,0.08)', borderColor: '#dc2626', color: '#b91c1c' }
            : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
        >
          <X size={14} /> Not this week
        </button>
      </div>

      {editing && (
        <div className="mt-2 rounded-lg border border-ink-100 bg-white p-3 space-y-2">
          <label className="block text-micro font-semibold text-ink-500" htmlFor={`oto-${slot.id}`}>
            What time do you intend to take your 1:1?
          </label>
          <input
            id={`oto-${slot.id}`}
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. Wednesday after school, around 4pm"
            className="w-full text-body border border-ink-200 rounded px-3 py-2"
            maxLength={150}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={save} disabled={busy}
              className="flex-1 py-2 rounded-lg text-meta font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GOLD }}
            >
              {busy ? 'Saving…' : 'Save & tell my coach'}
            </button>
            <button
              onClick={() => setEditing(false)} disabled={busy}
              className="flex-1 py-2 rounded-lg text-meta font-semibold text-ink-600 border border-ink-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {taking && !editing && slot.note && (
        <p className="text-micro text-ink-500 mt-1.5">Your coach has been told you plan to take it: {slot.note}</p>
      )}
      {error && <p className="text-micro mt-1.5" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
}

/** One timetable slot with its Attending / Can't make it controls. */
export default function TimetableSlotRow({ slot, onRespond }) {
  const oneToOne = slot.kind === 'one_to_one';
  return (
    <div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-body font-bold text-ink-900">{fmtRange(slot.start_time, slot.end_time)}</p>
        <p className="text-meta font-semibold text-ink-700 inline-flex items-center gap-1">
          {oneToOne && <UserRound size={12} />}{oneToOne ? (slot.title || '1:1') : slot.title}
        </p>
        {slot.location && <p className="text-micro text-ink-400">· {slot.location}</p>}
      </div>
      {slot.notes && <p className="text-micro text-ink-500 mt-0.5">{slot.notes}</p>}

      {oneToOne ? (
        <OneToOneResponse slot={slot} onRespond={onRespond} />
      ) : (
        <AttendanceToggle
          value={slot.status}
          note={slot.note}
          onRespond={(status, note) => onRespond(slot.id, status, note)}
        />
      )}
    </div>
  );
}
