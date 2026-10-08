import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ticket, Loader2, Search, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DEFAULT_MONTHLY_TOKENS, fmtTime, todayUAE, addDaysISO, dayLabel } from '../../utils/timetable';

const GOLD = '#A58D69';
const COUNTED = new Set(['requested', 'confirmed', 'completed']);

const STATUS_STYLE = {
  requested: { bg: '#fef3c7', fg: '#92400e', label: 'Requested' },
  confirmed: { bg: '#dcfce7', fg: '#166534', label: 'Confirmed' },
  completed: { bg: '#e0e7ff', fg: '#3730a3', label: 'Done' },
  declined:  { bg: '#fee2e2', fg: '#991b1b', label: 'Declined' },
  cancelled: { bg: '#f3f4f6', fg: '#4b5563', label: 'Cancelled' },
};

/**
 * 1:1 tokens — who has how many 1:1 sessions left, on a ROLLING 30-day count: a
 * 1:1 holds a token for the 30 days from its date (requested / confirmed / done
 * count; declined and cancelled give it back). The monthly allowance is a
 * placeholder (4) until packages are locked in — edit it per athlete, or set
 * everyone at once. Requests from athletes land here to confirm or decline;
 * either way the athlete is told in their coach chat.
 */
export default function OneToOneTokens({ athletes = [] }) {
  const [allowances, setAllowances] = useState({});     // athlete_id → monthly_tokens
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('open');          // open | all
  const [busy, setBusy] = useState(null);
  const [declineFor, setDeclineFor] = useState(null);    // request id being declined
  const [declineNote, setDeclineNote] = useState('');
  const [bulk, setBulk] = useState(String(DEFAULT_MONTHLY_TOKENS));

  const today = todayUAE();
  const windowStart = addDaysISO(today, -30);

  const load = useCallback(async () => {
    const [{ data: al, error: alErr }, { data: rq, error: rqErr }] = await Promise.all([
      supabase.from('one_to_one_allowance').select('athlete_id, monthly_tokens'),
      supabase.from('one_to_one_requests')
        .select('id, athlete_id, request_date, request_time, status, tokens, coach_note, created_at')
        .gte('request_date', addDaysISO(today, -45))
        .order('request_date', { ascending: false }).limit(1000),
    ]);
    const err = alErr || rqErr;
    if (err) {
      setError(`${err.message} — has sql/timetable_pills_one_to_one_2026-10-10.sql been run?`);
      setLoading(false);
      return;
    }
    setError(null);
    setAllowances(Object.fromEntries((al || []).map(a => [a.athlete_id, a.monthly_tokens])));
    setRequests(rq || []);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    load();
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const nameById = useMemo(() => new Map(athletes.map(a => [a.id, a.name])), [athletes]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...athletes]
      .filter(a => !q || (a.name || '').toLowerCase().includes(q))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map(a => {
        const monthly = allowances[a.id] ?? DEFAULT_MONTHLY_TOKENS;
        const counted = requests.filter(r => r.athlete_id === a.id && COUNTED.has(r.status) && r.request_date > windowStart);
        const used = counted.reduce((n, r) => n + (r.tokens || 1), 0);
        const first = counted.map(r => r.request_date).sort()[0];
        return { athlete: a, monthly, used, left: Math.max(0, monthly - used), nextBack: first ? addDaysISO(first, 30) : null };
      });
  }, [athletes, allowances, requests, query, windowStart]);

  const saveAllowance = async (athleteId, value) => {
    const n = Math.max(0, Math.min(99, parseInt(value, 10) || 0));
    if (n === (allowances[athleteId] ?? DEFAULT_MONTHLY_TOKENS)) return;
    setAllowances(prev => ({ ...prev, [athleteId]: n }));
    const { error: err } = await supabase.from('one_to_one_allowance')
      .upsert({ athlete_id: athleteId, monthly_tokens: n, updated_at: new Date().toISOString() }, { onConflict: 'athlete_id' });
    if (err) { setError(err.message); load(); }
  };

  const applyToAll = async () => {
    const n = Math.max(0, Math.min(99, parseInt(bulk, 10) || 0));
    setBusy('bulk');
    const { error: err } = await supabase.from('one_to_one_allowance').upsert(
      athletes.map(a => ({ athlete_id: a.id, monthly_tokens: n, updated_at: new Date().toISOString() })), { onConflict: 'athlete_id' });
    setBusy(null);
    if (err) setError(err.message); else load();
  };

  const decide = async (req, decision, note = '') => {
    setBusy(req.id); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/push/one-to-one-decide', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ request_id: req.id, decision, coach_note: note }),
      });
      const json = await res.json().catch(() => ({ ok: false, error: `Server error (${res.status}).` }));
      if (!json.ok) throw new Error(json.error || 'Couldn\'t update that request.');
      setDeclineFor(null); setDeclineNote('');
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(null);
  };

  const shownRequests = requests
    .filter(r => filter === 'all' || ['requested', 'confirmed'].includes(r.status))
    .sort((a, b) => (a.status === 'requested' ? -1 : 0) - (b.status === 'requested' ? -1 : 0) || a.request_date.localeCompare(b.request_date));

  const inputCls = 'text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:border-[#A58D69]';

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f4f5f7' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Ticket size={20} style={{ color: GOLD }} /> 1:1 tokens</h1>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          Each 1:1 uses one token, counted over a rolling 30 days from the date of the session. Declined and cancelled
          requests give the token back. The allowance below is a placeholder until packages are set.
        </p>

        {error && <div className="mt-4 px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : (
          <>
            {/* ── Requests ── */}
            <div className="mt-6 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Requests</h2>
              <div className="flex gap-1">
                {[['open', 'Open'], ['all', 'All recent']].map(([k, l]) => (
                  <button
                    key={k} onClick={() => setFilter(k)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={filter === k ? { backgroundColor: GOLD, borderColor: GOLD, color: '#fff' } : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
                  >{l}</button>
                ))}
              </div>
            </div>
            <div className="mt-2 bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {shownRequests.length === 0 && <p className="px-4 py-6 text-sm text-gray-400 text-center">No {filter === 'open' ? 'open ' : ''}1:1 requests.</p>}
              {shownRequests.map(r => {
                const st = STATUS_STYLE[r.status] || STATUS_STYLE.requested;
                return (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-[180px]">
                        <p className="text-sm font-medium text-gray-900">{nameById.get(r.athlete_id) || r.athlete_id}</p>
                        <p className="text-xs text-gray-500">{dayLabel(r.request_date)}{r.request_time ? ` · asked for ${fmtTime(r.request_time)}` : ''}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: st.bg, color: st.fg }}>{st.label}</span>
                      <div className="flex gap-1.5">
                        {r.status === 'requested' && (
                          <>
                            <button disabled={busy === r.id} onClick={() => decide(r, 'confirmed')} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white disabled:opacity-50" style={{ backgroundColor: GOLD }}><Check size={12} /> Confirm</button>
                            <button disabled={busy === r.id} onClick={() => { setDeclineFor(declineFor === r.id ? null : r.id); setDeclineNote(''); }} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"><X size={12} /> Decline</button>
                          </>
                        )}
                        {r.status === 'confirmed' && (
                          <>
                            <button disabled={busy === r.id} onClick={() => decide(r, 'completed')} className="text-xs font-semibold px-3 py-1.5 rounded-md text-white disabled:opacity-50" style={{ backgroundColor: GOLD }}>Mark done</button>
                            <button disabled={busy === r.id} onClick={() => decide(r, 'cancelled')} className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                    {declineFor === r.id && (
                      <div className="mt-2 flex gap-2">
                        <input
                          value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} maxLength={200} autoFocus
                          placeholder="Optional: suggest another time, e.g. “How about 3pm?”"
                          className={`${inputCls} flex-1`}
                        />
                        <button disabled={busy === r.id} onClick={() => decide(r, 'declined', declineNote)} className="text-xs font-semibold px-3.5 rounded-md text-white bg-red-500 disabled:opacity-50">Decline &amp; tell them</button>
                      </div>
                    )}
                    {r.coach_note && <p className="text-[11px] text-gray-400 mt-1">Note: {r.coach_note}</p>}
                  </div>
                );
              })}
            </div>

            {/* ── Balances ── */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-gray-900">Token balances</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search athletes" className={`${inputCls} pl-8 py-1.5`} />
                </div>
                <span className="text-xs text-gray-500">Set everyone to</span>
                <input type="number" min="0" max="99" value={bulk} onChange={(e) => setBulk(e.target.value)} className={`${inputCls} w-16 py-1.5 text-center`} aria-label="Monthly tokens for everyone" />
                <button onClick={applyToAll} disabled={busy === 'bulk'} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-white disabled:opacity-50">Apply</button>
              </div>
            </div>
            <div className="mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_90px_70px_70px_130px] gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <span>Athlete</span><span>Monthly</span><span>Used</span><span>Left</span><span>Next back</span>
              </div>
              {rows.map(({ athlete, monthly, used, left, nextBack }) => (
                <div key={athlete.id} className="grid sm:grid-cols-[1fr_90px_70px_70px_130px] gap-x-3 items-center px-4 py-2 border-b border-gray-50 last:border-0 text-sm">
                  <span className="font-medium text-gray-900 truncate">{athlete.name} <span className="text-[11px] font-normal text-gray-400">{athlete.cohort}</span></span>
                  <input
                    type="number" min="0" max="99" defaultValue={monthly} key={`${athlete.id}-${monthly}`}
                    onBlur={(e) => saveAllowance(athlete.id, e.target.value)}
                    className="w-16 text-center text-sm rounded-md border border-gray-200 py-1 focus:outline-none focus:border-[#A58D69]"
                    aria-label={`Monthly tokens for ${athlete.name}`}
                  />
                  <span className="text-gray-600">{used}</span>
                  <span className={`font-semibold ${left === 0 ? 'text-red-600' : 'text-green-700'}`}>{left}</span>
                  <span className="text-xs text-gray-400">
                    {nextBack && used > 0 ? new Date(`${nextBack}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
