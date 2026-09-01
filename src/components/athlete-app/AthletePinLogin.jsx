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
 * A successful sign-in fires Supabase's own onAuthStateChange, which
 * AthleteStableEntry is already listening for — this component doesn't
 * need to do anything else once the call succeeds.
 */
export default function AthletePinLogin() {
  const [username, setUsername] = useState('');
  const [pin, setPin]             = useState('');
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!username.trim() || pin.length < 6) return;
    setSubmitting(true);
    setError(null);
    const email = `${username.trim().toLowerCase()}@${ATHLETE_EMAIL_DOMAIN}`;
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: pin });
    if (signInErr) {
      setError('Incorrect username or PIN.');
      setSubmitting(false);
    }
    // On success, onAuthStateChange in AthleteStableEntry takes it from here.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />
      <h1 className="text-h2 font-bold text-ink-900 mb-6">Sign in</h1>

      <div className="w-full max-w-xs space-y-3 mb-4">
        <input
          type="text"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full text-center text-lg rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
        />
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="PIN"
          className="w-full text-center text-2xl tracking-[0.4em] rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
        />
      </div>

      {error && <p className="text-meta text-red-600 mb-3">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || !username.trim() || pin.length < 6}
        className="w-full max-w-xs rounded-md py-3 text-body font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: GOLD }}
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-micro text-ink-400 mt-6 max-w-xs">
        Forgotten your PIN? Ask your coach to reset it.
      </p>
    </div>
  );
}
