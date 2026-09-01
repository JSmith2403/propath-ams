import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import AthleteAppShell, { Loading } from './AthleteAppShell';
import AthletePinLogin from './AthletePinLogin';

/**
 * The stable /athlete route — same URL for every PIN-login athlete,
 * on every device. This is what actually fixes the iOS "Add to Home
 * Screen opens the wrong thing" bug: install always happens from
 * here, never from a per-athlete token URL, so there's nothing
 * athlete-specific for iOS to get wrong.
 *
 * Identity comes from a real Supabase Auth session (the same
 * mechanism the coach login uses — see the conversation history for
 * why the earlier custom session-token system was scrapped), not the
 * URL. Valid session with role='athlete' → resolve + render the app;
 * no session → the PIN login screen.
 */
export default function AthleteStableEntry() {
  const [status, setStatus]   = useState('loading'); // loading | needs-login | ready | wrong-role
  const [athlete, setAthlete] = useState(null);

  const resolve = useCallback(async (session) => {
    if (!session) { setStatus('needs-login'); return; }
    try {
      const res = await fetch('/api/athlete-auth/me', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Not an athlete account.');
      setAthlete({
        id: json.athlete.athlete_id,
        name: json.athlete.name || 'Athlete',
        photo: json.athlete.photo || null,
        sport: json.athlete.sport || '',
        wellnessToken: json.athlete.wellness_token || null,
        progressMetrics: [],
      });
      setStatus('ready');
    } catch (_) {
      setStatus('wrong-role');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) resolve(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) resolve(session);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [resolve]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <Loading />
      </div>
    );
  }

  if (status === 'wrong-role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-ink-50 text-center">
        <p className="text-meta text-ink-500 max-w-xs">
          That account isn't set up as an athlete. If this is a mistake, contact your coach.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 text-meta font-semibold"
          style={{ color: '#A58D69' }}
        >
          Sign out
        </button>
      </div>
    );
  }

  if (status === 'needs-login') {
    return <AthletePinLogin />;
  }

  return <AthleteAppShell athlete={athlete} />;
}
