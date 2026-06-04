import { lazy, Suspense, useState } from 'react';
import { TabBar } from '../ui';
// No icon imports needed — sub-component children own their visuals.

// Lazy-load heavy children to keep the tab swap snappy.
const PillarTab     = lazy(() => import('./PillarTab'));
const NutritionTab  = lazy(() => import('./NutritionTab'));
const FoodDiaryView     = lazy(() => import('../nutrition/FoodDiaryView'));
const RecipesAdminView  = lazy(() => import('../nutrition/RecipesAdminView'));
const GuidanceEditor    = lazy(() => import('../nutrition/GuidanceEditor'));

const SUBTABS = [
  { id: 'overview',    label: 'Overview'                  },
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
 *   Overview                     → PillarTab (RAG status + log) with the
 *                                  meal-logging settings panel +
 *                                  Currently-Working-On cards rendered
 *                                  inside it (matches Physical's
 *                                  pattern of hosting the original
 *                                  PillarTab inside the Overview sub-tab).
 *   Food Diary                   → FoodDiaryView — three-column meal
 *                                  review per the supplied mockup.
 *   Meal Structure & Guidance    → placeholder for the food-structure
 *                                  guidance module (mockup-only for now).
 */
export default function NutritionDomainTab({
  athleteId,
  athleteName,
  // Pillar plumbing — forwarded to PillarTab on Overview
  ragStatus,
  ragLogEntries,
  highlightEntryId,
  onStatusChange,
  onAddRagEntry,
  onDeleteRagEntry,
  onClearHighlight,
  // NutritionTab plumbing (working-on cards + meal logging toggle)
  workingOn,
  onSaveWorkingOn,
  // Sub-tab persistence (lifted to AthleteProfile so the user comes
  // back to the same sub-tab when bouncing between athletes).
  subTab,
  onChangeSubTab,
}) {
  // Fallback when the parent doesn't lift the sub-tab state.
  const [internalSubTab, setInternalSubTab] = useState('overview');
  const active   = subTab ?? internalSubTab;
  const setActive = onChangeSubTab ?? setInternalSubTab;

  return (
    <div>
      <TabBar tabs={SUBTABS} active={active} onChange={setActive} className="mb-6 no-print" />

      <Suspense fallback={<SubTabLoader />}>
        {active === 'overview' && (
          <PillarTab
            label="Nutrition"
            domain="nutrition"
            status={ragStatus}
            logEntries={ragLogEntries}
            onStatusChange={onStatusChange}
            onAddEntry={onAddRagEntry}
            onDeleteEntry={onDeleteRagEntry}
            highlightEntryId={highlightEntryId}
            onClearHighlight={onClearHighlight}
            preContent={
              <NutritionTab
                athleteId={athleteId}
                athleteName={athleteName}
                workingOn={workingOn}
                onSaveWorkingOn={onSaveWorkingOn}
                hideSubTabs        /* sub-tab nav is owned by NutritionDomainTab now */
              />
            }
          />
        )}

        {active === 'food_diary' && (
          <FoodDiaryView athleteId={athleteId} athleteName={athleteName} />
        )}

        {active === 'guidance' && (
          <GuidanceEditor athleteId={athleteId} athleteName={athleteName} />
        )}

        {active === 'recipes' && (
          <RecipesAdminView />
        )}
      </Suspense>
    </div>
  );
}

// GuidancePlaceholder removed — GuidanceEditor now mounts here.
