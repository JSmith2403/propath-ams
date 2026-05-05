import { lazy, Suspense } from 'react';
import { TabBar } from '../ui';
import WorkingOnSection from '../WorkingOnSection';

// Lazy-load the heavy children — Overview's PillarTab, Testing's
// PerformanceTestingTab, and Programme's ProgrammeView.
const PillarTab             = lazy(() => import('./PillarTab'));
const PerformanceTestingTab = lazy(() => import('./PerformanceTestingTab'));
const ProgrammeView         = lazy(() => import('../programming/ProgrammeView'));
const LoggedSessionsTab     = lazy(() => import('./LoggedSessionsTab'));

const SUBTABS = [
  { id: 'overview',  label: 'Overview'      },
  { id: 'programme', label: 'Programme'     },
  { id: 'logged',    label: 'Progress'      },  // hosts the Progress Dashboard above the session log
  { id: 'testing',   label: 'Testing Data'  },
];

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
  // Deep-link focus for the Programme sub-tab — set when the user clicks
  // a gym session pill on the Overview Calendar. Forwarded to ProgrammeView.
  programmeFocus = null,

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
      <TabBar tabs={SUBTABS} active={subTab} onChange={onChangeSubTab} className="mb-6 no-print" />

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
            initialFocus={programmeFocus}
          />
        )}

        {subTab === 'logged' && (
          <LoggedSessionsTab athlete={athlete} />
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
