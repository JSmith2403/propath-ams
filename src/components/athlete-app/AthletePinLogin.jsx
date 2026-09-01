import { useState } from 'react';
import logo from '../../assets/Propath_Primary Logo_Black.png';

const GOLD = '#A58D69';

/**
 * Login screen for the stable /athlete URL when no valid session is
 * stored on this device yet (new device, cleared storage, or never
 * set up). Asks for the login ID + PIN issued during AthletePinSetup.
 */
export default function AthletePinLogin({ onLoggedIn }) {
  const [loginCode, setLoginCode] = useState('');
  const [pin, setPin]             = useState('');
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!loginCode.trim() || pin.length < 4) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/athlete-auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ loginCode: loginCode.trim(), pin }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Sign in failed.');
      onLoggedIn(json.sessionToken, json.athlete);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />
      <h1 className="text-h2 font-bold text-ink-900 mb-6">Sign in</h1>

      <div className="w-full max-w-xs space-y-3 mb-4">
        <input
          type="text"
          autoCapitalize="characters"
          autoFocus
          value={loginCode}
          onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
          placeholder="Login ID"
          className="w-full text-center text-lg tracking-widest rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
        />
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="PIN"
          className="w-full text-center text-2xl tracking-[0.5em] rounded-xl border border-ink-200 py-3 focus:outline-none focus:border-gold-500"
        />
      </div>

      {error && <p className="text-meta text-red-600 mb-3">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || !loginCode.trim() || pin.length < 4}
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
