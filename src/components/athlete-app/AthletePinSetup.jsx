import { useState } from 'react';
import logo from '../../assets/Propath_Primary Logo_Black.png';

const GOLD = '#A58D69';

/**
 * First-time PIN setup — shown once, inside the ORIGINAL token link
 * (/athlete/:token), before redirecting to the stable /athlete URL.
 * That ordering matters: install-to-home-screen has to happen from the
 * stable URL for the iOS fix to hold, so this screen ends by sending
 * the athlete there rather than rendering the app directly.
 */
export default function AthletePinSetup({ athleteName, sessionToken, onSetupError }) {
  const [step, setStep]       = useState('choose'); // choose | confirm | code
  const [pin, setPin]         = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [loginCode, setLoginCode] = useState(null);

  const digitsOnly = (v) => v.replace(/\D/g, '').slice(0, 6);

  const submitChoose = () => {
    if (pin.length < 4) { setError('Pick at least 4 digits.'); return; }
    setError(null);
    setStep('confirm');
  };

  const submitConfirm = async () => {
    if (confirmPin !== pin) {
      setError("Those don't match — try again.");
      setConfirmPin('');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/athlete-auth/setup-pin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionToken, pin }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Could not save PIN.');
      setLoginCode(json.loginCode);
      setStep('code');
    } catch (err) {
      setError(err.message);
      onSetupError?.(err);
    } finally {
      setSaving(false);
    }
  };

  const goToApp = () => {
    window.location.replace('/athlete');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />

      {step === 'choose' && (
        <>
          <h1 className="text-h2 font-bold text-ink-900 mb-2">Hi {athleteName?.split(' ')[0] || 'there'} 👋</h1>
          <p className="text-meta text-ink-500 mb-6 max-w-xs">
            Pick a 4-digit PIN so you can open ProPath from your home screen without this link.
          </p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(digitsOnly(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && submitChoose()}
            className="w-40 text-center text-2xl tracking-[0.5em] rounded-xl border border-ink-200 py-3 mb-4 focus:outline-none focus:border-gold-500"
            placeholder="••••"
          />
          {error && <p className="text-meta text-red-600 mb-3">{error}</p>}
          <button
            onClick={submitChoose}
            className="w-full max-w-xs rounded-md py-3 text-body font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Continue
          </button>
        </>
      )}

      {step === 'confirm' && (
        <>
          <h1 className="text-h2 font-bold text-ink-900 mb-2">Confirm your PIN</h1>
          <p className="text-meta text-ink-500 mb-6 max-w-xs">Enter it again to make sure.</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={confirmPin}
            onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && submitConfirm()}
            className="w-40 text-center text-2xl tracking-[0.5em] rounded-xl border border-ink-200 py-3 mb-4 focus:outline-none focus:border-gold-500"
            placeholder="••••"
          />
          {error && <p className="text-meta text-red-600 mb-3">{error}</p>}
          <button
            onClick={submitConfirm}
            disabled={saving || confirmPin.length < 4}
            className="w-full max-w-xs rounded-md py-3 text-body font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {saving ? 'Saving…' : 'Set PIN'}
          </button>
        </>
      )}

      {step === 'code' && (
        <>
          <h1 className="text-h2 font-bold text-ink-900 mb-2">You're set</h1>
          <p className="text-meta text-ink-500 mb-4 max-w-xs">
            Your login ID — write it down, you'll need it plus your PIN if you ever sign in on a new device:
          </p>
          <p
            className="text-h1 font-bold tracking-[0.3em] mb-6 px-6 py-3 rounded-xl"
            style={{ color: GOLD, backgroundColor: 'rgba(165,141,105,0.10)' }}
          >
            {loginCode}
          </p>
          <button
            onClick={goToApp}
            className="w-full max-w-xs rounded-md py-3 text-body font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Continue to ProPath
          </button>
          <p className="text-micro text-ink-400 mt-4 max-w-xs">
            Next: tap Share → Add to Home Screen to keep ProPath one tap away.
          </p>
        </>
      )}
    </div>
  );
}
