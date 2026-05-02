import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import TabBar from './TabBar';
import TrainingTab from './TrainingTab';
import InstallPrompt from '../InstallPrompt';

// Wellness + Readiness are no longer surfaced as tabs. Wellness lives
// on the home (Training) screen; Readiness is deferred for v1.
const ProgressTab  = lazy(() => import('./ProgressTab'));

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: tokenRow } = await supabase
        .from('athlete_app_tokens')
        .select('athlete_id, is_active')
        .eq('token', token)
        .maybeSingle();

      if (cancelled) return;
      if (!tokenRow || !tokenRow.is_active) {
        setStatus('invalid');
        return;
      }

      const { data: athleteRow } = await supabase
        .from('athletes')
        .select('id, data')
        .eq('id', tokenRow.athlete_id)
        .single();

      if (cancelled) return;
      const d = athleteRow?.data || {};
      setAthlete({
        id:    tokenRow.athlete_id,
        name:  d.name  || 'Athlete',
        photo: d.photo || null,
        sport: d.sport || '',
      });
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
          {activeTab === 'train' && <TrainingTab athleteId={athlete.id} athleteName={athlete.name} />}
          <Suspense fallback={<Loading />}>
            {activeTab === 'progress' && <ProgressTab />}
          </Suspense>
        </main>

        {/* Bottom tab bar */}
        <TabBar active={activeTab} onChange={setActive} />
      </div>
      <InstallPrompt />
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
