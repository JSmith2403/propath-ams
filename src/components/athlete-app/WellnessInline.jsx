import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const { token: appToken } = useParams();
  const [token,  setToken]  = useState(null);
  const [status, setStatus] = useState('loading'); // loading | active | inactive

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Anon has no direct SELECT on wellness_tokens — the app-token RPC
      // returns the athlete's active wellness_token alongside validation.
      const { data } = await supabase
        .rpc('validate_athlete_token', { p_token: appToken });
      const row = Array.isArray(data) ? data[0] : data;
      if (cancelled) return;
      if (row?.is_active && row.wellness_token) {
        setToken(row.wellness_token);
        setStatus('active');
      } else {
        setStatus('inactive');
      }
    })();
    return () => { cancelled = true; };
  }, [appToken]);

  if (status !== 'active') return null;

  return (
    <WellnessInlineCustom
      athleteId={athleteId}
      dateISO={dateISO}
      wellnessToken={token}
    />
  );
}
