import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Copy, Check, KeyRound, Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOLD = '#A58D69';

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

function credentialText(r, appUrl) {
  return `${r.name}\nApp: ${appUrl}\nUsername: ${r.username}\nPassword: ${r.password}`;
}

/**
 * Coach tool: give every athlete their own real login (username + generated
 * password) in one go, and reset a password when someone forgets it.
 * Passwords are shown once, here, straight after they're generated.
 */
export default function AthleteLoginsModal({ athletes, onClose }) {
  const appUrl = `${window.location.origin}/athlete`;
  const [accounts, setAccounts] = useState(null);   // { athleteId: { username } }
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [working, setWorking] = useState(false);
  const [results, setResults] = useState([]);       // credentials just issued
  const [error, setError] = useState(null);
  const [confirmReset, setConfirmReset] = useState(null);
  const [copied, setCopied] = useState(null);

  const sorted = useMemo(
    () => [...athletes].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [athletes]
  );

  const load = useCallback(async () => {
    const json = await callAccounts({ action: 'list' });
    if (!json.ok) { setLoadError(json.error || 'Could not load accounts.'); return; }
    setLoadError(null);
    setAccounts(json.accounts || {});
    return json.accounts || {};
  }, []);

  useEffect(() => {
    load().then((acc) => {
      if (!acc) return;
      setSelected(new Set(sorted.filter(a => !acc[a.id]).map(a => a.id)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const provision = async (ids, reset = false) => {
    setWorking(true);
    setError(null);
    const json = await callAccounts({ action: 'provision', athlete_ids: ids, reset });
    setWorking(false);
    if (!json.ok) { setError(json.error || 'Something went wrong.'); return; }
    const issued = json.results.filter(r => r.password);
    const failed = json.results.filter(r => r.status === 'error');
    setResults(prev => [...issued, ...prev.filter(p => !issued.some(i => i.athlete_id === p.athlete_id))]);
    if (failed.length) setError(failed.map(f => `${f.name || f.athlete_id}: ${f.error}`).join(' · '));
    setSelected(prev => { const next = new Set(prev); issued.forEach(i => next.delete(i.athlete_id)); return next; });
    await load();
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
              Each athlete gets their own username and password for <span className="font-medium">{appUrl}</span>
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto">
          {results.length > 0 && (
            <div className="mb-4 rounded-xl border p-3" style={{ borderColor: GOLD, backgroundColor: 'rgba(165,141,105,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">New logins — copy these now</p>
                <button
                  onClick={() => copy('all', results.map(r => credentialText(r, appUrl)).join('\n\n'))}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  {copied === 'all' ? <Check size={12} /> : <Copy size={12} />} Copy all
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">Passwords are only shown once. Send each athlete their own details privately.</p>
              <div className="space-y-1.5">
                {results.map(r => (
                  <div key={r.athlete_id} className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{r.username} · {r.password}</p>
                    </div>
                    <button
                      onClick={() => copy(r.athlete_id, credentialText(r, appUrl))}
                      className="shrink-0 p-1.5 rounded hover:bg-gray-100 text-gray-500"
                      aria-label={`Copy login for ${r.name}`}
                    >
                      {copied === r.athlete_id ? <Check size={14} /> : <Copy size={14} />}
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
                      <p className="text-[11px] text-gray-400">{acc ? `Login: ${acc.username || 'set up'}` : 'No login yet'}</p>
                    </div>
                    {acc && (confirmReset === a.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={working}
                          onClick={() => { setConfirmReset(null); provision([a.id], true); }}
                          className="text-xs font-semibold px-2 py-1 rounded text-white bg-red-500"
                        >Yes, reset</button>
                        <button onClick={() => setConfirmReset(null)} className="text-xs text-gray-500 px-1.5">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmReset(a.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
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
              onClick={() => provision(toCreate)}
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
