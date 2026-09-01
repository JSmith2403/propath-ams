import { useState, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import TabBar from './TabBar';
import TrainingTab from './TrainingTab';
import InstallPrompt from '../InstallPrompt';
import WellnessCheckInGate from './WellnessCheckInGate';
import NotificationPrompt from './NotificationPrompt';

const ProgressTab  = lazy(() => import('./ProgressTab'));
const NutritionTab = lazy(() => import('./NutritionTab'));

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

const VALID_TABS = new Set(['train', 'progress', 'nutrition']);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * AthleteAppShell — the actual app UI (header, tabs, install/notification
 * prompts), independent of how `athlete` was resolved. Shared by both
 * entry points:
 *   - AthleteAppPage    (/athlete/:token — the original, unchanged path)
 *   - AthleteStableEntry (/athlete — PIN-login athletes, Phase 1 beta)
 *
 * `athlete` shape: { id, name, photo, sport, wellnessToken, progressMetrics }
 */
export default function AthleteAppShell({ athlete }) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActive] = useState(() => {
    const requested = searchParams.get('tab');
    return VALID_TABS.has(requested) ? requested : 'train';
  });
  const [scrollToResourcesNonce, setScrollToResourcesNonce] = useState(0);

  const handleTabChange = (id) => {
    if (id === 'resources') {
      if (activeTab !== 'train') setActive('train');
      setScrollToResourcesNonce(n => n + 1);
      return;
    }
    setActive(id);
  };

  return (
    <WellnessCheckInGate athleteId={athlete.id} wellnessToken={athlete.wellnessToken}>
    <div className="min-h-screen w-full bg-ink-100">
      <div className="min-h-screen flex flex-col mx-auto relative bg-ink-50 shadow-card"
        style={{ maxWidth: 480 }}>
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

        <TabBar active={activeTab} onChange={handleTabChange} />
      </div>
      <InstallPrompt />
      <NotificationPrompt athleteId={athlete.id} />
    </div>
    </WellnessCheckInGate>
  );
}

export { Loading };
