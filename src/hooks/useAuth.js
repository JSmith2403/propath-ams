import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages Supabase Auth session, user role, and athlete allocations.
 *
 * role:        'admin' | 'co_admin' | 'external'
 * allocations: array of athlete IDs visible to an external provider
 *
 * needsPasswordSet: true when the user arrived via a password-reset or
 *   invite link — app should show ResetPasswordScreen instead of the main app.
 */

// ── Dev bypass ────────────────────────────────────────────────────────────────
// import.meta.env.DEV is true only during `vite dev`. Vite replaces it with
// the literal `false` in production builds, so this branch is tree-shaken
// and never ships to Vercel. Belt-and-braces: also require localhost so a
// misconfigured build can never activate it on a public host, and allow
// opting out (VITE_DEV_BYPASS=false) to test real auth locally.
const IS_LOCALHOST = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const DEV_BYPASS = import.meta.env.DEV
  && IS_LOCALHOST
  && import.meta.env.VITE_DEV_BYPASS !== 'false';

// Mock session object — just needs a truthy shape with user.email
const DEV_SESSION = { user: { email: 'dev@localhost' } };

// ── Temporary diagnostics ───────────────────────────────────────────────────
// Added 2026-08-18 while tracking down the empty-roster incident: the
// network trace showed the profile check (user_roles + provider_allocations)
// firing repeatedly instead of once, but it was unclear whether that was
// repeated onAuthStateChange events on one stable mount, or the whole hook
// (and therefore AuthenticatedApp) remounting repeatedly. This makes that
// question answerable from the console instead of guessed at. Safe to
// remove once the cause is confirmed fixed.
let _authHookMountCount = 0;
function _diag(...args) {
  console.log(`[Auth-diag ${new Date().toISOString().slice(11, 23)}]`, ...args);
}

// ── Hash-type capture ─────────────────────────────────────────────────────────
// Read the hash type BEFORE Supabase's getSession() clears it.
// Supabase appends  #access_token=...&type=recovery  or  &type=invite
// to the redirect URL. This IIFE runs once at module import time.
const _initialHashType = (() => {
  try {
    const hash = window.location.hash.replace(/^#/, '');
    return new URLSearchParams(hash).get('type'); // 'recovery' | 'invite' | null
  } catch {
    return null;
  }
})();

export function useAuth() {
  // In dev, seed state with admin values so the app renders immediately
  // without touching Supabase auth at all.
  const [session,          setSession]          = useState(DEV_BYPASS ? DEV_SESSION : null);
  const [role,             setRole]             = useState(DEV_BYPASS ? 'admin' : null);
  const [userName,         setUserName]         = useState(DEV_BYPASS ? 'Dev Admin' : '');
  const [allocations,      setAllocations]      = useState([]);
  const [loading,          setLoading]          = useState(!DEV_BYPASS); // false immediately in dev
  const [needsPasswordSet, setNeedsPasswordSet] = useState(false);

  useEffect(() => {
    const mountId = ++_authHookMountCount;
    _diag(`useAuth EFFECT MOUNT #${mountId}`, DEV_BYPASS ? '(dev bypass — auth skipped)' : '');

    // Skip all Supabase auth in development — bypass is active
    if (DEV_BYPASS) return;

    // Restore existing session on mount
    _diag(`#${mountId} calling getSession()`);
    supabase.auth.getSession().then(({ data: { session } }) => {
      _diag(`#${mountId} getSession() resolved, user:`, session?.user?.email || '(none)');
      // If the page was opened from a recovery/invite link, getSession will
      // return a session (Supabase exchanged the token). onAuthStateChange
      // fires synchronously with the right event, so we defer to that handler
      // and skip the setSession call here to avoid a double-load.
      if (_initialHashType === 'recovery' || _initialHashType === 'invite') return;

      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id, mountId);
      } else {
        setLoading(false);
      }
    });

    // Keep in sync with sign-in / sign-out / recovery events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      _diag(`#${mountId} onAuthStateChange event:`, event, 'user:', session?.user?.email || '(none)');
      if (event === 'PASSWORD_RECOVERY') {
        // User arrived via a password-reset email link.
        // A session exists but we must not let them into the app yet.
        setSession(session);
        setNeedsPasswordSet(true);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' && _initialHashType === 'invite') {
        // User arrived via an invite email link (Supabase fires SIGNED_IN, not
        // a dedicated invite event). Intercept before they reach the app.
        setSession(session);
        setNeedsPasswordSet(true);
        setLoading(false);
        return;
      }

      setSession(session);
      if (session?.user) {
        // TOKEN_REFRESHED fires for the same already-authenticated user —
        // role/full_name/allocations can't have changed, so skip re-fetching
        // them. Refetching on every refresh is wasteful at best; if refreshes
        // are ever firing abnormally often (e.g. under realtime reconnect
        // churn), it turns into a request storm that starves other
        // first-load queries — exactly what crowded out the athletes fetch
        // and made the roster appear empty on 2026-08-18.
        if (event !== 'TOKEN_REFRESHED') {
          loadProfile(session.user.id, mountId);
        }
      } else {
        setRole(null);
        setUserName('');
        setAllocations([]);
        setLoading(false);
      }
    });

    return () => {
      _diag(`#${mountId} useAuth EFFECT CLEANUP (unmounting or re-running)`);
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId, mountId = '?') {
    _diag(`#${mountId} loadProfile START for`, userId);
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role, full_name')
      .eq('user_id', userId)
      .maybeSingle();

    const userRole = roleRow?.role ?? 'external';
    _diag(`#${mountId} loadProfile role resolved:`, userRole, roleRow ? '(row found)' : '(NO ROW — defaulted to external)');
    setRole(userRole);
    setUserName(roleRow?.full_name || '');

    let athleteAllocations = [];
    if (userRole === 'external') {
      const { data } = await supabase
        .from('provider_allocations')
        .select('athlete_id')
        .eq('user_id', userId);
      athleteAllocations = data?.map(r => r.athlete_id) ?? [];
    }

    setAllocations(athleteAllocations);
    setLoading(false);
    _diag(`#${mountId} loadProfile DONE`);
  }

  const signIn  = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = DEV_BYPASS
    ? () => {} // no-op in dev — bypass stays active for the session
    : () => supabase.auth.signOut();

  // Called by LoginScreen's "Forgot password?" flow.
  // Supabase sends a reset email with a link back to window.location.origin.
  const sendPasswordReset = (email) =>
    supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

  // Called by ResetPasswordScreen after the password has been updated and
  // the user has been signed out — clears the intercept flag so App can
  // re-render the login screen.
  const clearNeedsPasswordSet = () => setNeedsPasswordSet(false);

  return {
    session,
    user:        session?.user ?? null,
    role,
    userName,
    allocations,
    loading,
    needsPasswordSet,
    signIn,
    signOut,
    sendPasswordReset,
    clearNeedsPasswordSet,
  };
}
