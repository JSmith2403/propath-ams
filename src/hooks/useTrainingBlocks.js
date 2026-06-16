import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { addDaysISO } from '../utils/blockHelpers';

// Strip server-managed columns before sending a row back via upsert. The
// touch_updated_at trigger resets updated_at on its own.
function stripVolatile({ created_at, updated_at, ...rest }) { return rest; }

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

  // ─── Add / remove a week (shift cascade) ────────────────────────────────
  // Adds 1 week to the target block AND shifts every later block for the
  // same athlete by +/- 7 days. Sent as a single upsert so the DB applies
  // all writes atomically — partial failure can't leave the timeline in
  // a half-shifted state.

  const shiftBlocksByDays = useCallback(async (blockId, deltaDays) => {
    const target = blocksRef.current.find(b => b.id === blockId);
    if (!target) {
      return { ok: false, error: new Error('Block not found in current view.') };
    }
    if (deltaDays < 0 && target.duration_weeks <= 1) {
      return { ok: false, error: new Error('Cannot delete the only week. Delete the block instead.') };
    }

    const sameAthleteLater = blocksRef.current.filter(b =>
      b.athlete_id === target.athlete_id && b.start_date > target.start_date,
    );
    const allAffected = [target, ...sameAthleteLater];
    const snapshotMap = new Map(allAffected.map(b => [b.id, b]));

    // Compute the optimistic next-state rows
    const updated = allAffected.map(b => {
      if (b.id === target.id) {
        return {
          ...b,
          duration_weeks: b.duration_weeks + (deltaDays / 7),
          end_date: addDaysISO(b.end_date, deltaDays),
        };
      }
      // Subsequent block — shift both ends
      return {
        ...b,
        start_date: addDaysISO(b.start_date, deltaDays),
        end_date:   addDaysISO(b.end_date,   deltaDays),
      };
    });

    // Apply optimistic state
    const updatedById = new Map(updated.map(u => [u.id, u]));
    setBlocks(prev => prev.map(b => updatedById.get(b.id) || b));

    // Single upsert request → atomic at the DB
    const payload = updated.map(stripVolatile);
    const { error: e } = await supabase
      .from('training_blocks')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (e) {
      console.error('[Blocks] shiftBlocksByDays failed, reverting:', {
        blockId, deltaDays,
        message: e.message, code: e.code, details: e.details, hint: e.hint, fullError: e,
      });
      setBlocks(prev => prev.map(b => snapshotMap.get(b.id) || b));
      return { ok: false, error: e };
    }

    // ─── Sync planned_sessions to the new block windows ───────────────
    // The FK CASCADE only fires on DELETE of the parent training_block.
    // We just UPDATED it (shrunk / grew), so planned_sessions in the
    // dropped week are still hanging around — and later blocks' planned
    // dates have drifted out of sync with the shifted block windows.
    // See supabase/migrations/planned-sessions-window-sync-2026-06-08.sql
    // for the schema-side companion (cleanup + RPC).
    try {
      const newTarget = updatedById.get(target.id);

      // Target block: delete any planned_sessions outside the new window.
      // Only meaningful when shrinking — but the predicate is cheap so
      // we run it either way to keep the code branchless.
      await supabase
        .from('planned_sessions')
        .delete()
        .eq('block_id', target.id)
        .or(
          `planned_date.gt.${newTarget.end_date}`
          + `,planned_date.lt.${newTarget.start_date}`
          + `,week_number.gt.${newTarget.duration_weeks}`
        );

      // Later blocks: ride along by the same deltaDays so each session's
      // calendar date stays aligned with its (now-shifted) block window.
      if (sameAthleteLater.length) {
        const laterIds = sameAthleteLater.map(b => b.id);
        const { error: rpcErr } = await supabase.rpc('shift_planned_session_dates', {
          p_block_ids:  laterIds,
          p_delta_days: deltaDays,
        });
        if (rpcErr) console.error('[Blocks] shift_planned_session_dates RPC failed:', rpcErr);
      }
    } catch (cleanupErr) {
      // Don't fail the whole shift just because of a cleanup glitch —
      // the block math already committed. Surface in console and let
      // the caller refetch on its next tick.
      console.error('[Blocks] planned_sessions sync after shift failed:', cleanupErr);
    }

    return { ok: true };
  }, []);

  const addWeekToBlock        = useCallback((id) => shiftBlocksByDays(id, +7), [shiftBlocksByDays]);
  const removeLastWeekFromBlock = useCallback((id) => shiftBlocksByDays(id, -7), [shiftBlocksByDays]);

  return {
    blocks, loading, error,
    addBlock, updateBlockOptimistic, deleteBlockOptimistic,
    addWeekToBlock, removeLastWeekFromBlock,
    refresh,
  };
}
