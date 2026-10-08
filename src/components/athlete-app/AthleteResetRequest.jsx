import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import logo from '../../assets/Propath_Primary Logo_Black.png';

const GOLD = '#A58D69';

/**
 * "Forgot your password?" — the athlete enters their username and the coaches
 * are notified. Nothing changes until a coach has checked it's really them and
 * sends a new starting password. (The server answers the same way whether or
 * not the username exists.)
 */
export default function AthleteResetRequest({ onBack }) {
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/athlete-auth/request-reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Something went wrong — try again.');
      setSent(true);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Couldn\'t reach the server — check your connection and try again.' : err.message);
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-50 text-center">
      <img src={logo} alt="ProPath" style={{ width: '120px' }} className="mb-8" />

      {sent ? (
        <>
          <CheckCircle2 size={34} className="mb-3" style={{ color: '#16a34a' }} />
          <h1 className="text-h2 font-bold text-ink-900 mb-2">Request sent</h1>
          <p className="text-meta text-ink-500 mb-6 max-w-xs">
            Your coach has been told. Once they&rsquo;ve checked it&rsquo;s you, they&rsquo;ll send you a new starting password
            (WhatsApp or text). Sign in with it and you&rsquo;ll choose your own straight away.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-h2 font-bold text-ink-900 mb-2">Forgot your password?</h1>
          <p className="text-meta text-ink-500 mb-6 max-w-xs">
            Enter your username and we&rsquo;ll let your coach know. They&rsquo;ll send you a new starting password.
          </p>
          <form onSubmit={submit} className="w-full max-w-xs">
            <input
              type="text" name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full text-center text-lg rounded-xl border border-ink-200 py-3 mb-4 focus:outline-none focus:border-gold-500"
            />
            {error && <p className="text-meta text-red-600 mb-3" role="alert">{error}</p>}
            <button
              type="submit" disabled={busy || !username.trim()}
              className="w-full rounded-md py-3 text-body font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: GOLD }}
            >
              {busy ? 'Sending…' : 'Ask my coach for a new password'}
            </button>
          </form>
        </>
      )}

      <button onClick={onBack} className="mt-8 inline-flex items-center gap-1.5 text-meta text-ink-500">
        <ArrowLeft size={14} /> Back to sign in
      </button>
    </div>
  );
}
