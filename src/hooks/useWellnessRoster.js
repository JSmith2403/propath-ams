import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Batch-fetch wellness activation status and latest submission for all athletes.
 * Returns a map: { [athleteId]: { isActive, latestSubmission, latestDate } }
 */
export function useWellnessRoster(athleteIds) {
  const [wellnessMap, setWellnessMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteIds || athleteIds.length === 0) {
      setWellnessMap({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);

      // 1. Fetch all tokens for these athletes
      const { data: tokens } = await supabase
        .from('wellness_tokens')
        .select('athlete_id, is_active')
        .in('athlete_id', athleteIds);

      // 2. Fetch the latest submission per athlete
      //    Order by submission_date desc, take distinct on athlete_id
      const { data: subs } = await supabase
        .from('wellness_submissions')
        .select('athlete_id, submission_date, sleep_duration, sleep_quality, fatigue, muscle_soreness, stress')
        .in('athlete_id', athleteIds)
        .order('submission_date', { ascending: false });

      if (cancelled) return;

      const map = {};

      // Index tokens
      const tokenMap = {};
      (tokens || []).forEach((t) => { tokenMap[t.athlete_id] = t; });

      // Index latest submission per athlete (first occurrence since sorted desc)
      const subMap = {};
      (subs || []).forEach((s) => {
        if (!subMap[s.athlete_id]) subMap[s.athlete_id] = s;
      });

      athleteIds.forEach((id) => {
        const tok = tokenMap[id];
        const sub = subMap[id];
        map[id] = {
          isActive: tok?.is_active ?? false,
          latestSubmission: sub || null,
          latestDate: sub?.submission_date || null,
        };
      });

      setWellnessMap(map);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [athleteIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { wellnessMap, loading: loading };
}
