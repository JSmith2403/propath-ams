import { useState } from 'react';
import logo from '../assets/Propath_Primary Logo_White.png';

// Shared styles — keep in sync with ResetPasswordScreen
const inputStyle = {
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
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 6,
  color: 'rgba(255,255,255,0.38)',
  fontFamily: 'Arial, sans-serif',
};

// ── Forgot-password sub-form ───────────────────────────────────────────────────
function ForgotPasswordForm({ onSend, onBack }) {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await onSend(email);
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <p
          className="text-sm rounded-lg px-4 py-3 text-center"
          style={{
            color: '#86efac',
            backgroundColor: 'rgba(34,197,94,0.1)',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Reset link sent — check your inbox.
        </p>
        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: 8,
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Arial, sans-serif',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontFamily: 'Arial, sans-serif', marginBottom: 4 }}>
        Enter your email and we'll send you a link to reset your password.
      </p>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          placeholder="your@email.com"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = '#A58D69')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
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
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 8,
          backgroundColor: 'transparent',
          color: 'rgba(255,255,255,0.35)',
          fontSize: 13,
          fontFamily: 'Arial, sans-serif',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Back to Sign In
      </button>
    </form>
  );
}

// ── Main login screen ─────────────────────────────────────────────────────────
export default function LoginScreen({ onSignIn, onResetPassword }) {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showForgot,   setShowForgot]   = useState(false);

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
          <img
            src={logo}
            alt="ProPath Academy"
            style={{ width: 140, objectFit: 'contain', margin: '0 auto 20px' }}
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

        {/* ── Forgot password view ── */}
        {showForgot ? (
          <ForgotPasswordForm
            onSend={onResetPassword}
            onBack={() => setShowForgot(false)}
          />
        ) : (

          /* ── Sign-in form ── */
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#A58D69')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => { setError(''); setShowForgot(true); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 11,
                    color: '#A58D69',
                    cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#A58D69')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
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
        )}

        <p
          className="text-center text-xs mt-8"
          style={{ color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}
        >
          New users: use the link emailed to you to set your password before signing in.
          <br />
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}
