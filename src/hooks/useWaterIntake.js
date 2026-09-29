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

/**
 * useWaterIntakeRange — read-only water_intake_logs for an inclusive
 * [startISO, endISO] window, keyed by log_date. Powers the Food Diary
 * week grid's per-day water row (coach-side; unlike useWaterIntake
 * this never writes).
 *
 *   { glassesByDate, loading, refresh } — glassesByDate: { [log_date]: glasses }
 */
export function useWaterIntakeRange(athleteId, startISO, endISO) {
  const [glassesByDate, setGlassesByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [tick,    setTick]    = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!athleteId || !startISO || !endISO) {
      setGlassesByDate({}); setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('log_date, glasses')
        .eq('athlete_id', athleteId)
        .gte('log_date', startISO)
        .lte('log_date', endISO);
      if (cancelled) return;
      if (error) {
        console.error('[useWaterIntakeRange] fetch failed', error);
        setGlassesByDate({}); setLoading(false);
        return;
      }
      const map = {};
      (data || []).forEach(r => { map[r.log_date] = r.glasses; });
      setGlassesByDate(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, startISO, endISO, tick]);

  return { glassesByDate, loading, refresh };
}

export { GLASS_ML };
