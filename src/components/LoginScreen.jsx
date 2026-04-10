import { useState } from 'react';

export default function LoginScreen({ onSignIn }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await onSignIn(email, password);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // On success, useAuth's onAuthStateChange fires and the session is set —
    // the LoginScreen unmounts automatically.
  };

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ backgroundColor: '#1C1C1C', fontFamily: 'Arial, sans-serif' }}
    >
      <div className="w-full max-w-sm px-8">

        {/* ── Branding ── */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center rounded mb-5"
            style={{
              width: 160,
              height: 44,
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px dashed rgba(255,255,255,0.14)',
            }}
          />
          <h1
            className="text-xl font-bold tracking-wide"
            style={{ color: '#ffffff', fontFamily: 'Arial, sans-serif' }}
          >
            ProPath Academy
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Athlete Management System
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Arial, sans-serif' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="your@email.com"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 14,
                color: '#ffffff',
                outline: 'none',
                fontFamily: 'Arial, sans-serif',
                transition: 'border-color 0.15s',
              }}
              onFocus={e  => (e.target.style.borderColor = '#A58D69')}
              onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Arial, sans-serif' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 14,
                color: '#ffffff',
                outline: 'none',
                fontFamily: 'Arial, sans-serif',
                transition: 'border-color 0.15s',
              }}
              onFocus={e  => (e.target.style.borderColor = '#A58D69')}
              onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </div>

          {error && (
            <p
              className="text-sm rounded-lg px-4 py-2.5"
              style={{
                color: '#fca5a5',
                backgroundColor: 'rgba(239,68,68,0.1)',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 0',
              borderRadius: 8,
              backgroundColor: '#A58D69',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'Arial, sans-serif',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.55 : 1,
              transition: 'opacity 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p
          className="text-center text-xs mt-8"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}
