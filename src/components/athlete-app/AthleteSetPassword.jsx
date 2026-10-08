import { useState } from 'react';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';
const MIN_LENGTH = 8;

/**
 * Shown straight after signing in with a coach-issued starting password (new
 * login, or a reset). The athlete must choose their own before they see
 * anything — new + confirm. new-password autocomplete lets the phone offer to
 * save it (and fill it with Face ID next time). Clearing the
 * must_change_password flag lets them through.
 */
export default function AthleteSetPassword({ username, onDone, onSignOut }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (password.length < MIN_LENGTH) { setError(`Use at least ${MIN_LENGTH} characters.`); return; }
    if (password.toLowerCase() === (username || '').toLowerCase()) { setError('Your password can\'t be the same as your username.'); return; }
    if (password !== confirm) { setError('The two passwords don\'t match.'); return; }
    setSaving(true);
    setError(null);
    const { error: updErr } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false, temp_password_expires_at: null, temp_password_expired: false },
    });
    if (updErr) {
      setError(/same|different/i.test(updErr.message || '')
        ? 'Choose a different password to the starting one your coach gave you.'
        : (updErr.message || 'Couldn\'t save your password — try again.'));
      setSaving(false);
      return;
    }
    // Chrome / Android: offer the new password to the password manager directly.
    // (Safari on iPhone offers to save it itself when the form is submitted.)
    try {
      if (window.PasswordCredential && navigator.credentials?.store) {
        await navigator.credentials.store(new window.PasswordCredential({ id: username, password, name: username }));
      }
    } catch (_) { /* optional nicety */ }
    onDone();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />
      <h1 className="text-h2 font-bold text-ink-900 mb-2">Choose your own password</h1>
      <p className="text-meta text-ink-500 mb-6 max-w-xs">
        The password your coach sent was just to get you in. Pick one only you know — your phone will offer to remember it.
      </p>

      <form onSubmit={submit} className="w-full max-w-xs">
        {/* Hidden username lets password managers save the new password against the right account. */}
        <input type="text" name="username" autoComplete="username" value={username || ''} readOnly hidden />
        <div className="space-y-3 mb-4">
          <input
            type="password" name="new-password" autoComplete="new-password" autoFocus
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full text-center text-lg rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
          />
          <input
            type="password" name="confirm-password" autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full text-center text-lg rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
          />
        </div>

        {error && <p className="text-meta text-red-600 mb-3" role="alert">{error}</p>}

        <button
          type="submit" disabled={saving || !password || !confirm}
          className="w-full rounded-md py-3 text-body font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: GOLD }}
        >
          {saving ? 'Saving…' : 'Save password & continue'}
        </button>
      </form>

      <p className="text-micro text-ink-400 mt-5 max-w-xs">At least {MIN_LENGTH} characters.</p>
      <button onClick={onSignOut} className="mt-4 text-micro text-ink-400 underline underline-offset-2">Sign out</button>
    </div>
  );
}
