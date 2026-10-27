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
 * Updates dashboard — four panels that answer "who needs me today?":
 *   Recent Updates · Nutrition Submissions (with hydration) · Athlete Wellness · Wellness Compliance.
 * "View all" on Recent Updates opens the full feed (filters, notes, messaging) and Back returns here.
 */
export default function UpdatesDashboard({ athletes, userName, onNavigateToAthlete, onNavigate, ...feedProps }) {
  const [feed, setFeed] = useState(false);
  const ids = useMemo(() => athletes.map(a => a.id), [athletes]);
  const athleteById = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);
  const data = useUpdatesDashboard(ids);

  if (feed) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <button onClick={() => setFeed(false)} className="inline-flex items-center gap-1.5 text-meta font-semibold px-5 py-3 border-b border-ink-100 self-stretch text-left" style={{ color: '#A58D69' }}>
          <ArrowLeft size={14} /> Back to dashboard
        </button>
        <RecentUpdatesView athletes={athletes} onNavigateToAthlete={onNavigateToAthlete} {...feedProps} />
      </div>
    );
  }

  const first = (userName || '').split(/[\s@]/)[0];
  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
      <div className="px-5 md:px-8 pt-6 pb-4">
        <h1 className="text-h1 font-bold text-ink-900">{greeting()}{first ? `, ${first}` : ''}</h1>
        <p className="text-meta text-ink-500">Here’s an overview of your athletes’ progress, wellness and nutrition.</p>
      </div>
      <div className="px-4 md:px-6 grid gap-4 xl:grid-cols-2 items-start">
        <div className="space-y-4 min-w-0">
          <RecentUpdatesCard athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} onViewAll={() => setFeed(true)} />
          <WellnessInsightsCard data={data.loading ? null : data} athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} onViewAll={() => onNavigate('wellness')} />
        </div>
        <div className="space-y-4 min-w-0">
          <NutritionCard data={data.loading ? null : data} athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} />
          <ComplianceCard athletes={athletes} onViewAll={() => onNavigate('wellness')} />
        </div>
      </div>
    </div>
  );
}
