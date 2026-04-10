import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logo from '../assets/Propath_Primary Logo_White.png';

// Shared input style — mirrors LoginScreen
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

/**
 * Shown when the user arrives via a password-reset or invite link.
 * Lets them set (or confirm) their password, then signs them out
 * and redirects to the login screen.
 *
 * onDone — called after sign-out so App clears the intercept flag.
 */
export default function ResetPasswordScreen({ onDone }) {
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Password set — sign out so they start a clean session at the login screen
    setSucceeded(true);
    await supabase.auth.signOut();
    onDone();
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
            Set Your Password
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Choose a password to activate your account.
          </p>
        </div>

        {/* ── Form ── */}
        {!succeeded && (
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#A58D69')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
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
              {loading ? 'Saving…' : 'Set Password'}
            </button>

          </form>
        )}

        <p
          className="text-center text-xs mt-8"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Contact your administrator if you need help.
        </p>
      </div>
    </div>
  );
}
