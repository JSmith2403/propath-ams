import { lazy, Suspense, useState } from 'react';
import { TabBar } from '../ui';
// No icon imports needed — sub-component children own their visuals.

// Lazy-load heavy children to keep the tab swap snappy. RAG status/notes
// moved to the Goals & Development tab; this tab is now purely the
// meal-logging surfaces.
const MealLoggingSettings  = lazy(() => import('../nutrition/MealLoggingSettings'));
const FoodDiaryView        = lazy(() => import('../nutrition/FoodDiaryView'));
const RecipesAdminView     = lazy(() => import('../nutrition/RecipesAdminView'));
const MealStructureBuilder = lazy(() => import('../nutrition/MealStructureBuilder'));

const SUBTABS = [
  { id: 'food_diary',  label: 'Food Diary'                },
  { id: 'guidance',    label: 'Meal Structure & Guidance' },
  { id: 'recipes',     label: 'Recipes'                   },
];

const GOLD = '#A58D69';

function SubTabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-7 h-7 rounded-full border-4 animate-spin"
        style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: GOLD }}
      />
    </div>
  );
}

/**
 * NutritionDomainTab — top-level wrapper for the Nutritional pillar,
 * modelled on PhysicalDevelopmentTab. Renders sub-tabs at the very
 * top using the shared TabBar so the visual treatment matches the
 * rest of the AMS (gold underline, ink-200 baseline).
 *
 *   Food Diary                   → MealLoggingSettings panel (Snap-and-
 *                                  Send on/off) + FoodDiaryView, three-
 *                                  column meal review per the supplied
 *                                  mockup.
 *   Meal Structure & Guidance    → the chronological structure builder.
 *   Recipes                      → recipe library admin.
 *
 * RAG status, the note log, and "Working On" now live in the Goals &
 * Development tab instead of a Nutrition-specific Overview sub-tab.
 */
export default function NutritionDomainTab({
  athleteId,
  athleteName,
  // Sub-tab persistence (lifted to AthleteProfile so the user comes
  // back to the same sub-tab when bouncing between athletes).
  subTab,
  onChangeSubTab,
}) {
  // Fallback when the parent doesn't lift the sub-tab state.
  const [internalSubTab, setInternalSubTab] = useState('food_diary');
  const active   = subTab ?? internalSubTab;
  const setActive = onChangeSubTab ?? setInternalSubTab;

  return (
    <div>
      <TabBar tabs={SUBTABS} active={active} onChange={setActive} className="mb-6 no-print" />

      <Suspense fallback={<SubTabLoader />}>
        {active === 'food_diary' && (
          <>
            <MealLoggingSettings athleteId={athleteId} />
            <FoodDiaryView athleteId={athleteId} athleteName={athleteName} />
          </>
        )}

        {active === 'guidance' && (
          <MealStructureBuilder athleteId={athleteId} athleteName={athleteName} />
        )}

        {active === 'recipes' && (
          <RecipesAdminView />
        )}
      </Suspense>
    </div>
  );
}
