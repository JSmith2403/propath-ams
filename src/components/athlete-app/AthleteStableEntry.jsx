import { useEffect, useState } from 'react';
import AthleteAppShell, { Loading } from './AthleteAppShell';
import AthletePinLogin from './AthletePinLogin';

const SESSION_KEY = 'propath_athlete_session';

/**
 * The stable /athlete route — same URL for every PIN-login athlete,
 * on every device. This is what actually fixes the iOS "Add to Home
 * Screen opens the wrong thing" bug: install always happens from
 * here, never from a per-athlete token URL, so there's nothing
 * athlete-specific for iOS to get wrong.
 *
 * Identity comes from a session token in localStorage, not the URL —
 * valid session → resolve + render the app; no/invalid session → show
 * the PIN login screen.
 */
export default function AthleteStableEntry() {
  const [status, setStatus]   = useState('loading'); // loading | needs-login | ready
  const [athlete, setAthlete] = useState(null);

  const validate = async (sessionToken) => {
    if (!sessionToken) { setStatus('needs-login'); return; }
    try {
      const res = await fetch('/api/athlete-auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Session invalid.');
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
      try { localStorage.removeItem(SESSION_KEY); } catch (_e) {}
      setStatus('needs-login');
    }
  };

  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem(SESSION_KEY); } catch (_) {}
    validate(stored);
  }, []);

  const handleLoggedIn = (sessionToken, athleteData) => {
    try { localStorage.setItem(SESSION_KEY, sessionToken); } catch (_) {}
    setAthlete({
      id: athleteData.athlete_id,
      name: athleteData.name || 'Athlete',
      photo: athleteData.photo || null,
      sport: athleteData.sport || '',
      wellnessToken: athleteData.wellness_token || null,
      progressMetrics: [],
    });
    setStatus('ready');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <Loading />
      </div>
    );
  }

  if (status === 'needs-login') {
    return <AthletePinLogin onLoggedIn={handleLoggedIn} />;
  }

  return <AthleteAppShell athlete={athlete} />;
}
