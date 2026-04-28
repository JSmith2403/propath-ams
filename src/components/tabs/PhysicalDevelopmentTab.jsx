import { lazy, Suspense } from 'react';
import WorkingOnSection from '../WorkingOnSection';

// Lazy-load the heavy children — Overview's PillarTab, Testing's
// PerformanceTestingTab, and Programme's ProgrammeView.
const PillarTab             = lazy(() => import('./PillarTab'));
const PerformanceTestingTab = lazy(() => import('./PerformanceTestingTab'));
const ProgrammeView         = lazy(() => import('../programming/ProgrammeView'));

const SUBTABS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'programme', label: 'Programme' },
  { id: 'testing',   label: 'Testing'   },
];

// Mirrors the top-level TabBar styling (gold underline, gray inactive)
// but slightly more compact so it reads as a secondary nav.
function SubTabBar({ active, onChange }) {
  return (
    <div className="border-b border-gray-200 mb-6 no-print">
      <div className="flex">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: active === t.id ? '#A58D69' : '#6b7280',
              borderBottom: active === t.id ? '2px solid #A58D69' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubTabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
      />
    </div>
  );
}

/**
 * PhysicalDevelopmentTab — host for three sub-tabs:
 *   • Overview   — existing Physical pillar content (RAG, Working On, log)
 *   • Programme  — placeholder until Brief 2 Part B
 *   • Testing    — existing Performance Testing tab content
 *
 * Sub-tab state is owned by the parent (AthleteProfile) so that switching
 * away to another top-level tab and back returns the user to the same
 * sub-tab they were last on for the lifetime of the open profile.
 */
export default function PhysicalDevelopmentTab({
  // sub-tab state (lifted to AthleteProfile)
  subTab,
  onChangeSubTab,

  // shared
  athlete,
  phase2,
  allAthletes = [],
  role,

  // Overview (Physical pillar)
  ragStatus,
  ragLogEntries,
  highlightEntryId,
  onStatusChange,
  onAddRagEntry,
  onDeleteRagEntry,
  onClearHighlight,
  onSavePhysicalWorkingOn,

  // Testing (Performance Testing)
  onAddPerformanceEntry,
  onSavePerformanceBrag,
  onSaveReportMetrics,
}) {
  return (
    <div>
      <SubTabBar active={subTab} onChange={onChangeSubTab} />

      <Suspense fallback={<SubTabLoader />}>
        {subTab === 'overview' && (
          <PillarTab
            label="Physical"
            domain="physical"
            status={ragStatus}
            logEntries={ragLogEntries}
            onStatusChange={onStatusChange}
            onAddEntry={onAddRagEntry}
            onDeleteEntry={onDeleteRagEntry}
            highlightEntryId={highlightEntryId}
            onClearHighlight={onClearHighlight}
            preContent={(
              <WorkingOnSection
                workingOn={phase2.physical?.workingOn}
                onSave={onSavePhysicalWorkingOn}
              />
            )}
            noteFormFirst
          />
        )}

        {subTab === 'programme' && (
          <ProgrammeView
            athlete={athlete}
            role={role}
          />
        )}

        {subTab === 'testing' && (
          <PerformanceTestingTab
            athlete={athlete}
            entries={phase2.performance?.entries || {}}
            maturationEntries={phase2.maturation?.entries || []}
            bragRatings={phase2.performanceBrag || {}}
            reportMetrics={phase2.reportMetrics || []}
            onSaveBrag={onSavePerformanceBrag}
            onSaveReportMetrics={onSaveReportMetrics}
            onAddEntry={onAddPerformanceEntry}
          />
        )}
      </Suspense>
    </div>
  );
}
