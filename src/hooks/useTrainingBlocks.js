import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Mirror of `blocks` for snapshotting outside React's batched setState.
  // Reading a snapshot from this ref before applying the optimistic patch
  // is more reliable than capturing inside a setState updater (whose
  // run-time is not synchronous in React 18 + StrictMode).
  const blocksRef = useRef([]);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);

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

  // ─── Add (pessimistic — needs DB-assigned id) ──────────────────────────
  // Returns { ok, row?, error? } so callers can keep the modal open and
  // surface an inline error on failure. No alert(), no toast — let the
  // caller decide.
  const addBlock = useCallback(async (data) => {
    const sameAthlete = blocksRef.current.filter(b => b.athlete_id === data.athlete_id);
    const maxOrder = sameAthlete.reduce((m, b) => Math.max(m, b.display_order || 0), 0);
    const payload = { ...data, display_order: maxOrder + 1 };

    const { data: row, error: e } = await supabase
      .from('training_blocks')
      .insert(payload)
      .select()
      .single();
    if (e) {
      console.error('[Blocks] addBlock failed:', {
        payload,
        message: e.message, code: e.code, details: e.details, hint: e.hint, fullError: e,
      });
      return { ok: false, error: e };
    }
    refresh();
    return { ok: true, row };
  }, [refresh]);

  // ─── Optimistic update ─────────────────────────────────────────────────
  // Snapshot is read from the state mirror BEFORE we issue the optimistic
  // patch, so the revert path always has the original row regardless of
  // React's batched-update timing.
  const updateBlockOptimistic = useCallback(async (id, patch) => {
    const snapshot = blocksRef.current.find(b => b.id === id);
    if (!snapshot) {
      console.warn('[Blocks] update: block not in local state, id =', id);
      return { ok: false, error: new Error('Block not found in current view.') };
    }

    // Apply optimistic patch
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));

    // Network call
    const { data, error: e } = await supabase
      .from('training_blocks')
      .update(patch)
      .eq('id', id)
      .select();

    if (e) {
      console.error('[Blocks] update failed, reverting:', {
        id, patch,
        message: e.message, code: e.code, details: e.details, hint: e.hint, fullError: e,
      });
      // Revert
      setBlocks(prev => prev.map(b => b.id === id ? snapshot : b));
      return { ok: false, error: e };
    }
    if (!data || data.length === 0) {
      console.warn('[Blocks] update returned no row but no error — assuming write succeeded:', { id });
    }
    return { ok: true, row: data?.[0] };
  }, []);

  // ─── Optimistic delete ─────────────────────────────────────────────────
  const deleteBlockOptimistic = useCallback(async (id) => {
    const snapshotIdx = blocksRef.current.findIndex(b => b.id === id);
    if (snapshotIdx < 0) {
      return { ok: false, error: new Error('Block not found in current view.') };
    }
    const snapshot = blocksRef.current[snapshotIdx];

    // Apply optimistic delete
    setBlocks(prev => prev.filter(b => b.id !== id));

    const { error: e } = await supabase
      .from('training_blocks')
      .delete()
      .eq('id', id);
    if (e) {
      console.error('[Blocks] delete failed, reverting:', {
        id,
        message: e.message, code: e.code, details: e.details, hint: e.hint, fullError: e,
      });
      // Revert: re-insert at original index
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
