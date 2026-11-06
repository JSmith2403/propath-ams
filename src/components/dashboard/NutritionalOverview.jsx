import { useMemo } from 'react';
import { useUpdatesDashboard } from '../../hooks/useUpdatesDashboard';
import NutritionCard from './NutritionCard';

/**
 * Nutritional overview: the food and hydration submissions that used to sit on the main dashboard.
 * Loaded only when this section is open, so the athlete overview stays light.
 */
export default function NutritionalOverview({ athletes, onNavigateToAthlete }) {
  const ids = useMemo(() => athletes.map(a => a.id), [athletes]);
  const athleteById = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);
  const data = useUpdatesDashboard(ids);
  return (
    <div className="px-3 md:px-4 pb-4">
      <div className="min-h-[420px] md:min-h-[560px]">
        <NutritionCard data={data.loading ? null : data} athleteById={athleteById} onOpenAthlete={onNavigateToAthlete} />
      </div>
    </div>
  );
}
