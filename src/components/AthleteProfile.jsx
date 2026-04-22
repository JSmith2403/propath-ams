import { useState, useEffect, lazy, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import WorkingOnSection from './WorkingOnSection';
import { RAG_DOMAINS } from '../data/athletes';

// Lazy-load heavy tabs to keep initial bundle lean
const PillarTab             = lazy(() => import('./tabs/PillarTab'));
const MaturationTab         = lazy(() => import('./tabs/MaturationTab'));
const MobilityTab           = lazy(() => import('./tabs/MobilityTab'));
const PerformanceTestingTab = lazy(() => import('./tabs/PerformanceTestingTab'));
const PhysioTab             = lazy(() => import('./tabs/PhysioTab'));
const NutritionTab          = lazy(() => import('./tabs/NutritionTab'));
const PsychTab              = lazy(() => import('./tabs/PsychTab'));
const ReportTab             = lazy(() => import('./tabs/ReportTab'));
const WellnessTab           = lazy(() => import('./tabs/WellnessTab'));

const TABS = [
  { id: 'overview',       label: 'Overview'            },
  { id: 'rag-physical',   label: 'Physical'            },
  { id: 'rag-psych',      label: 'Psychological'       },
  { id: 'rag-nutrition',  label: 'Nutritional'         },
  { id: 'rag-lifestyle',  label: 'Lifestyle'           },
  { id: 'wellness',       label: 'Wellness'            },
  { id: 'maturation',     label: 'Maturation'          },
  { id: 'mobility',       label: 'Mobility'            },
  { id: 'performance',    label: 'Performance Testing' },
  { id: 'physio',         label: 'Physio Assessment'   },
  { id: 'report',         label: 'Report'              },
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
  return `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export default function AthleteProfile({
  athlete, onBack, allAthletes = [],
  initialTab, initialHighlight,
  onUpdate, onUpdateRag, onAddRagEntry, onSaveQuarterlyReview, onUpdatePhoto,
  // Phase 2
  onAddMaturationEntry, onAddMobilityEntry, onAddPerformanceEntry,
  onAddPhysioEntry, onAddNutritionEntry, onAddAcsi28Entry, onAddPsychNote,
  onSavePsychWorkingOn, onSaveNutritionWorkingOn,
  onSavePhysicalWorkingOn, onSaveLifestyleWorkingOn, onSavePerformanceBrag, onSaveReportMetrics,
  onAddCheckIn,
  onDeleteRagEntry, onUpdatePhysioEntry, onDeletePhysioEntry,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
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

  const handleSaveReview = review => {
    const list = localAthlete.quarterlyReviews || [];
    const idx = list.findIndex(r => r.id === review.id);
    const updated = idx >= 0
      ? list.map(r => r.id === review.id ? review : r)
      : [...list, review];
    setLocalAthlete(a => ({ ...a, quarterlyReviews: updated }));
    onSaveQuarterlyReview(localAthlete.id, review);
  };

  // Navigate from an overview entry to the pillar section + highlight
  const handleNavigateToPillar = (domain, entryId) => {
    setActiveTab(`rag-${domain}`);
    setHighlightEntry({ domain, entryId });
  };

  const p2 = localAthlete.phase2 || {};

  const handleSavePsychWorkingOn = (workingOn) => {
    setLocalAthlete(a => ({
      ...a,
      phase2: { ...a.phase2, psych: { ...a.phase2?.psych, workingOn } },
    }));
    onSavePsychWorkingOn(localAthlete.id, workingOn);
  };

  const handleSaveNutritionWorkingOn = (workingOn) => {
    setLocalAthlete(a => ({
      ...a,
      phase2: { ...a.phase2, nutrition: { ...a.phase2?.nutrition, workingOn } },
    }));
    onSaveNutritionWorkingOn(localAthlete.id, workingOn);
  };

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

  const handleAddCheckIn = (entry) => {
    const newEntry = { ...entry, id: uid() };
    setLocalAthlete(a => ({
      ...a,
      checkIns: [newEntry, ...(a.checkIns || [])],
    }));
    onAddCheckIn(localAthlete.id, newEntry);
  };

  const handleSavePhysicalWorkingOn = (workingOn) => {
    setLocalAthlete(a => ({
      ...a,
      phase2: { ...a.phase2, physical: { ...a.phase2?.physical, workingOn } },
    }));
    onSavePhysicalWorkingOn(localAthlete.id, workingOn);
  };

  const handleSaveLifestyleWorkingOn = (workingOn) => {
    setLocalAthlete(a => ({
      ...a,
      phase2: { ...a.phase2, lifestyle: { ...a.phase2?.lifestyle, workingOn } },
    }));
    onSaveLifestyleWorkingOn(localAthlete.id, workingOn);
  };

  const renderTab = () => {
    // ── Pillar tabs ───────────────────────────────────────────────────────
    if (activeTab.startsWith('rag-')) {
      const domain = activeTab.slice(4); // strip 'rag-'
      const domainMeta = RAG_DOMAINS.find(d => d.key === domain);

      let extraContent    = null;
      let preContent      = null;
      let pillarEntryTypes = undefined;

      if (domain === 'psych') {
        const psychWorkingOn = p2.psych?.workingOn || [
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' },
        ];
        // Working On cards sit above the note log
        preContent = (
          <PsychTab
            section="working-on"
            workingOn={psychWorkingOn}
            onSaveWorkingOn={handleSavePsychWorkingOn}
          />
        );
        // ACSI assessments sit at the bottom of the tab (below the note log)
        extraContent = (
          <PsychTab
            section="acsi"
            acsi28={p2.psych?.acsi28 || []}
            onAddAcsi28={entry => onAddAcsi28Entry(localAthlete.id, entry)}
          />
        );
      } else if (domain === 'nutrition') {
        preContent = (
          <NutritionTab
            workingOn={p2.nutrition?.workingOn || [
              { title: '', description: '' },
              { title: '', description: '' },
              { title: '', description: '' },
            ]}
            onSaveWorkingOn={handleSaveNutritionWorkingOn}
          />
        );
      } else if (domain === 'physical') {
        preContent = (
          <WorkingOnSection
            workingOn={p2.physical?.workingOn}
            onSave={handleSavePhysicalWorkingOn}
          />
        );
      } else if (domain === 'lifestyle') {
        preContent = (
          <WorkingOnSection
            workingOn={p2.lifestyle?.workingOn}
            onSave={handleSaveLifestyleWorkingOn}
          />
        );
      }

      return (
        <PillarTab
          label={domainMeta?.label ?? domain}
          domain={domain}
          status={localAthlete.rag?.[domain] || 'grey'}
          logEntries={localAthlete.ragLog?.[domain] || []}
          onStatusChange={status => handleStatusChange(domain, status)}
          onAddEntry={data => handleAddRagEntry(domain, data)}
          onDeleteEntry={entryId => handleDeleteRagEntry(domain, entryId)}
          highlightEntryId={highlightEntry?.domain === domain ? highlightEntry.entryId : null}
          onClearHighlight={() => setHighlightEntry(null)}
          preContent={preContent}
          extraContent={extraContent}
          entryTypes={pillarEntryTypes}
          noteFormFirst={domain === 'psych' || domain === 'nutrition' || domain === 'physical' || domain === 'lifestyle'}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            athlete={athlete}
            onUpdate={onUpdate}
            onUpdatePhoto={onUpdatePhoto}
            localAthlete={localAthlete}
            setLocalAthlete={setLocalAthlete}
            onAddRagEntry={handleAddRagEntry}
            onSaveReview={handleSaveReview}
            onNavigateToPillar={handleNavigateToPillar}
            onAddCheckIn={handleAddCheckIn}
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
      case 'performance':
        return (
          <PerformanceTestingTab
            athlete={localAthlete}
            entries={p2.performance?.entries || {}}
            maturationEntries={p2.maturation?.entries || []}
            bragRatings={p2.performanceBrag || {}}
            reportMetrics={p2.reportMetrics || []}
            onSaveBrag={(metricKey, color) => onSavePerformanceBrag(localAthlete.id, metricKey, color)}
            onSaveReportMetrics={(keys) => onSaveReportMetrics(localAthlete.id, keys)}
            onAddEntry={(metric, entry) => onAddPerformanceEntry(localAthlete.id, metric, entry)}
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
        return <WellnessTab athlete={localAthlete} />;
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
