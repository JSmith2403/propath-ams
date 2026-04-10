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
  const [session,          setSession]          = useState(null);
  const [role,             setRole]             = useState(null);
  const [userName,         setUserName]         = useState('');
  const [allocations,      setAllocations]      = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [needsPasswordSet, setNeedsPasswordSet] = useState(false);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If the page was opened from a recovery/invite link, getSession will
      // return a session (Supabase exchanged the token). onAuthStateChange
      // fires synchronously with the right event, so we defer to that handler
      // and skip the setSession call here to avoid a double-load.
      if (_initialHashType === 'recovery' || _initialHashType === 'invite') return;

      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Keep in sync with sign-in / sign-out / recovery events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
        loadProfile(session.user.id);
      } else {
        setRole(null);
        setUserName('');
        setAllocations([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role, full_name')
      .eq('user_id', userId)
      .maybeSingle();

    const userRole = roleRow?.role ?? 'external';
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
  }

  const signIn  = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

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
