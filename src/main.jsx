import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

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
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
