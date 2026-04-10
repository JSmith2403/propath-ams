import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loads and manages all users for the admin User Management view.
 *
 * users: [{ id, name, email, role, isActive, allocations: [athleteId] }]
 */
export function useUserManagement() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch profiles, roles, and allocations in parallel
    const [profilesRes, rolesRes, allocationsRes] = await Promise.all([
      supabase.from('user_profiles').select('user_id, name, email, is_active'),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('provider_allocations').select('user_id, athlete_id'),
    ]);

    if (profilesRes.error) { setError(profilesRes.error.message); setLoading(false); return; }
    if (rolesRes.error)    { setError(rolesRes.error.message);    setLoading(false); return; }

    const profiles    = profilesRes.data    || [];
    const roles       = rolesRes.data       || [];
    const allocations = allocationsRes.data || [];

    const roleMap       = Object.fromEntries(roles.map(r => [r.user_id, r.role]));
    const allocationMap = {};
    allocations.forEach(a => {
      if (!allocationMap[a.user_id]) allocationMap[a.user_id] = [];
      allocationMap[a.user_id].push(a.athlete_id);
    });

    const combined = profiles.map(p => ({
      id:          p.user_id,
      name:        p.name,
      email:       p.email,
      role:        roleMap[p.user_id] ?? 'external',
      isActive:    p.is_active,
      allocations: allocationMap[p.user_id] ?? [],
    }));

    // Sort: admin first, then co_admin, then external; alphabetical within each group
    const roleOrder = { admin: 0, co_admin: 1, external: 2 };
    combined.sort((a, b) => {
      const rd = (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
      if (rd !== 0) return rd;
      return a.name.localeCompare(b.name);
    });

    setUsers(combined);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Invite new user (calls Edge Function) ──────────────────
  const inviteUser = useCallback(async ({ name, email, role }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey':        import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), role }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Invite failed');
    await loadUsers();
    return json.userId;
  }, [loadUsers]);

  // ── Toggle active/inactive ─────────────────────────────────
  const setUserActive = useCallback(async (userId, isActive) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: isActive })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive } : u));
  }, []);

  // ── Allocation management ──────────────────────────────────
  const addAllocation = useCallback(async (userId, athleteId) => {
    const { error } = await supabase
      .from('provider_allocations')
      .insert({ user_id: userId, athlete_id: athleteId });
    if (error) throw new Error(error.message);
    setUsers(prev => prev.map(u =>
      u.id === userId
        ? { ...u, allocations: [...new Set([...u.allocations, athleteId])] }
        : u
    ));
  }, []);

  const removeAllocation = useCallback(async (userId, athleteId) => {
    const { error } = await supabase
      .from('provider_allocations')
      .delete()
      .eq('user_id', userId)
      .eq('athlete_id', athleteId);
    if (error) throw new Error(error.message);
    setUsers(prev => prev.map(u =>
      u.id === userId
        ? { ...u, allocations: u.allocations.filter(id => id !== athleteId) }
        : u
    ));
  }, []);

  return {
    users,
    loading,
    error,
    inviteUser,
    setUserActive,
    addAllocation,
    removeAllocation,
    reload: loadUsers,
  };
}
