import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { HRV_BASELINE_DAYS, hrvDip } from '../utils/hrvDip';

const iso = (d) => d.toLocaleDateString('en-CA');

/**
 * For the athlete's own check-in: has their HRV dipped below their usual (see utils/hrvDip)?
 * Reads their own Garmin rows; if there are none, or they can't be read, it simply says no.
 */
export function useHrvDip(athleteId) {
  const [dip, setDip] = useState(false);
  useEffect(() => {
    if (!athleteId) return undefined;
    let cancelled = false;
    const since = new Date(); since.setDate(since.getDate() - (HRV_BASELINE_DAYS + 2));
    supabase.rpc('garmin_daily_for', { p_athlete_ids: [athleteId], p_since: iso(since), p_limit: 40 })
      .then(({ data, error }) => { if (!cancelled) setDip(!error && hrvDip(data || [], iso(new Date())).dip); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [athleteId]);
  return dip;
}
