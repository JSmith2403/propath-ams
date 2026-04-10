import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages Supabase Auth session, user role, and athlete allocations.
 *
 * role:        'admin' | 'co_admin' | 'external'
 * allocations: array of athlete IDs visible to an external provider
 */
export function useAuth() {
  const [session,     setSession]     = useState(null);
  const [role,        setRole]        = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Keep in sync with sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setRole(null);
        setAllocations([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const [roleRes, profileRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase.from('user_profiles').select('is_active, name, email').eq('user_id', userId).maybeSingle(),
    ]);

    const userRole = roleRes.data?.role ?? 'external';

    // If no profile row exists yet, create one (handles existing users pre-Phase-2)
    if (!profileRes.data) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('user_profiles').upsert({
        user_id:   userId,
        name:      user?.user_metadata?.name ?? '',
        email:     user?.email ?? '',
        is_active: true,
      });
    }

    // If the account has been deactivated, sign out immediately
    if (profileRes.data && profileRes.data.is_active === false) {
      await supabase.auth.signOut();
      return;
    }

    setRole(userRole);

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

  return {
    session,
    user:        session?.user ?? null,
    role,
    allocations,
    loading,
    signIn,
    signOut,
  };
}
