import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useRecipes — list/CRUD for the global recipe library. Reads filter
 * by meal_type + is_active so both the coach admin and the athlete
 * inspiration card share the same hook with different params.
 *
 *   recipes      — array of recipe rows (filtered)
 *   loading      — fetch in flight
 *   create(row)  — INSERT + refresh
 *   update(id, patch) — UPDATE + refresh
 *   remove(id)   — DELETE + refresh
 *   refresh()    — re-fetch
 */
export function useRecipes({ mealType = 'all', snackTiming = 'all', activeOnly = true, search = '' } = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let q = supabase
        .from('recipes')
        .select('*')
        .order('updated_at', { ascending: false });
      if (mealType !== 'all') q = q.eq('meal_type', mealType);
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        console.error('[useRecipes] fetch failed', error);
        setRecipes([]);
      } else {
        let rows = data || [];
        if (search.trim()) {
          const s = search.trim().toLowerCase();
          rows = rows.filter(r => (r.title || '').toLowerCase().includes(s));
        }
        // snack_timing filter — only meaningful when the meal-type
        // filter is 'snack' or 'all'. Applied client-side so the
        // primary indexed meal_type filter stays simple.
        if (snackTiming && snackTiming !== 'all') {
          rows = rows.filter(r => r.snack_timing === snackTiming);
        }
        setRecipes(rows);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [mealType, snackTiming, activeOnly, search, tick]);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const create = useCallback(async (row) => {
    const payload = sanitise(row);
    if (!payload.title) return { ok: false, error: new Error('Title required') };
    const { data, error } = await supabase
      .from('recipes')
      .insert(payload)
      .select()
      .single();
    if (error) return { ok: false, error };
    refresh();
    return { ok: true, data };
  }, [refresh]);

  const update = useCallback(async (id, patch) => {
    const payload = { ...sanitise(patch), updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from('recipes')
      .update(payload)
      .eq('id', id);
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }, [refresh]);

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) return { ok: false, error };
    refresh();
    return { ok: true };
  }, [refresh]);

  const bulkInsert = useCallback(async (rows) => {
    const payload = rows.map(sanitise).filter(r => r.title);
    if (!payload.length) return { ok: false, error: new Error('No valid recipes') };
    const { data, error } = await supabase
      .from('recipes')
      .insert(payload)
      .select();
    if (error) return { ok: false, error };
    refresh();
    return { ok: true, data, inserted: data?.length || 0 };
  }, [refresh]);

  return { recipes, loading, create, update, remove, bulkInsert, refresh };
}

function sanitise(row) {
  const out = {};
  for (const k of ['title','meal_type','description','image_url','source']) {
    if (row[k] != null) out[k] = String(row[k]).trim() || null;
  }
  // snack_timing — only kept when the recipe is actually a snack;
  // clears to NULL otherwise so a meal-type swap leaves no stale
  // value behind.
  if ('snack_timing' in row || 'meal_type' in row) {
    const isSnack = (out.meal_type ?? row.meal_type) === 'snack';
    if (!isSnack) {
      out.snack_timing = null;
    } else {
      const t = String(row.snack_timing || '').trim();
      out.snack_timing = (t === 'pre_training' || t === 'post_training' || t === 'anytime') ? t : null;
    }
  }
  for (const k of ['prep_time_min','cook_time_min','servings']) {
    if (row[k] != null && row[k] !== '') out[k] = Number(row[k]);
  }
  if (Array.isArray(row.ingredients))  out.ingredients  = row.ingredients.map(s => String(s).trim()).filter(Boolean);
  if (Array.isArray(row.instructions)) out.instructions = row.instructions.map(s => String(s).trim()).filter(Boolean);
  if (Array.isArray(row.tags))         out.tags         = row.tags.map(s => String(s).trim()).filter(Boolean);
  if (typeof row.is_active === 'boolean') out.is_active = row.is_active;
  return out;
}
