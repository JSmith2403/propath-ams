import { useState } from 'react';
import { Check, X } from 'lucide-react';

/**
 * AttendanceToggle — "Attending / Can't make it" for one planned session.
 * Tapping "Can't make it" asks for an optional reason before saving. Tapping
 * the active choice again clears the response.
 */
export default function AttendanceToggle({ value, note, onRespond }) {
  const [askingReason, setAskingReason] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  const attending = value === 'attending';
  const declined  = value === 'not_attending';

  const save = async (status, text = '') => {
    setError(null);
    const res = await onRespond(status, text);
    if (res && !res.ok) setError('Couldn’t save that — try again.');
  };

  const onAttending = () => {
    setAskingReason(false);
    save(attending ? null : 'attending');
  };
  const onDeclined = () => {
    if (declined) { save(null); return; }
    setAskingReason(true);
  };
  const confirmDecline = () => {
    setAskingReason(false);
    save('not_attending', reason.trim());
    setReason('');
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <button
          onClick={onAttending}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-meta font-semibold border transition-colors"
          style={attending
            ? { backgroundColor: 'rgba(22,163,74,0.10)', borderColor: '#16a34a', color: '#15803d' }
            : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
        >
          <Check size={14} /> Attending
        </button>
        <button
          onClick={onDeclined}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-meta font-semibold border transition-colors"
          style={declined || askingReason
            ? { backgroundColor: 'rgba(220,38,38,0.08)', borderColor: '#dc2626', color: '#b91c1c' }
            : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
        >
          <X size={14} /> Can&rsquo;t make it
        </button>
      </div>

      {askingReason && (
        <div className="mt-2 rounded-lg border border-ink-100 bg-white p-3 space-y-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional) — e.g. school trip, ill"
            className="w-full text-body border border-ink-200 rounded px-3 py-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={confirmDecline}
              className="flex-1 py-2 rounded-lg text-meta font-bold text-white"
              style={{ backgroundColor: '#dc2626' }}
            >
              Confirm
            </button>
            <button
              onClick={() => { setAskingReason(false); setReason(''); }}
              className="flex-1 py-2 rounded-lg text-meta font-semibold text-ink-600 border border-ink-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {declined && note && !askingReason && (
        <p className="text-micro text-ink-500 mt-1.5">Your note: {note}</p>
      )}
      {error && <p className="text-micro mt-1.5" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
}
