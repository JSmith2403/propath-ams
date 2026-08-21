import { useState, useEffect, lazy, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';

// Lazy-load heavy tabs to keep initial bundle lean
const MaturationTab           = lazy(() => import('./tabs/MaturationTab'));
const MobilityTab             = lazy(() => import('./tabs/MobilityTab'));
const PhysicalDevelopmentTab  = lazy(() => import('./tabs/PhysicalDevelopmentTab'));
const GoalsTab                 = lazy(() => import('./tabs/GoalsTab'));
const PhysioTab               = lazy(() => import('./tabs/PhysioTab'));
const NutritionDomainTab      = lazy(() => import('./tabs/NutritionDomainTab'));
const PsychTab                = lazy(() => import('./tabs/PsychTab'));
const ReportTab               = lazy(() => import('./tabs/ReportTab'));
const WellnessTab             = lazy(() => import('./tabs/WellnessTab'));

// RAG status, notes, and "Working On" for every domain now live in
// Goals & Development — Psychological/Nutritional keep only their
// non-RAG content (ACSI-28 / meal-logging surfaces), and Lifestyle
// (which had nothing else) is retired as a tab entirely.
const TABS = [
  { id: 'overview',       label: 'Overview'             },
  { id: 'goals',          label: 'Goals & Development'  },
  { id: 'physical-dev',   label: 'Physical Development' },
  { id: 'rag-psych',      label: 'Psychological'        },
  { id: 'rag-nutrition',  label: 'Nutritional'          },
  { id: 'wellness',       label: 'Wellness'             },
  { id: 'maturation',     label: 'Maturation'           },
  { id: 'mobility',       label: 'Mobility'             },
  { id: 'physio',         label: 'Physio Assessment'    },
  { id: 'report',         label: 'Report'               },
];

function TabBar({ active, onChange }) {
  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto scrollbar-thin no-print">
      <div className="flex px-8 min-w-max">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors"
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

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }} />
    </div>
  );
}

function uid() {
  return crypto.randomUUID();
}

export default function AthleteProfile({
  athlete, onBack, allAthletes = [],
  role,
  initialTab, initialHighlight,
  onUpdate, onUpdateRag, onAddRagEntry, onUpdatePhoto,
  // Phase 2
  onAddMaturationEntry, onAddMobilityEntry, onAddPerformanceEntry,
  onAddPhysioEntry, onAddNutritionEntry, onAddAcsi28Entry, onAddPsychNote,
  onSavePerformanceBrag, onSaveReportMetrics,
  onDeleteRagEntry, onUpdatePhysioEntry, onDeletePhysioEntry,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  // Physical Development sub-tab state — persisted across top-level tab
  // switches for the lifetime of the open profile. Defaults to
  // 'programme' now that Overview (RAG/notes) has moved to Goals &
  // Development.
  const [physicalDevSubTab, setPhysicalDevSubTab] = useState('programme');
  // Deep-link focus for the Programme sub-tab — bumped (and ProgrammeView
  // re-applies) every time the user clicks a gym session pill on the
  // Overview Calendar. Shape: { viewMode, viewDate, nonce } | null.
  const [programmeFocus, setProgrammeFocus] = useState(null);
  const [localAthlete, setLocalAthlete] = useState(athlete);

  // Keep localAthlete in sync when the athlete prop updates externally
  // (e.g. after initial session sync populates phase2 performance entries)
  useEffect(() => { setLocalAthlete(athlete); }, [athlete]);

  // { domain: string, entryId: string } | null
  const [highlightEntry, setHighlightEntry] = useState(initialHighlight || null);

  // ── RAG pillar handlers (source of truth for pillar sections) ─────────────
  const handleStatusChange = (domain, status) => {
    setLocalAthlete(a => ({ ...a, rag: { ...a.rag, [domain]: status } }));
    onUpdateRag(localAthlete.id, domain, status);
  };

  const handleAddRagEntry = (domain, entryData) => {
    // Use the manually entered session date when provided; fall back to now
    const timestamp = entryData.sessionDate
      ? new Date(entryData.sessionDate + 'T12:00:00').toISOString()
      : new Date().toISOString();
    const status = entryData.status ?? localAthlete.rag[domain];
    const entry = {
      id: uid(),
      timestamp,
      staff: entryData.staff,
      status,
      note: entryData.note,
      source: entryData.source || 'manual',
      entryType: entryData.entryType || 'General note',
    };
    // Update both the log entry AND the overall pillar RAG atomically
    setLocalAthlete(a => ({
      ...a,
      rag: { ...a.rag, [domain]: status },
      ragLog: { ...a.ragLog, [domain]: [entry, ...(a.ragLog?.[domain] || [])] },
    }));
    onAddRagEntry(localAthlete.id, domain, entry);
    onUpdateRag(localAthlete.id, domain, status);
  };

  // Deep link from Overview → Calendar (gym session click) → Physical
  // Development → Programme sub-tab → Week view focused on dateISO.
  const handleNavigateToProgrammeWeek = (dateISO) => {
    const focusDate = dateISO ? new Date(dateISO + 'T00:00:00') : new Date();
    setActiveTab('physical-dev');
    setPhysicalDevSubTab('programme');
    setProgrammeFocus({ viewMode: 'week', viewDate: focusDate, nonce: Date.now() });
  };

  const p2 = localAthlete.phase2 || {};

  const handleDeleteRagEntry = (domain, entryId) => {
    setLocalAthlete(a => ({
      ...a,
      ragLog: {
        ...a.ragLog,
        [domain]: (a.ragLog?.[domain] || []).filter(e => e.id !== entryId),
      },
    }));
    onDeleteRagEntry(localAthlete.id, domain, entryId);
  };

  const handleDeletePhysioEntry = (entryId) => {
    setLocalAthlete(a => ({
      ...a,
      phase2: {
        ...a.phase2,
        physio: { entries: (a.phase2?.physio?.entries || []).filter(e => e.id !== entryId) },
      },
    }));
    onDeletePhysioEntry(localAthlete.id, entryId);
  };

  const renderTab = () => {
    // ── Pillar tabs ───────────────────────────────────────────────────────
    if (activeTab.startsWith('rag-')) {
      const domain = activeTab.slice(4); // strip 'rag-'

      // Nutrition is its own wrapper (sub-tabs at the very top) for the
      // meal-logging surfaces — RAG status/notes/working-on now live in
      // Goals & Development instead of an Overview sub-tab here.
      if (domain === 'nutrition') {
        return <NutritionDomainTab athleteId={athlete.id} athleteName={athlete.name} />;
      }

      // Psychological is now just the ACSI-28 assessment log — RAG
      // status/notes/working-on moved to Goals & Development.
      if (domain === 'psych') {
        return (
          <PsychTab
            acsi28={p2.psych?.acsi28 || []}
            onAddAcsi28={entry => onAddAcsi28Entry(localAthlete.id, entry)}
          />
        );
      }

      return null;
    }

    switch (activeTab) {
      case 'goals':
        return (
          <GoalsTab
            athleteId={athlete.id}
            athleteName={athlete.name}
            rag={localAthlete.rag || {}}
            ragLog={localAthlete.ragLog || {}}
            onStatusChange={handleStatusChange}
            onAddRagEntry={handleAddRagEntry}
            onDeleteRagEntry={handleDeleteRagEntry}
            highlightEntry={highlightEntry}
            onClearHighlight={() => setHighlightEntry(null)}
          />
        );
      case 'overview':
        return (
          <OverviewTab
            role={role}
            onUpdate={onUpdate}
            onUpdatePhoto={onUpdatePhoto}
            localAthlete={localAthlete}
            setLocalAthlete={setLocalAthlete}
            onNavigateToProgrammeWeek={handleNavigateToProgrammeWeek}
          />
        );
      case 'maturation':
        return (
          <MaturationTab
            athlete={localAthlete}
            entries={p2.maturation?.entries || []}
            allAthletes={allAthletes}
          />
        );
      case 'mobility':
        return (
          <MobilityTab
            entries={p2.mobility?.entries || {}}
            onAddEntry={(joint, entry) => onAddMobilityEntry(localAthlete.id, joint, entry)}
          />
        );
      case 'physical-dev':
        return (
          <PhysicalDevelopmentTab
            subTab={physicalDevSubTab}
            onChangeSubTab={setPhysicalDevSubTab}
            programmeFocus={programmeFocus}
            athlete={localAthlete}
            phase2={p2}
            allAthletes={allAthletes}
            role={role}
            // Testing (Performance Testing)
            onAddPerformanceEntry={(metric, entry) => onAddPerformanceEntry(localAthlete.id, metric, entry)}
            onSavePerformanceBrag={(metricKey, color) => onSavePerformanceBrag(localAthlete.id, metricKey, color)}
            onSaveReportMetrics={(keys) => onSaveReportMetrics(localAthlete.id, keys)}
          />
        );
      case 'physio':
        return (
          <PhysioTab
            entries={p2.physio?.entries || []}
            onAddEntry={entry => onAddPhysioEntry(localAthlete.id, entry)}
            onUpdateEntry={(entryId, updates) => onUpdatePhysioEntry(localAthlete.id, entryId, updates)}
            onDeleteEntry={handleDeletePhysioEntry}
          />
        );
      case 'wellness':
        return <WellnessTab athlete={localAthlete} role={role} />;
      case 'report':
        return (
          <ReportTab
            athlete={localAthlete}
            phase2={p2}
            onSaveBrag={(metricKey, color) => onSavePerformanceBrag(localAthlete.id, metricKey, color)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sticky top nav */}
      <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-100 no-print">
        <div className="px-8 py-3 flex items-center gap-4">
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} />
            Back to Roster
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-sm text-gray-400">{localAthlete.name}</span>
        </div>
        <TabBar active={activeTab} onChange={id => { setActiveTab(id); setHighlightEntry(null); }} />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <Suspense fallback={<TabLoader />}>
            {renderTab()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
