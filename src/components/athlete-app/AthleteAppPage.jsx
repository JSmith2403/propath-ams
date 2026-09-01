import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import AthleteAppShell, { Loading } from './AthleteAppShell';
import AthletePinSetup from './AthletePinSetup';

const SESSION_KEY = 'propath_athlete_session';

/**
 * The ORIGINAL per-athlete entry point (/athlete/:token) — unchanged
 * for every athlete except the one(s) with pin_login_enabled set on
 * their athlete_app_tokens row (see token-session.js). That flag keeps
 * this whole PIN-login feature invisible to everyone until it's proven
 * out on a single athlete.
 *
 * Flow when the flag IS on:
 *   token valid → mint a session → already has a PIN? redirect to the
 *   stable /athlete URL (this is what actually fixes the iOS install
 *   bug — install must happen from the stable URL, never from here) →
 *   no PIN yet? show the one-time setup screen, which itself redirects
 *   to /athlete once done.
 */
export default function AthleteAppPage() {
  const { token } = useParams();
  const [status, setStatus]   = useState('loading'); // loading | invalid | needs-pin-setup | ready
  const [athlete, setAthlete] = useState(null);
  const [pinSession, setPinSession] = useState(null); // { sessionToken } while showing setup

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Token validation goes through a SECURITY DEFINER RPC — anon has
      // no direct SELECT on athlete_app_tokens, so tokens can't be
      // enumerated. The RPC also returns the athlete display fields.
      const { data: rpcRows } = await supabase
        .rpc('validate_athlete_token', { p_token: token });
      const tokenRow = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;

      if (cancelled) return;
      if (!tokenRow || !tokenRow.is_active) {
        try {
          if (localStorage.getItem('propath_athlete_token') === token) {
            localStorage.removeItem('propath_athlete_token');
          }
        } catch (_) {}
        setStatus('invalid');
        return;
      }

      const resolvedAthlete = {
        id:    tokenRow.athlete_id,
        name:  tokenRow.name  || 'Athlete',
        photo: tokenRow.photo || null,
        sport: tokenRow.sport || '',
        wellnessToken: tokenRow.wellness_token || null,
        progressMetrics: Array.isArray(tokenRow.progress_metrics) ? tokenRow.progress_metrics : [],
      };

      // Ask whether PIN-login is switched on for this athlete. Off for
      // everyone except the beta athlete — falls straight through to
      // today's unchanged behaviour when it is.
      let pinResult = null;
      try {
        const res = await fetch('/api/athlete-auth/token-session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        pinResult = await res.json();
      } catch (_) {
        pinResult = { ok: false };
      }
      if (cancelled) return;

      if (pinResult?.ok && pinResult.enabled) {
        try { localStorage.setItem(SESSION_KEY, pinResult.sessionToken); } catch (_) {}
        if (pinResult.hasPin) {
          window.location.replace('/athlete');
          return;
        }
        setAthlete(resolvedAthlete);
        setPinSession({ sessionToken: pinResult.sessionToken });
        setStatus('needs-pin-setup');
        return;
      }

      // PIN-login not enabled for this athlete — unchanged path.
      setAthlete(resolvedAthlete);
      try { localStorage.setItem('propath_athlete_token', token); } catch (_) {}
      setStatus('ready');
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-ink-50">
        <img src={logo} alt="ProPath" style={{ width: '160px' }} className="mb-8" />
        <p className="text-center text-meta text-ink-500">
          This link is not active. Please contact your coach.
        </p>
      </div>
    );
  }

  if (status === 'loading' || !athlete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <Loading />
      </div>
    );
  }

  if (status === 'needs-pin-setup') {
    return <AthletePinSetup athleteName={athlete.name} sessionToken={pinSession.sessionToken} />;
  }

  return <AthleteAppShell athlete={athlete} />;
}
