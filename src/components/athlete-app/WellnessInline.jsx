import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import WellnessInlineCustom from './WellnessInlineCustom';

/**
 * Athlete-side wellness card on the Training/Today tab. With the
 * library + selections redesign every athlete uses the same custom
 * renderer — the question set is whatever their coach has selected
 * from the ProPath library. If the coach has selected nothing yet,
 * the inner renderer surfaces a "no questions" message.
 *
 * This component's only job now is to resolve the wellness_token
 * (used for the anon RLS check on inserts) and pass it down.
 */
export default function WellnessInline({ athleteId, dateISO }) {
  const [token,  setToken]  = useState(null);
  const [status, setStatus] = useState('loading'); // loading | active | inactive

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('wellness_tokens')
        .select('token, is_active')
        .eq('athlete_id', athleteId)
        .maybeSingle();
      if (cancelled) return;
      if (data?.is_active) { setToken(data.token); setStatus('active'); }
      else { setStatus('inactive'); }
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  if (status !== 'active') return null;

  return (
    <WellnessInlineCustom
      athleteId={athleteId}
      dateISO={dateISO}
      wellnessToken={token}
    />
  );
}
