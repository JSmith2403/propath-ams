import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import SaveErrorToast from './components/SaveErrorToast.jsx'
import './index.css'

// The coach App is now lazy too. Athletes loading /athlete/:token used
// to pay for the entire coach surface (AthleteProfile, DataEntryView,
// ProgrammeMasterView, ResourcesAdminView…) on first paint even though
// they never see any of it. Lazy splitting drops the athlete first-
// paint bundle by hundreds of kilobytes.
const App = lazy(() => import('./App.jsx'))

// ── PWA athlete-app launch shortcut ──────────────────────────────────────────
// Home-screen launches keep landing on "/" (the coach admin root) for
// athletes despite everything tried on the manifest/start_url side —
// iOS's actual Add to Home Screen behaviour here has proven inconsistent
// across multiple attempts, in ways that couldn't be pinned down without
// physical-device access. Rather than keep chasing that, this makes the
// app self-correct at boot regardless of which URL the icon actually
// captured: if we're standalone, at "/", and there's evidence of an
// athlete on this device, redirect BEFORE React mounts so the coach
// login never has a chance to flash up.
;(function redirectStandaloneAthlete() {
  try {
    if (window.location.pathname !== '/') return;
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches
      || window.navigator?.standalone === true;
    if (!isStandalone) return;

    // Legacy token-only athletes (pin_login_enabled off) — unchanged.
    const legacyToken = localStorage.getItem('propath_athlete_token');
    if (legacyToken) {
      window.location.replace(`/athlete/${legacyToken}${window.location.search}`);
      return;
    }

    // Real-auth athletes: a Supabase session under the reserved athlete
    // email domain means this device belongs to an athlete, full stop —
    // send it to /athlete rather than ever rendering the coach shell.
    // Reading the persisted session directly (not calling supabase.auth)
    // keeps this synchronous, so it runs before any component mounts.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      const email = parsed?.user?.email || parsed?.currentSession?.user?.email || '';
      if (email.endsWith('@athletes.propath.internal')) {
        window.location.replace('/athlete');
      }
      break;
    }
  } catch (_) { /* best effort */ }
})();

const WellnessFormPage  = lazy(() => import('./components/wellness/WellnessFormPage.jsx'))
const AthleteAppPage    = lazy(() => import('./components/athlete-app/AthleteAppPage.jsx'))
// Stable, token-free entry point for PIN-login athletes (see
// AthleteStableEntry's own doc comment) — this is what Add to Home
// Screen should point at once an athlete has a PIN set up.
const AthleteStableEntry = lazy(() => import('./components/athlete-app/AthleteStableEntry.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route
          path="/wellness/:token"
          element={
            <Suspense fallback={null}>
              <WellnessFormPage />
            </Suspense>
          }
        />
        <Route
          path="/athlete"
          element={
            <Suspense fallback={null}>
              <AthleteStableEntry />
            </Suspense>
          }
        />
        <Route
          path="/athlete/:token"
          element={
            <Suspense fallback={null}>
              <AthleteAppPage />
            </Suspense>
          }
        />
        <Route
          path="/*"
          element={
            <Suspense fallback={null}>
              <App />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
    <SaveErrorToast />
    </ErrorBoundary>
  </React.StrictMode>,
)
