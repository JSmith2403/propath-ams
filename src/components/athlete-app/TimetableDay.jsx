import { useEffect, useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { fmtRange, fmtTime, dayLabel, AUTO_NOTE, ONE_TO_ONE_OPEN } from '../../utils/timetable';

const GOLD = '#A58D69';

function Pill({ selected, tone = 'gold', onClick, disabled, children }) {
  const tones = {
    gold: selected
      ? { backgroundColor: GOLD, borderColor: GOLD, color: '#fff' }
      : { backgroundColor: '#fff', borderColor: '#d9dce1', color: '#374151' },
    ticket: disabled
      ? { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', color: '#9ca3af' }
      : { backgroundColor: 'rgba(165,141,105,0.10)', borderColor: GOLD, color: '#7a6748' },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={!!selected}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-meta font-semibold transition-colors active:scale-[0.98] ${disabled ? 'cursor-not-allowed' : ''}`}
      style={tones[tone]}
    >
      {children}
    </button>
  );
}

const STATUS_LABEL = { requested: 'Requested', confirmed: 'Confirmed ✓', declined: 'Declined', completed: 'Done', cancelled: 'Cancelled' };

/** Sheet for asking a coach for a 1:1 on a given day (switched on with ONE_TO_ONE_OPEN). */
function RequestSheet({ date, balance, onSend, onClose }) {
  const [time, setTime] = useState('14:00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    setBusy(true); setError(null);
    const r = await onSend(date, time);
    setBusy(false);
    if (!r.ok) setError(r.error);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="w-full bg-white rounded-t-2xl shadow-2xl p-5" style={{ maxWidth: 480, paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
        <h3 className="text-body font-bold text-ink-900">Request a 1:1 on {dayLabel(date)}</h3>
        <p className="text-meta text-ink-500 mt-1">
          Pick a time that suits you. We&rsquo;ll message your coach to ask if they&rsquo;re free.
          {balance && <> This uses <strong>1 of your {balance.left}</strong> remaining 1:1 token{balance.left === 1 ? '' : 's'}.</>}
        </p>
        <label className="block text-micro font-semibold text-ink-500 mt-4 mb-1" htmlFor="oto-time">What time are you free?</label>
        <input
          id="oto-time" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)}
          className="w-full text-body border border-ink-200 rounded-xl px-3 py-3"
        />
        {error && <p className="text-meta text-red-600 mt-2" role="alert">{error}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={send} disabled={busy || !time}
            className="flex-1 py-3 rounded-xl text-body font-bold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: GOLD }}
          >
            {busy && <Loader2 size={15} className="animate-spin" />} Send request
          </button>
          <button onClick={onClose} disabled={busy} className="px-5 py-3 rounded-xl text-body font-semibold text-ink-600 border border-ink-200">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/**
 * TimetableDay — one day of the academy timetable as pills. The athlete taps the
 * ONE group session they're coming to (tapping another switches; tapping the
 * selected one again deselects). No selection = not attending that day. A note
 * box covers the odd late arrival / early leave.
 *
 * 1:1 is a locked placeholder ("coming soon") until the token system is final;
 * flip ONE_TO_ONE_OPEN in utils/timetable.js to enable the request flow.
 */
export default function TimetableDay({ date, slots, balance, requests = [], onChoose, onRequest, onRequested }) {
  const chosen = slots.find(s => s.status === 'attending') || null;
  const answered = slots.every(s => s.status);
  const noneSelected = answered && !chosen;
  const savedNote = chosen ? (chosen.note && chosen.note !== AUTO_NOTE ? chosen.note : '') : '';

  const [draft, setDraft] = useState(savedNote);
  useEffect(() => { setDraft(savedNote); }, [savedNote, chosen?.id]);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const run = async (fn) => {
    setError(null);
    const r = await fn();
    if (r && !r.ok) setError('Couldn’t save that — try again.');
  };

  // Tap a session: switch to it, or — if it's already selected — deselect (not attending).
  const tapSession = (s) => run(() => onChoose(date, chosen?.id === s.id ? null : s.id, ''));
  const saveNote = () => run(() => onChoose(date, chosen.id, draft.trim()));

  const sendRequest = async (d, t) => {
    const r = await onRequest(d, t);
    if (r.ok) { setSheet(false); if (onRequested) onRequested(r.message); else setSentNotice(true); }
    return r;
  };

  const noTokens = ONE_TO_ONE_OPEN && balance && balance.left < 1;
  const dayRequests = ONE_TO_ONE_OPEN ? requests.filter(r => r.request_date === date && r.status !== 'cancelled') : [];

  return (
    <div className="rounded-xl bg-white border border-ink-100 shadow-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-micro font-bold uppercase text-ink-400">{dayLabel(date)}</p>
        {!answered && <span className="text-[10px] font-bold uppercase text-gold-600">Pick one</span>}
        {noneSelected && <span className="text-[10px] font-semibold uppercase text-ink-400">Not attending</span>}
      </div>

      <div className="flex flex-wrap gap-2 mt-2.5">
        {slots.map(s => (
          <Pill key={s.id} selected={chosen?.id === s.id} onClick={() => tapSession(s)}>
            {fmtRange(s.start_time, s.end_time)}
          </Pill>
        ))}
        {ONE_TO_ONE_OPEN ? (
          <Pill tone="ticket" disabled={!!noTokens} onClick={() => setSheet(true)}>
            <Ticket size={14} /> 1:1 · 1 token
          </Pill>
        ) : (
          <Pill tone="ticket" disabled>
            <Ticket size={14} /> 1:1 · coming soon
          </Pill>
        )}
      </div>

      {slots.some(s => s.location || s.notes) && (
        <p className="text-micro text-ink-400 mt-2">
          {[...new Set(slots.map(s => s.location).filter(Boolean))].join(' · ')}
          {slots.find(s => s.notes)?.notes ? ` — ${slots.find(s => s.notes).notes}` : ''}
        </p>
      )}

      {chosen && (
        <div className="mt-3">
          <label className="block text-micro text-ink-500 mb-1" htmlFor={`note-${date}`}>
            Sessions start together with a team talk. If you&rsquo;ll be late or leaving early, let your coach know:
          </label>
          <div className="flex gap-2">
            <input
              id={`note-${date}`} type="text" value={draft} maxLength={150}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (draft.trim() !== savedNote) saveNote(); } }}
              placeholder="Optional, e.g. arriving 4:15"
              className="flex-1 min-w-0 text-body border border-ink-200 rounded-lg px-3 py-2"
            />
            {draft.trim() !== savedNote && (
              <button onClick={saveNote} className="px-3.5 rounded-lg text-meta font-bold text-white" style={{ backgroundColor: GOLD }}>Save</button>
            )}
          </div>
        </div>
      )}

      {noTokens && (
        <p className="text-micro text-ink-400 mt-2">
          No 1:1 tokens left{balance.nextFree ? ` — your next one is back on ${new Date(`${balance.nextFree}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}.
        </p>
      )}

      {dayRequests.map(r => (
        <p key={r.id} className="text-micro mt-2 flex items-center gap-1.5" style={{ color: r.status === 'confirmed' ? '#15803d' : r.status === 'declined' ? '#b91c1c' : '#7a6748' }}>
          <Ticket size={12} /> 1:1{r.request_time ? ` · ${fmtTime(r.request_time)}` : ''} · {STATUS_LABEL[r.status] || r.status}
        </p>
      ))}
      {sentNotice && <p className="text-micro mt-2 text-green-700">Request sent — your coach will reply in Messages.</p>}
      {error && <p className="text-micro mt-2" style={{ color: '#dc2626' }}>{error}</p>}

      {sheet && <RequestSheet date={date} balance={balance} onSend={sendRequest} onClose={() => setSheet(false)} />}
    </div>
  );
}
