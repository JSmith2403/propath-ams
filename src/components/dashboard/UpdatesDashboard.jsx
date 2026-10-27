import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useUpdatesDashboard } from '../../hooks/useUpdatesDashboard';
import RecentUpdatesView from '../recent/RecentUpdatesView';
import RecentUpdatesCard from './RecentUpdatesCard';
import NutritionCard from './NutritionCard';
import WellnessInsightsCard from './WellnessInsightsCard';
import ComplianceCard from './ComplianceCard';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/**
 * Updates dashboard — four panels on ONE static screen, each scrolling inside itself:
 *   Recent Updates (completed training sessions) · Nutrition Submissions (with hydration)
 *   Athlete Wellness · Wellness Compliance.
 * On a wide screen the grid fills the window exactly, so nothing needs a page scroll. On narrower screens the
 * panels stack at a fixed height and the page scrolls instead. "View all" opens the full feed; Back returns.
 */
export default function UpdatesDashboard({ athletes, userName, onNavigateToAthlete, onNavigate, ...feedProps }) {
  const [feed, setFeed] = useState(false);
  const ids = useMemo(() => athletes.map(a => a.id), [athletes]);
  const athleteById = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);
  const data = useUpdatesDashboard(ids);

  if (feed) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <button onClick={() => setFeed(false)} className="inline-flex items-center gap-1.5 text-meta font-semibold px-5 py-3 border-b border-ink-100 self-stretch text-left bg-white shrink-0" style={{ color: '#A58D69' }}>
          <ArrowLeft size={14} /> Back to dashboard
        </button>
        <RecentUpdatesView athletes={athletes} onNavigateToAthlete={onNavigateToAthlete} {...feedProps} />
      </div>
    );
  }

  const first = (userName || '').split(/[\s@]/)[0];
  const cell = 'h-[420px] xl:h-auto min-h-0 min-w-0';
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto xl:overflow-hidden pb-24 md:pb-0">
      <div className="px-5 md:px-6 pt-4 pb-2 shrink-0">
        <h1 className="text-h2 font-bold text-ink-900 leading-tight">{greeting()}{first ? `, ${first}` : ''}</h1>
        <p className="text-micro text-ink-500">Here’s an overview of your athletes’ progress, wellness and nutrition.</p>
      </div>
      <div className="px-3 md:px-4 pb-3 grid gap-3 xl:flex-1 xl:min-h-0 xl:grid-cols-2 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={cell}><RecentUpdatesCard athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} onViewAll={() => setFeed(true)} /></div>
        <div className={cell}><NutritionCard data={data.loading ? null : data} athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} /></div>
        <div className={cell}><WellnessInsightsCard data={data.loading ? null : data} athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} onViewAll={() => onNavigate('wellness')} /></div>
        <div className={cell}><ComplianceCard athletes={athletes} onViewAll={() => onNavigate('wellness')} /></div>
      </div>
    </div>
  );
}
