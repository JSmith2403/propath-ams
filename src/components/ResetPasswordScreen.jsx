import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logo from '../assets/Propath_Primary Logo_White.png';

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
 *
 * On mount this component explicitly reads the access_token and refresh_token
 * from the URL hash and calls supabase.auth.setSession() directly. This is
 * required because mobile in-app browsers (Mail.app, Gmail app, etc.) do not
 * reliably persist the session that Supabase's detectSessionInUrl establishes
 * in memory across the page-load → form-submit lifecycle, causing updateUser()
 * to fail with "Auth session missing".
 *
 * onDone — called after sign-out so App clears the needsPasswordSet flag.
 */
export default function ResetPasswordScreen({ onDone }) {
  // 'verifying' | 'ready' | 'link_error'
  const [stage,    setStage]    = useState('verifying');
  const [linkError, setLinkError] = useState('');

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    async function establishSession() {
      // ── Step 1: try to use tokens from the URL hash ──────────────────────
      // Supabase always puts invite/recovery tokens in the fragment as:
      //   #access_token=AAA&refresh_token=BBB&type=invite
      // Reading and applying them here makes the flow reliable on mobile
      // in-app browsers that may not persist the session to storage.
      const hash   = window.location.hash.replace(/^#/, '');
      const params = new URLSearchParams(hash);
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        });

        if (sessionErr) {
          setLinkError('This link has expired or has already been used. Please request a new one from your administrator.');
          setStage('link_error');
          return;
        }

        // Remove tokens from the URL bar so they aren't visible or bookmarked
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        setStage('ready');
        return;
      }

      // ── Step 2: no hash tokens — check for an existing session ──────────
      // This covers a page reload after the hash was already cleared above.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStage('ready');
        return;
      }

      // ── Step 3: nothing usable found ────────────────────────────────────
      setLinkError('This link has expired or is invalid. Please request a new one from your administrator.');
      setStage('link_error');
    }

    establishSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Password saved — sign out so they start a clean session at the login screen
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

        {/* ── Verifying session ── */}
        {stage === 'verifying' && (
          <div className="flex justify-center py-4">
            <div
              className="w-8 h-8 rounded-full border-4 animate-spin"
              style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
            />
          </div>
        )}

        {/* ── Invalid / expired link ── */}
        {stage === 'link_error' && (
          <p
            className="text-sm rounded-lg px-4 py-3 text-center"
            style={{
              color: '#fca5a5',
              backgroundColor: 'rgba(239,68,68,0.1)',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {linkError}
          </p>
        )}

        {/* ── Password form — only shown once session is confirmed ── */}
        {stage === 'ready' && (
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
