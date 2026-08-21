import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import TabBar from './TabBar';
import TrainingTab from './TrainingTab';
import InstallPrompt from '../InstallPrompt';
import WellnessCheckInGate from './WellnessCheckInGate';
import NotificationPrompt from './NotificationPrompt';

// Wellness lives on the Training screen, Resources lives at the bottom
// of the Training screen as a section (the bottom-nav 'Resources' button
// scroll-shortcuts to it). Readiness is deferred for v1.
const ProgressTab   = lazy(() => import('./ProgressTab'));
const NutritionTab  = lazy(() => import('./NutritionTab'));

function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-4 animate-spin"
        style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
      />
    </div>
  );
}

export default function AthleteAppPage() {
  const { token } = useParams();

  const [status, setStatus]     = useState('loading'); // loading | invalid | ready
  const [athlete, setAthlete]   = useState(null);
  const [activeTab, setActive]  = useState('train');
  // Bumped each time the user taps the bottom-nav Resources button so
  // TrainingTab knows to scroll its #resources anchor into view.
  const [scrollToResourcesNonce, setScrollToResourcesNonce] = useState(0);

  // Bottom-nav handler — Resources isn't a route, it's a scroll shortcut
  // anchored inside the Training tab. Clicking it switches to Training
  // (if elsewhere) and bumps the nonce so the embedded section scrolls.
  const handleTabChange = (id) => {
    if (id === 'resources') {
      if (activeTab !== 'train') setActive('train');
      setScrollToResourcesNonce(n => n + 1);
      return;
    }
    setActive(id);
  };

  // The PWA manifest <link> for athlete pages is set BEFORE React mounts,
  // by an inline script in index.html that detects /athlete/<token> in
  // the URL and points the manifest at /api/manifest/<token>. That
  // serverless endpoint returns a manifest whose start_url is the
  // athlete's token URL, so Add to Home Screen captures the correct
  // launch URL. Nothing for React to do at runtime.

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
        // Token no longer valid — drop any stale PWA-launch redirect so
        // the athlete doesn't get bounced back here on next launch.
        try {
          if (localStorage.getItem('propath_athlete_token') === token) {
            localStorage.removeItem('propath_athlete_token');
          }
        } catch (_) {}
        setStatus('invalid');
        return;
      }

      setAthlete({
        id:    tokenRow.athlete_id,
        name:  tokenRow.name  || 'Athlete',
        photo: tokenRow.photo || null,
        sport: tokenRow.sport || '',
        // Null when wellness monitoring is toggled off for this athlete —
        // gates the mandatory daily check-in below.
        wellnessToken: tokenRow.wellness_token || null,
        // Metric keys the coach has pinned to this athlete's Progress tab.
        progressMetrics: Array.isArray(tokenRow.progress_metrics) ? tokenRow.progress_metrics : [],
      });
      // Remember this token so future PWA launches (start_url is "/")
      // can redirect the user back to their athlete app instead of
      // dumping them on the AMS login screen.
      try { localStorage.setItem('propath_athlete_token', token); } catch (_) {}
      setStatus('ready');
    })();
    return () => { cancelled = true; };
  }, [token]);

  // ── Invalid token ────────────────────────────────────────────────────────
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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === 'loading' || !athlete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <Loading />
      </div>
    );
  }

  // ── Ready ────────────────────────────────────────────────────────────────
  // Outer wrapper paints a soft ink-tinted backdrop so the constrained
  // 480px content column reads as a phone preview on desktop while
  // staying edge-to-edge on real phones.
  return (
    <WellnessCheckInGate athleteId={athlete.id} wellnessToken={athlete.wellnessToken}>
    <div className="min-h-screen w-full bg-ink-100">
      <div className="min-h-screen flex flex-col mx-auto relative bg-ink-50 shadow-card"
        style={{ maxWidth: 480 }}>
        {/* Header — slim sticky bar with avatar + greeting + logo */}
        <header
          className="sticky top-0 z-20 px-4 py-2.5 flex items-center gap-3 bg-white border-b border-ink-100"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-ink-200 bg-ink-100">
            {athlete.photo
              ? <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
              : (
                <span className="text-[10px] font-bold text-ink-600">
                  {athlete.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
          </div>
          <p className="flex-1 text-meta text-ink-500">{greeting()}</p>
          <img src={logo} alt="ProPath" style={{ height: '20px' }} />
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto pb-24">
          {activeTab === 'train' && (
            <TrainingTab
              athleteId={athlete.id}
              athleteName={athlete.name}
              scrollToResourcesNonce={scrollToResourcesNonce}
              onOpenNutrition={() => setActive('nutrition')}
            />
          )}
          <Suspense fallback={<Loading />}>
            {activeTab === 'progress'  && (
              <ProgressTab athleteId={athlete.id} progressMetrics={athlete.progressMetrics} />
            )}
            {activeTab === 'nutrition' && <NutritionTab athleteId={athlete.id} />}
          </Suspense>
        </main>

        {/* Bottom tab bar */}
        <TabBar active={activeTab} onChange={handleTabChange} />
      </div>
      <InstallPrompt />
      <NotificationPrompt athleteId={athlete.id} />
    </div>
    </WellnessCheckInGate>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
