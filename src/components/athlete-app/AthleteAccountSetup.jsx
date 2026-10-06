import { useCallback, useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';
const MIN_LENGTH = 8;
const STORAGE_KEY = 'propath_setup_request';
const POLL_MS = 3000;

async function post(action, payload) {
  try {
    const res = await fetch(`/api/athlete-auth/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (_) {
    return { ok: false, error: 'Couldn\'t reach the server — check your connection.' };
  }
}

function loadSaved() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    return saved && new Date(saved.expires_at) > new Date() ? saved : null;
  } catch (_) { return null; }
}
function save(v) {
  try { v ? sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v)) : sessionStorage.removeItem(STORAGE_KEY); }
  catch (_) { /* private mode — flow still works until reload */ }
}

const inputCls = 'w-full text-center text-lg rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500';

/**
 * "First time here, or forgot your password?" — the only way an athlete sets
 * a password, and coaches never see it:
 *   1. enter username → a 6-digit code appears
 *   2. send the code to a coach (WhatsApp etc.); they approve it in the coach app
 *   3. choose a password (new + confirm) → signed in
 */
export default function AthleteAccountSetup({ onBack }) {
  const [req, setReq] = useState(loadSaved);          // { request_id, claim_token, code, expires_at, username }
  const [step, setStep] = useState(() => (loadSaved() ? 'waiting' : 'username'));
  const [username, setUsername] = useState(() => loadSaved()?.username || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const restart = useCallback((message) => {
    save(null);
    setReq(null);
    setPassword(''); setConfirm('');
    setStep('username');
    setError(message || null);
  }, []);

  // Poll for the coach's approval while the code is on screen.
  useEffect(() => {
    if (step !== 'waiting' || !req) return undefined;
    let stopped = false;
    const check = async () => {
      const r = await post('setup-status', { request_id: req.request_id, claim_token: req.claim_token });
      if (stopped || !r.ok) return;
      if (r.status === 'approved') setStep('password');
      else if (['expired', 'denied', 'used'].includes(r.status)) {
        restart(r.status === 'denied' ? 'Your coach declined that request — check with them and try again.' : 'That code expired — start again.');
      }
    };
    check();
    const t = setInterval(check, POLL_MS);
    return () => { stopped = true; clearInterval(t); };
  }, [step, req, restart]);

  const requestCode = async (e) => {
    e.preventDefault();
    if (!username.trim() || busy) return;
    setBusy(true); setError(null);
    const r = await post('request-setup', { username: username.trim().toLowerCase() });
    setBusy(false);
    if (!r.ok) { setError(r.error || 'Something went wrong — try again.'); return; }
    const saved = { ...r, username: username.trim().toLowerCase() };
    save(saved);
    setReq(saved);
    setStep('waiting');
  };

  const setNewPassword = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < MIN_LENGTH) { setError(`Use at least ${MIN_LENGTH} characters.`); return; }
    if (password !== confirm) { setError('The two passwords don\'t match.'); return; }
    setBusy(true); setError(null);
    const r = await post('complete-setup', { request_id: req.request_id, claim_token: req.claim_token, password });
    if (!r.ok) {
      setBusy(false);
      if (/expired|start again|valid/i.test(r.error || '')) restart(r.error); else setError(r.error);
      return;
    }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: r.email, password });
    save(null);
    if (signInErr) {
      setBusy(false);
      restart('Password saved — now sign in with your username and new password.');
      onBack();
    }
    // On success AthleteStableEntry's auth listener takes over.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />

      {step === 'username' && (
        <>
          <h1 className="text-h2 font-bold text-ink-900 mb-2">Set up or reset your password</h1>
          <p className="text-meta text-ink-500 mb-6 max-w-xs">
            Enter the username your coach gave you. You'll get a short code to send them so they can confirm it's you.
          </p>
          <form onSubmit={requestCode} className="w-full max-w-xs">
            <input
              type="text" name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Username" className={`${inputCls} mb-4`}
            />
            {error && <p className="text-meta text-red-600 mb-3" role="alert">{error}</p>}
            <button
              type="submit" disabled={busy || !username.trim()}
              className="w-full rounded-md py-3 text-body font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: GOLD }}
            >
              {busy ? 'One moment…' : 'Get my code'}
            </button>
          </form>
        </>
      )}

      {step === 'waiting' && req && (
        <>
          <h1 className="text-h2 font-bold text-ink-900 mb-2">Send this code to your coach</h1>
          <p className="text-meta text-ink-500 mb-5 max-w-xs">
            Message it to them (WhatsApp, text, in person). Once they approve it, this screen moves on by itself.
          </p>
          <p
            className="text-4xl font-bold tracking-[0.3em] text-ink-900 bg-white rounded-2xl border border-ink-200 px-6 py-4 mb-5"
            aria-label={`Your code is ${req.code.split('').join(' ')}`}
          >
            {req.code}
          </p>
          <p className="text-meta text-ink-400 flex items-center gap-2 mb-6">
            <Loader2 size={14} className="animate-spin" /> Waiting for your coach to approve…
          </p>
          <button onClick={() => restart()} className="text-meta font-semibold" style={{ color: GOLD }}>
            Start again
          </button>
        </>
      )}

      {step === 'password' && req && (
        <>
          <h1 className="text-h2 font-bold text-ink-900 mb-2">Choose your password</h1>
          <p className="text-meta text-ink-500 mb-6 max-w-xs">
            Approved! Pick a password only you know — your phone will offer to remember it.
          </p>
          <form onSubmit={setNewPassword} className="w-full max-w-xs">
            <input type="text" name="username" autoComplete="username" value={req.username} readOnly hidden />
            <div className="space-y-3 mb-4">
              <input
                type="password" name="new-password" autoComplete="new-password" autoFocus
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="New password" className={inputCls}
              />
              <input
                type="password" name="confirm-password" autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password" className={inputCls}
              />
            </div>
            {error && <p className="text-meta text-red-600 mb-3" role="alert">{error}</p>}
            <button
              type="submit" disabled={busy || !password || !confirm}
              className="w-full rounded-md py-3 text-body font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: GOLD }}
            >
              {busy ? 'Saving…' : 'Save password & sign in'}
            </button>
          </form>
          <p className="text-micro text-ink-400 mt-5 max-w-xs">At least {MIN_LENGTH} characters.</p>
        </>
      )}

      {step !== 'password' && (
        <button onClick={onBack} className="mt-8 inline-flex items-center gap-1.5 text-meta text-ink-500">
          <ArrowLeft size={14} /> Back to sign in
        </button>
      )}
    </div>
  );
}
