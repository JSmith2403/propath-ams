import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Copy, Check, KeyRound, Loader2, ShieldCheck, Bell, BellOff } from 'lucide-react';
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

function inviteText(name, username, appUrl) {
  const first = (name || '').split(' ')[0] || 'there';
  return [
    `Hi ${first}, your ProPath app login is ready.`,
    '',
    `1. Open ${appUrl} on your phone`,
    `2. Your username is: ${username}`,
    `3. Tap "First time here, or forgot your password?", enter your username and send me the 6-digit code it shows. I'll approve it and you can choose your own password.`,
    '4. Then add the app to your Home Screen.',
  ].join('\n');
}

/**
 * Coach tool: give every athlete their own login and approve their
 * set-password requests. Coaches only ever deal with USERNAMES — the athlete
 * chooses their own password, after a coach confirms the 6-digit code shown on
 * the athlete's screen. Passwords are never generated, shown or stored here.
 */
export default function AthleteLoginsModal({ athletes, onClose }) {
  const appUrl = `${window.location.origin}/athlete`;
  const [accounts, setAccounts] = useState(null);   // { athleteId: { username } }
  const [requests, setRequests] = useState([]);     // pending / approved set-password requests
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [working, setWorking] = useState(false);
  const [created, setCreated] = useState([]);       // logins just created
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [codes, setCodes] = useState({});           // requestId → typed code
  const [approving, setApproving] = useState(null);
  const [requestError, setRequestError] = useState({}); // requestId → message
  const push = usePushStatus(true);                    // who can receive notifications
  const [testState, setTestState] = useState({});       // athleteId → message

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

  const create = async (ids) => {
    setWorking(true);
    setError(null);
    const json = await callAccounts({ action: 'provision', athlete_ids: ids });
    setWorking(false);
    if (!json.ok) { setError(json.error || 'Something went wrong.'); return; }
    const made = json.results.filter(r => r.status === 'created');
    const failed = json.results.filter(r => r.status === 'error');
    setCreated(prev => [...made, ...prev.filter(p => !made.some(m => m.athlete_id === p.athlete_id))]);
    if (failed.length) setError(failed.map(f => `${f.name || f.athlete_id}: ${f.error}`).join(' · '));
    setSelected(prev => { const next = new Set(prev); made.forEach(m => next.delete(m.athlete_id)); return next; });
    await load();
  };

  const decide = async (req, action) => {
    setApproving(req.id);
    setRequestError(prev => ({ ...prev, [req.id]: null }));
    const json = await callAccounts({ action, request_id: req.id, code: codes[req.id] || '' });
    setApproving(null);
    if (!json.ok) { setRequestError(prev => ({ ...prev, [req.id]: json.error || 'Couldn\'t do that.' })); return; }
    await load();
  };

  const copy = async (key, text) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked — text is on screen */ }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const toCreate = [...selected].filter(id => accounts && !accounts[id]);
  const waiting = requests.filter(r => r.status === 'pending');
  const approved = requests.filter(r => r.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Athlete app logins</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Athletes sign in at <span className="font-medium">{appUrl}</span>. You give them a username —
              they choose their own password.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto">
          {/* ── Waiting for a coach to approve a code ── */}
          {(waiting.length > 0 || approved.length > 0) && (
            <div className="mb-4 rounded-xl border p-3" style={{ borderColor: GOLD, backgroundColor: 'rgba(165,141,105,0.08)' }}>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
                <ShieldCheck size={14} style={{ color: GOLD }} /> Password requests
              </p>
              <p className="text-[11px] text-gray-500 mb-2.5">
                An athlete is setting up (or resetting) their password. Ask them for the 6-digit code on their screen
                — only approve a code they've sent <em>you</em>.
              </p>
              <div className="space-y-2">
                {waiting.map(r => (
                  <div key={r.id} className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {nameById.get(r.athlete_id) || r.username}
                      <span className="text-xs text-gray-400 font-normal"> · {r.username}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        inputMode="numeric" maxLength={6} placeholder="6-digit code"
                        value={codes[r.id] || ''}
                        onChange={(e) => setCodes(prev => ({ ...prev, [r.id]: e.target.value.replace(/\D/g, '') }))}
                        className="w-32 text-center tracking-widest font-mono text-sm rounded-lg border border-gray-200 py-1.5 focus:outline-none focus:border-[#A58D69]"
                      />
                      <button
                        disabled={approving === r.id || (codes[r.id] || '').length !== 6}
                        onClick={() => decide(r, 'approve')}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md text-white disabled:opacity-50"
                        style={{ backgroundColor: GOLD }}
                      >
                        {approving === r.id ? 'Checking…' : 'Approve'}
                      </button>
                      <button
                        disabled={approving === r.id}
                        onClick={() => decide(r, 'deny')}
                        className="text-xs text-gray-500 hover:text-red-600 px-2 py-1.5"
                      >
                        Decline
                      </button>
                    </div>
                    {requestError[r.id] && <p className="text-[11px] text-red-600 mt-1">{requestError[r.id]}</p>}
                  </div>
                ))}
                {approved.map(r => (
                  <p key={r.id} className="text-xs text-gray-600 px-1">
                    <Check size={12} className="inline text-green-600 mr-1" />
                    {nameById.get(r.athlete_id) || r.username} approved — waiting for them to choose a password.
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ── Just created ── */}
          {created.length > 0 && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">New logins created</p>
                <button
                  onClick={() => copy('all', created.map(c => `${c.name}\n${inviteText(c.name, c.username, appUrl)}`).join('\n\n---\n\n'))}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  {copied === 'all' ? <Check size={12} /> : <Copy size={12} />} Copy all invites
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">
                Send each athlete their invite (it contains their username only). They set their own password.
              </p>
              <div className="space-y-1.5">
                {created.map(c => (
                  <div key={c.athlete_id} className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{c.username}</p>
                    </div>
                    <button
                      onClick={() => copy(c.athlete_id, inviteText(c.name, c.username, appUrl))}
                      className="shrink-0 p-1.5 rounded hover:bg-gray-100 text-gray-500"
                      aria-label={`Copy invite for ${c.name}`}
                    >
                      {copied === c.athlete_id ? <Check size={14} /> : <Copy size={14} />}
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
                      <p className="text-[11px] text-gray-400">{acc ? `Username: ${acc.username || 'set up'}` : 'No login yet'}</p>
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
                    {acc?.username && (
                      <button
                        onClick={() => copy(`row-${a.id}`, inviteText(a.name, acc.username, appUrl))}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        {copied === `row-${a.id}` ? <Check size={11} /> : <Copy size={11} />} Copy invite
                      </button>
                    )}
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
