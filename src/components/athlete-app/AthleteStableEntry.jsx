import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import AthleteAppShell, { Loading } from './AthleteAppShell';
import AthletePinLogin from './AthletePinLogin';
import AthleteSetPassword from './AthleteSetPassword';
import AthleteOnboarding from './AthleteOnboarding';
import InstallPrompt from '../InstallPrompt';

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
  const [status, setStatus]   = useState('loading'); // loading | needs-login | set-password | onboarding | ready | wrong-role
  const [athlete, setAthlete] = useState(null);
  const [username, setUsername] = useState('');
  const [notice, setNotice] = useState(null);
  // True from the moment someone lands on "choose your own password" until they've been through
  // the first-time guide. Saving a password fires Supabase's own "user updated" event, which
  // would otherwise whisk them straight into the app and skip the guide.
  const firstTimeFlow = useRef(false);

  const resolve = useCallback(async (session) => {
    if (!session) { setStatus('needs-login'); return; }
    // A coach-issued starting password only gets them as far as choosing their own.
    const meta = session.user?.user_metadata || {};
    if (meta.must_change_password) {
      if (meta.temp_password_expires_at && new Date(meta.temp_password_expires_at) < new Date()) {
        setNotice('That starting password has expired. Tap "Forgot your password?" and your coach will send a new one.');
        await supabase.auth.signOut();
        setStatus('needs-login');      // keeps the notice above visible on the sign-in screen
        return;
      }
      setUsername((session.user.email || '').split('@')[0]);
      firstTimeFlow.current = true;
      setStatus('set-password');
      return;
    }
    if (firstTimeFlow.current) {
      // Just finished choosing a password. In a browser tab, show the guide (save the
      // password + add to Home Screen); if they're already in the installed app, carry on.
      const installed = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator?.standalone === true;
      if (!installed) { setStatus('onboarding'); return; }
      firstTimeFlow.current = false;
    }
    setNotice(null);
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

  // Remember that this home-screen install belongs to an athlete, so a
  // launch that lands on "/" (see main.jsx) is sent back here even when
  // they've been signed out. Only set when actually running as an installed
  // app — a coach previewing /athlete in a normal tab must not be redirected.
  useEffect(() => {
    try {
      const standalone = window.matchMedia?.('(display-mode: standalone)').matches
        || window.navigator?.standalone === true;
      if (standalone) localStorage.setItem('propath_athlete_device', '1');
    } catch (_) { /* private mode — best effort */ }
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

  if (status === 'set-password') {
    return (
      <AthleteSetPassword
        username={username}
        onDone={() => supabase.auth.getSession().then(({ data: { session } }) => resolve(session))}
        onSignOut={() => supabase.auth.signOut()}
      />
    );
  }

  if (status === 'onboarding') {
    return (
      <AthleteOnboarding
        onDone={() => {
          firstTimeFlow.current = false;
          supabase.auth.getSession().then(({ data: { session } }) => resolve(session));
        }}
      />
    );
  }

  if (status === 'needs-login') {
    // InstallPrompt here (not just inside the logged-in shell) so a new
    // athlete can add the app to their home screen before they've even
    // signed in — it hides itself when already installed.
    return (<><AthletePinLogin notice={notice} /><InstallPrompt /></>);
  }

  return <AthleteAppShell athlete={athlete} />;
}
