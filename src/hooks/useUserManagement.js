import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loads and manages all users for the admin User Management view.
 *
 * users: [{ id, role, fullName, allocations: [athleteId] }]
 * Source tables: user_roles, provider_allocations
 */
export function useUserManagement() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [rolesRes, allocationsRes] = await Promise.all([
      supabase.from('user_roles').select('user_id, role, full_name'),
      supabase.from('provider_allocations').select('user_id, athlete_id'),
    ]);

    if (rolesRes.error) { setError(rolesRes.error.message); setLoading(false); return; }

    const roles       = rolesRes.data       || [];
    const allocations = allocationsRes.data || [];

    const allocationMap = {};
    allocations.forEach(a => {
      if (!allocationMap[a.user_id]) allocationMap[a.user_id] = [];
      allocationMap[a.user_id].push(a.athlete_id);
    });

    const combined = roles.map(r => ({
      id:          r.user_id,
      role:        r.role,
      fullName:    r.full_name || '',
      allocations: allocationMap[r.user_id] ?? [],
    }));

    // Sort: admin first, then co_admin, then external; alphabetical by name within each group
    const roleOrder = { admin: 0, co_admin: 1, external: 2 };
    combined.sort((a, b) => {
      const rd = (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
      if (rd !== 0) return rd;
      return (a.fullName || a.id).localeCompare(b.fullName || b.id);
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
    addAllocation,
    removeAllocation,
    reload: loadUsers,
  };
}
