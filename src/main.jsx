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
// The web manifest's start_url is "/" so any home-screen launch lands at
// the AMS root. Athletes who installed from /athlete/:token would otherwise
// see the coach login screen on every relaunch. If we have a remembered
// token AND we're running in standalone mode AND the user is at "/", swap
// the URL synchronously BEFORE React mounts so there's no flash.
;(function redirectStandaloneAthlete() {
  try {
    if (window.location.pathname !== '/') return;
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches
      || window.navigator?.standalone === true;
    if (!isStandalone) return;
    const token = localStorage.getItem('propath_athlete_token');
    if (token) window.location.replace(`/athlete/${token}${window.location.search}`);
  } catch (_) { /* best effort */ }
})();

const WellnessFormPage = lazy(() => import('./components/wellness/WellnessFormPage.jsx'))
const AthleteAppPage   = lazy(() => import('./components/athlete-app/AthleteAppPage.jsx'))

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
