import { lazy, Suspense, useState } from 'react';
import { TabBar } from '../ui';
import { useNutritionSettings } from '../../hooks/useNutritionSettings';
import { Camera, Image, Loader2 } from 'lucide-react';

// Lazy-load heavy children to keep the tab swap snappy.
const PillarTab     = lazy(() => import('./PillarTab'));
const NutritionTab  = lazy(() => import('./NutritionTab'));
const FoodDiaryView = lazy(() => import('../nutrition/FoodDiaryView'));

const SUBTABS = [
  { id: 'overview',    label: 'Overview'                  },
  { id: 'food_diary',  label: 'Food Diary'                },
  { id: 'guidance',    label: 'Meal Structure & Guidance' },
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
          <GuidancePlaceholder />
        )}
      </Suspense>
    </div>
  );
}

function GuidancePlaceholder() {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-8 text-center"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div
        className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}
      >
        <Image size={22} />
      </div>
      <p className="text-sm font-bold text-gray-900 mb-1">Meal Structure &amp; Guidance</p>
      <p className="text-xs text-gray-500 max-w-md mx-auto">
        This is where the recommended-plate guidance and athlete-facing meal structure
        cards will live. Coming in the next phase.
      </p>
    </div>
  );
}
