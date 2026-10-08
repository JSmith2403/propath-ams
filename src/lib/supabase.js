import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    '[ProPath] Supabase credentials missing. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Athletes and coaches share one origin, so by default they'd share one saved sign-in and
// logging in as an athlete would sign the coach out of that browser. The athlete app (/athlete…)
// keeps its login in its own slot instead, so a coach can stay signed in on one tab and open
// an athlete in another.
export const ATHLETE_AUTH_KEY = 'propath-athlete-auth';
const isAthleteApp = typeof window !== 'undefined' && window.location.pathname.split('/')[1] === 'athlete';

// One-off move for anyone already signed in as an athlete under the shared slot (e.g. a phone
// that's been testing): carry that login across, and free the shared slot for coaches.
if (isAthleteApp) {
  try {
    const shared = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (shared && !localStorage.getItem(ATHLETE_AUTH_KEY)) {
      const raw = localStorage.getItem(shared) || '';
      if (raw.includes('@athletes.propath.internal')) {
        localStorage.setItem(ATHLETE_AUTH_KEY, raw);
        localStorage.removeItem(shared);
      }
    }
  } catch (_) { /* private mode — they'll just sign in again */ }
}

export const supabase = createClient(url ?? '', key ?? '', isAthleteApp ? { auth: { storageKey: ATHLETE_AUTH_KEY } } : undefined);
