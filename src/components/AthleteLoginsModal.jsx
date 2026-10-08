import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Copy, Check, KeyRound, Loader2, ShieldCheck, Bell, BellOff, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePushStatus, sendTestPush } from '../hooks/usePushStatus';

const GOLD = '#A58D69';
const POLL_MS = 8000;

async function callAccounts(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('/api/athlete-auth/accounts', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  let json;
  try { json = await res.json(); } catch { json = { ok: false, error: `Server error (${res.status}).` }; }
  return json;
}

const ago = (iso) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

function inviteText({ name, username, password }, appUrl, reset = false) {
  const first = (name || '').split(' ')[0] || 'there';
  return [
    reset ? `Hi ${first}, here's a new first-time password for the ProPath app.` : `Hi ${first}, your ProPath app login is ready.`,
    '',
    `1. Open ${appUrl} on your phone`,
    `2. Username: ${username}`,
    `3. First-time password: ${password}`,
    '4. Choose your own password when it asks. When your phone offers to save it, tap Save — next time Face ID / fingerprint fills it in.',
    '5. Add the app to your Home Screen (iPhone: tap Share, then Add to Home Screen). Open it from the icon and sign in once more.',
    '6. Turn on notifications when asked, so you get messages and timetable updates.',
    '',
    "The first-time password stops working after 7 days if it isn't used.",
  ].join('\n');
}

/**
 * Coach tool: give athletes their login and reset forgotten passwords.
 *   • Create login → a username plus a random STARTING password, shown once. The
 *     athlete must choose their own on first sign-in (and it expires in 7 days
 *     if unused), so you only ever hold a throwaway password.
 *   • "Forgot your password?" on the athlete's phone lands here as a request.
 *     Confirm it's really them (message them), then reset: a new starting
 *     password is shown once — send it and the same first-sign-in process repeats.
 */
export default function AthleteLoginsModal({ athletes, onClose }) {
  const appUrl = `${window.location.origin}/athlete`;
  const [accounts, setAccounts] = useState(null);   // { athleteId: { username } }
  const [requests, setRequests] = useState([]);     // reset requests waiting for a coach
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(null);        // { done, total } while a bulk run is going
  const [confirmAll, setConfirmAll] = useState(false);
  const [issued, setIssued] = useState([]);         // starting passwords just generated
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [busyId, setBusyId] = useState(null);       // athlete id currently being reset
  const [confirmReset, setConfirmReset] = useState(null);
  const push = usePushStatus(true);                 // who can receive notifications
  const [testState, setTestState] = useState({});   // athleteId → message

  const runTest = async (athleteId) => {
    setTestState(prev => ({ ...prev, [athleteId]: 'Sending…' }));
    const r = await sendTestPush(athleteId);
    const msg = !r.ok ? (r.error || 'Couldn’t send.')
      : r.total === 0 ? 'No device registered — they need to turn notifications on.'
        : r.sent > 0 ? `Sent to ${r.sent} device${r.sent === 1 ? '' : 's'} — check their phone.`
          : 'Device found but the push failed — ask them to reopen the app.';
    setTestState(prev => ({ ...prev, [athleteId]: msg }));
    push.refresh();
  };

  const sorted = useMemo(
    () => [...athletes].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [athletes]
  );
  const nameById = useMemo(() => new Map(athletes.map(a => [a.id, a.name])), [athletes]);

  const load = useCallback(async () => {
    const json = await callAccounts({ action: 'list' });
    if (!json.ok) { setLoadError(json.error || 'Could not load accounts.'); return null; }
    setLoadError(null);
    setAccounts(json.accounts || {});
    setRequests(json.requests || []);
    return json.accounts || {};
  }, []);

  useEffect(() => {
    load().then((acc) => {
      if (!acc) return;
      setSelected(new Set(sorted.filter(a => !acc[a.id]).map(a => a.id)));
    });
    // Keep the request list fresh while the panel is open.
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const remember = (rows) => setIssued(prev => [...rows, ...prev.filter(p => !rows.some(r => r.athlete_id === p.athlete_id))]);

  // Runs in small batches so each request stays quick (creating an account takes a moment each).
  const BATCH = 8;
  const runBatches = async (ids, resetExisting) => {
    setWorking(true); setError(null); setProgress({ done: 0, total: ids.length });
    const failures = [];
    for (let i = 0; i < ids.length; i += BATCH) {
      const json = await callAccounts({ action: 'provision', athlete_ids: ids.slice(i, i + BATCH), reset_existing: resetExisting });
      if (!json.ok) { failures.push(json.error || 'Something went wrong.'); break; }
      const done = json.results.filter(r => r.password);
      remember(done.map(m => ({ ...m, reset: m.status === 'reset' })));
      failures.push(...json.results.filter(r => r.status === 'error').map(r => `${r.name || r.athlete_id}: ${r.error}`));
      setSelected(prev => { const next = new Set(prev); done.forEach(m => next.delete(m.athlete_id)); return next; });
      setProgress({ done: Math.min(i + BATCH, ids.length), total: ids.length });
    }
    setWorking(false); setProgress(null);
    if (failures.length) setError(failures.join(' · '));
    await load();
  };

  const create = (ids) => runBatches(ids, false);

  // "Start again": every athlete gets a fresh first-time password — new logins are
  // created, existing ones are re-issued (their old password stops working).
  const startAgain = async () => {
    setConfirmAll(false);
    await runBatches(sorted.map(a => a.id), true);
  };

  const downloadCsv = () => {
    const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const rows = [['Name', 'Username', 'First-time password', 'App address'], ...issued.map(c => [c.name, c.username, c.password, appUrl])];
    const blob = new Blob([rows.map(r => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `propath-logins-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  const reset = async (athleteId) => {
    setBusyId(athleteId); setConfirmReset(null); setError(null);
    const json = await callAccounts({ action: 'issue-temp', athlete_id: athleteId });
    setBusyId(null);
    if (!json.ok) { setError(json.error || 'Couldn’t reset that password.'); return; }
    remember([{ athlete_id: athleteId, name: json.name, username: json.username, password: json.password, reset: true }]);
    await load();
  };

  const dismiss = async (req) => {
    await callAccounts({ action: 'deny', request_id: req.id });
    load();
  };

  const copy = async (key, text) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked — text is on screen */ }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const toCreate = [...selected].filter(id => accounts && !accounts[id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Athlete app logins</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Athletes sign in at <span className="font-medium">{appUrl}</span> with a username and a starting password
              you send them. They choose their own password the first time they sign in.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto">
          {/* ── Forgot-password requests ── */}
          {requests.length > 0 && (
            <div className="mb-4 rounded-xl border p-3" style={{ borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)' }}>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
                <ShieldCheck size={14} style={{ color: '#d97706' }} /> Password reset requests ({requests.length})
              </p>
              <p className="text-[11px] text-gray-600 mb-2.5">
                These athletes tapped &ldquo;Forgot your password?&rdquo;. Check it&rsquo;s really them first (message them) —
                resetting stops their old password working straight away.
              </p>
              <div className="space-y-2">
                {requests.map(r => (
                  <div key={r.id} className="bg-white rounded-lg px-3 py-2 border border-gray-100 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{nameById.get(r.athlete_id) || r.username}</p>
                      <p className="text-[11px] text-gray-400">requested {ago(r.created_at)} · {r.username}</p>
                    </div>
                    <button
                      onClick={() => reset(r.athlete_id)} disabled={busyId === r.athlete_id}
                      className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md text-white disabled:opacity-50"
                      style={{ backgroundColor: GOLD }}
                    >
                      {busyId === r.athlete_id ? 'Resetting…' : 'Reset & get new password'}
                    </button>
                    <button onClick={() => dismiss(r)} className="shrink-0 text-xs text-gray-500 hover:text-red-600 px-1.5">Dismiss</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Starting passwords just generated — shown once ── */}
          {issued.length > 0 && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">First-time passwords — send these now ({issued.length})</p>
                <div className="flex gap-1.5">
                <button onClick={downloadCsv} className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white">Download list</button>
                <button
                  onClick={() => copy('all', issued.map(c => `${c.name}\n${inviteText(c, appUrl, c.reset)}`).join('\n\n---\n\n'))}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  {copied === 'all' ? <Check size={12} /> : <Copy size={12} />} Copy all
                </button>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 mb-2">
                Shown only once. Each athlete is made to choose their own password when they first sign in.
                Send each person their own message privately.
              </p>
              <div className="space-y-1.5">
                {issued.map(c => (
                  <div key={c.athlete_id} className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}{c.reset && <span className="ml-1.5 text-[10px] font-semibold text-amber-600">RESET</span>}</p>
                      <p className="text-xs text-gray-500 font-mono truncate">{c.username} · {c.password}</p>
                    </div>
                    <button
                      onClick={() => copy(c.athlete_id, inviteText(c, appUrl, c.reset))}
                      className="shrink-0 flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50"
                      aria-label={`Copy message for ${c.name}`}
                    >
                      {copied === c.athlete_id ? <Check size={13} /> : <Copy size={13} />} Copy message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-xs text-red-600">{error}</div>}
          {loadError && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-xs text-red-600">
              {loadError} {import.meta.env.DEV && '(The login API only runs on the deployed site, not the local dev server.)'}
            </div>
          )}

          {accounts && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm font-semibold text-gray-900">Start again for everyone</p>
              <p className="text-[11px] text-gray-500 mt-0.5 mb-2.5">
                Gives all {sorted.length} athletes a username and a fresh first-time password in one go — creating logins for anyone
                without one, and re-issuing anyone who already has one (their old password stops working). You then copy or
                download the list and send each person their own details.
              </p>
              {working && progress ? (
                <p className="text-xs text-gray-600 flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Setting up… {progress.done} of {progress.total}</p>
              ) : confirmAll ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-red-600 font-medium">
                    This resets {Object.keys(accounts).length} existing login{Object.keys(accounts).length === 1 ? '' : 's'} and creates {Math.max(0, sorted.length - Object.keys(accounts).length)} new.
                  </span>
                  <button onClick={startAgain} className="text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-red-500">Yes, do it</button>
                  <button onClick={() => setConfirmAll(false)} className="text-xs text-gray-500 px-1.5">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmAll(true)} disabled={working} className="text-xs font-semibold px-3.5 py-2 rounded-md text-white disabled:opacity-50" style={{ backgroundColor: GOLD }}>
                  Set up everyone
                </button>
              )}
            </div>
          )}

          {!accounts && !loadError && (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
          )}

          {accounts && (
            <div className="space-y-1">
              {sorted.map(a => {
                const acc = accounts[a.id];
                return (
                  <div key={a.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
                    {acc ? (
                      <KeyRound size={14} className="text-green-600 shrink-0" />
                    ) : (
                      <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="shrink-0" aria-label={`Select ${a.name}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{a.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {acc ? `Username: ${acc.username || 'set up'}` : 'No login yet'}
                        {acc?.awaiting_first_signin && (
                          <span className="ml-1.5 font-semibold text-amber-600">· waiting for first sign-in</span>
                        )}
                      </p>
                    </div>
                    {acc && (
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: push.devices[a.id] ? '#15803d' : '#9ca3af' }}
                          title={push.devices[a.id] ? 'Can receive lock-screen notifications' : 'Has not turned notifications on'}
                        >
                          {push.devices[a.id] ? <Bell size={11} /> : <BellOff size={11} />}
                          {push.devices[a.id] ? 'Alerts on' : 'No alerts'}
                        </span>
                        <button onClick={() => runTest(a.id)} className="text-[11px] text-gray-500 hover:text-gray-900 underline underline-offset-2">
                          Send test
                        </button>
                        {testState[a.id] && <span className="text-[10px] text-gray-500 max-w-[170px] text-right leading-tight">{testState[a.id]}</span>}
                      </div>
                    )}
                    {acc && (confirmReset === a.id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => reset(a.id)} className="text-xs font-semibold px-2 py-1 rounded text-white bg-red-500">Yes, reset</button>
                        <button onClick={() => setConfirmReset(null)} className="text-xs text-gray-500 px-1.5">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmReset(a.id)} disabled={busyId === a.id}
                        className="shrink-0 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        <RotateCcw size={11} /> Reset password
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {accounts && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {toCreate.length} selected · {Object.keys(accounts).length} already have a login
            </p>
            <button
              disabled={working || toCreate.length === 0}
              onClick={() => create(toCreate)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: GOLD }}
            >
              {working && <Loader2 size={14} className="animate-spin" />}
              Create {toCreate.length || ''} login{toCreate.length === 1 ? '' : 's'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
