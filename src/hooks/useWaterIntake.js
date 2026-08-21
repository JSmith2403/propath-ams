import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const GLASS_ML = 500;

// en-CA gives YYYY-MM-DD directly in local calendar terms — see the
// matching note in NutritionTab.jsx's todayIso().
function todayIso() {
  return new Date().toLocaleDateString('en-CA');
}

/**
 * useWaterIntake — today's glass count for an athlete. One row per
 * (athlete_id, log_date) in water_intake_logs, upserted on every tap.
 * Glass size is fixed at 500ml — only the count and the daily target
 * (read from nutrition_settings) vary.
 *
 *   { glasses, loading, setGlasses(n) }
 */
export function useWaterIntake(athleteId) {
  const [glasses, setGlassesState] = useState(0);
  const [loading, setLoading] = useState(true);
  const logDate = todayIso();

  useEffect(() => {
    if (!athleteId) { setGlassesState(0); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('glasses')
        .eq('athlete_id', athleteId)
        .eq('log_date', logDate)
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error('[useWaterIntake] fetch failed', error);
      setGlassesState(data?.glasses ?? 0);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, logDate]);

  const setGlasses = useCallback(async (n) => {
    const next = Math.max(0, n);
    setGlassesState(next); // optimistic
    if (!athleteId) return;
    const { error } = await supabase
      .from('water_intake_logs')
      .upsert(
        { athlete_id: athleteId, log_date: logDate, glasses: next, updated_at: new Date().toISOString() },
        { onConflict: 'athlete_id,log_date' },
      );
    if (error) console.error('[useWaterIntake] save failed', error);
  }, [athleteId, logDate]);

  return { glasses, loading, setGlasses };
}

export { GLASS_ML };
