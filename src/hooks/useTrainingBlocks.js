import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetches training_blocks for one or more athletes.
 * Returns optimistic update / delete variants matching the calendar
 * events hook so block management feels equally responsive.
 *
 * @param {string[]} athleteIds  athletes to fetch blocks for
 */
export function useTrainingBlocks(athleteIds = []) {
  const [blocks,  setBlocks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  const key = (athleteIds || []).slice().sort().join(',');

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!key) { setBlocks([]); setLoading(false); return; }
      setLoading(true);
      const ids = key.split(',');
      const { data, error: e } = await supabase
        .from('training_blocks')
        .select('id, athlete_id, block_name, start_date, end_date, duration_weeks, target_event_id, notes, display_order')
        .in('athlete_id', ids)
        .order('start_date', { ascending: false });
      if (cancelled) return;
      if (e) { setError(e); setBlocks([]); }
      else   { setError(null); setBlocks(data || []); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [key, tick]);

  // ─── Add ────────────────────────────────────────────────────────────────
  const addBlock = useCallback(async (data) => {
    // Compute display_order = max + 1 for this athlete
    const sameAthlete = blocks.filter(b => b.athlete_id === data.athlete_id);
    const maxOrder = sameAthlete.reduce((m, b) => Math.max(m, b.display_order || 0), 0);
    const payload = { ...data, display_order: maxOrder + 1 };

    const { data: row, error: e } = await supabase
      .from('training_blocks')
      .insert(payload)
      .select()
      .single();
    if (e) {
      console.error('[Blocks] addBlock failed:', e);
      alert('Failed to add block: ' + (e.message || e));
      return null;
    }
    refresh();
    return row;
  }, [blocks, refresh]);

  // ─── Optimistic update ─────────────────────────────────────────────────
  const updateBlockOptimistic = useCallback(async (id, patch) => {
    const snapshotRef = { current: null };
    setBlocks(prev => {
      const found = prev.find(b => b.id === id);
      if (found) snapshotRef.current = found;
      if (!found) return prev;
      return prev.map(b => b.id === id ? { ...b, ...patch } : b);
    });
    const snapshot = snapshotRef.current;
    if (!snapshot) {
      console.warn('[Blocks] optimistic update: block not in local state, id =', id);
      return { ok: false, error: new Error('block not found') };
    }

    const { data, error: e } = await supabase
      .from('training_blocks')
      .update(patch)
      .eq('id', id)
      .select();

    if (e) {
      console.error('[Blocks] optimistic update failed, reverting:', { id, patch, error: e, data });
      setBlocks(prev => prev.map(b => b.id === id ? snapshot : b));
      return { ok: false, error: e };
    }
    if (!data || data.length === 0) {
      console.warn('[Blocks] update returned no row but no error — assuming write succeeded:', { id, data });
    }
    return { ok: true, row: data?.[0] };
  }, []);

  // ─── Optimistic delete ─────────────────────────────────────────────────
  const deleteBlockOptimistic = useCallback(async (id) => {
    let snapshot = null;
    let snapshotIdx = -1;
    setBlocks(prev => {
      snapshotIdx = prev.findIndex(b => b.id === id);
      if (snapshotIdx < 0) return prev;
      snapshot = prev[snapshotIdx];
      return prev.filter(b => b.id !== id);
    });
    if (!snapshot) return { ok: false, error: new Error('block not found') };

    const { error: e } = await supabase
      .from('training_blocks')
      .delete()
      .eq('id', id);
    if (e) {
      console.error('[Blocks] optimistic delete failed, reverting:', e);
      setBlocks(prev => {
        const next = prev.slice();
        const insertAt = Math.min(snapshotIdx, next.length);
        next.splice(insertAt, 0, snapshot);
        return next;
      });
      return { ok: false, error: e };
    }
    return { ok: true };
  }, []);

  return {
    blocks, loading, error,
    addBlock, updateBlockOptimistic, deleteBlockOptimistic,
    refresh,
  };
}
