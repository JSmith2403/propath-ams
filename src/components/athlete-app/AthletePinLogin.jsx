import { useState } from 'react';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';
const ATHLETE_EMAIL_DOMAIN = 'athletes.propath.internal';

/**
 * Login screen for the stable /athlete URL when there's no active
 * Supabase session (new device, signed out, cleared storage). Calls
 * supabase.auth.signInWithPassword() directly — the exact mechanism
 * the coach login already uses — with a synthetic email built from
 * the entered username, so the athlete never sees "email" at all.
 *
 * It's a real <form> with username / current-password autocomplete hints
 * so iOS Keychain and Android/Chrome offer to save the details on first
 * sign-in and fill them with Face ID / fingerprint afterwards.
 *
 * A successful sign-in fires Supabase's own onAuthStateChange, which
 * AthleteStableEntry is already listening for — this component doesn't
 * need to do anything else once the call succeeds.
 */
export default function AthletePinLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = username.trim() && password.trim().length >= 6;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    const email = `${username.trim().toLowerCase()}@${ATHLETE_EMAIL_DOMAIN}`;
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: password.trim() });
    if (signInErr) {
      setError(/network|fetch/i.test(signInErr.message || '')
        ? 'Couldn\'t reach the server — check your connection and try again.'
        : 'Incorrect username or password.');
      setSubmitting(false);
    }
    // On success, onAuthStateChange in AthleteStableEntry takes it from here.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />
      <h1 className="text-h2 font-bold text-ink-900 mb-6">Sign in</h1>

      <form onSubmit={submit} className="w-full max-w-xs">
        <div className="space-y-3 mb-4">
          <input
            type="text"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full text-center text-lg rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full text-center text-lg rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
          />
        </div>

        {error && <p className="text-meta text-red-600 mb-3" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="w-full rounded-md py-3 text-body font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: GOLD }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-micro text-ink-400 mt-6 max-w-xs">
        When your phone offers to save your password, say yes — next time you
        can sign in with Face ID. Forgotten it? Ask your coach for a reset.
      </p>
    </div>
  );
}
