import { useState } from 'react';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';

/**
 * First-time account setup — shown once, inside the ORIGINAL token
 * link (/athlete/:token), before redirecting to the stable /athlete
 * URL. That ordering matters: install-to-home-screen has to happen
 * from the stable URL for the iOS fix to hold, so this screen ends by
 * sending the athlete there rather than rendering the app directly.
 *
 * Creates a real Supabase Auth account server-side (api/athlete-auth/
 * setup.js — synthetic email, the PIN as a real password), then signs
 * in with it directly from the client, same call the coach login uses.
 */
export default function AthletePinSetup({ athleteName, token, suggestedUsername = '' }) {
  const [username, setUsername] = useState(suggestedUsername);
  const [pin, setPin]           = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);

  const digitsOnly = (v) => v.replace(/\D/g, '').slice(0, 8);

  const submit = async () => {
    if (username.trim().length < 3) { setError('Username needs to be at least 3 characters.'); return; }
    if (pin.length < 6) { setError('PIN needs to be at least 6 digits.'); return; }
    if (pin !== confirmPin) { setError("PINs don't match — try again."); setConfirmPin(''); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/athlete-auth/setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, username, pin }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Could not set up your account.');

      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: json.email, password: pin });
      if (signInErr) throw signInErr;

      window.location.replace('/athlete');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />
      <h1 className="text-h2 font-bold text-ink-900 mb-2">Hi {athleteName?.split(' ')[0] || 'there'} 👋</h1>
      <p className="text-meta text-ink-500 mb-6 max-w-xs">
        {suggestedUsername
          ? "We've picked a username for you below — change it if you'd like. Then choose a 6-digit PIN so you can open ProPath from your home screen without this link."
          : 'Pick a username and a 6-digit PIN so you can open ProPath from your home screen without this link.'}
      </p>

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
          onChange={(e) => setPin(digitsOnly(e.target.value))}
          placeholder="PIN (6 digits)"
          className="w-full text-center text-2xl tracking-[0.4em] rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
        />
        <input
          type="password"
          inputMode="numeric"
          value={confirmPin}
          onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Confirm PIN"
          className="w-full text-center text-2xl tracking-[0.4em] rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
        />
      </div>

      {error && <p className="text-meta text-red-600 mb-3">{error}</p>}

      <button
        onClick={submit}
        disabled={saving}
        className="w-full max-w-xs rounded-md py-3 text-body font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: GOLD }}
      >
        {saving ? 'Setting up…' : 'Continue'}
      </button>

      <p className="text-micro text-ink-400 mt-4 max-w-xs">
        Remember your username and PIN — you'll need them to sign in on a new device.
      </p>
    </div>
  );
}
