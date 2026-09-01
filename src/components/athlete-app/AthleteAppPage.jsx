import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import AthleteAppShell, { Loading } from './AthleteAppShell';
import AthletePinSetup from './AthletePinSetup';

/**
 * The ORIGINAL per-athlete entry point (/athlete/:token) — unchanged
 * for every athlete except the one(s) with pin_login_enabled set on
 * their athlete_app_tokens row (see status.js). That flag keeps this
 * whole real-login feature invisible to everyone until it's proven
 * out on a single athlete.
 *
 * Flow when the flag IS on:
 *   token valid → already has an account? redirect to the stable
 *   /athlete URL (this is what actually fixes the iOS install bug —
 *   install must happen from the stable URL, never from here) → no
 *   account yet? show the one-time setup screen, which itself signs
 *   in and redirects to /athlete once done.
 */
export default function AthleteAppPage() {
  const { token } = useParams();
  const [status, setStatus]   = useState('loading'); // loading | invalid | needs-pin-setup | ready
  const [athlete, setAthlete] = useState(null);
  const [suggestedUsername, setSuggestedUsername] = useState('');

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

      // Ask whether real-account login is switched on for this athlete.
      // Off for everyone except the beta athlete — falls straight
      // through to today's unchanged behaviour when it is.
      let statusResult = null;
      try {
        const res = await fetch('/api/athlete-auth/status', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        statusResult = await res.json();
      } catch (_) {
        statusResult = { ok: false };
      }
      if (cancelled) return;

      if (statusResult?.ok && statusResult.enabled) {
        if (statusResult.hasAccount) {
          window.location.replace('/athlete');
          return;
        }
        setAthlete(resolvedAthlete);
        setSuggestedUsername(statusResult.suggestedUsername || '');
        setStatus('needs-pin-setup');
        return;
      }

      // Real-account login not enabled for this athlete — unchanged path.
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
    return <AthletePinSetup athleteName={athlete.name} token={token} suggestedUsername={suggestedUsername} />;
  }

  return <AthleteAppShell athlete={athlete} />;
}
