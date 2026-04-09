import { useState } from 'react';
import Sidebar from './components/Sidebar';
import AthleteRoster from './components/AthleteRoster';
import AthleteProfile from './components/AthleteProfile';
import DataEntryView from './components/dataentry/DataEntryView';
import SessionTracker from './components/SessionTracker';
import { useAthletes } from './hooks/useAthletes';

export default function App() {
  const [view, setView]               = useState('roster');
  const [selectedId, setSelectedId]   = useState(null);
  const [profileNav, setProfileNav]   = useState(null);
  const {
    athletes, loading, getAthlete,
    addAthlete, updateAthlete, updateRag, addRagEntry,
    saveQuarterlyReview, updatePhoto,
    addMaturationEntry, addMobilityEntry, addPerformanceEntry,
    addPhysioEntry, addNutritionEntry, addAcsi28Entry, addPsychNote,
    savePsychWorkingOn, saveNutritionWorkingOn,
    savePhysicalWorkingOn, saveLifestyleWorkingOn, savePerformanceBrag,
    updateLatestEntry,
    syncSessionData,
    addCheckIn,
  } = useAthletes();

  const handleNavigate = (v) => {
    setView(v);
    if (v === 'roster') { setSelectedId(null); }
  };

  const PILLAR_TAB_MAP = {
    psych:     'rag-psych',
    nutrition: 'rag-nutrition',
    physio:    'physio',
  };

  const handleNavigateToNote = (session) => {
    const tab = PILLAR_TAB_MAP[session.domain] || 'overview';
    const highlight = session.domain !== 'physio'
      ? { domain: session.domain, entryId: session.id }
      : null;
    const navId = Date.now().toString();
    setSelectedId(session.athleteId);
    setProfileNav({ tab, highlight, navId });
    setView('profile');
  };

  const handleSelectAthlete = id => { setSelectedId(id); setView('profile'); };
  const handleBack = () => { setView('roster'); setSelectedId(null); };
  const selectedAthlete = selectedId ? getAthlete(selectedId) : null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#111827' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#A58D69', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: '#A58D69' }}>Loading ProPath…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f4f5f7' }}>
      <Sidebar
        view={view}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {view === 'roster' && (
          <AthleteRoster
            athletes={athletes}
            onSelectAthlete={handleSelectAthlete}
            onAddAthlete={addAthlete}
          />
        )}

        {view === 'profile' && selectedAthlete && (
          <AthleteProfile
            key={selectedId + '-' + (profileNav?.navId || '0')}
            athlete={selectedAthlete}
            initialTab={profileNav?.tab}
            initialHighlight={profileNav?.highlight}
            allAthletes={athletes}
            onBack={handleBack}
            onUpdate={updateAthlete}
            onUpdateRag={updateRag}
            onAddRagEntry={addRagEntry}
            onSaveQuarterlyReview={saveQuarterlyReview}
            onUpdatePhoto={updatePhoto}
            onAddMaturationEntry={addMaturationEntry}
            onAddMobilityEntry={addMobilityEntry}
            onAddPerformanceEntry={addPerformanceEntry}
            onAddPhysioEntry={addPhysioEntry}
            onAddNutritionEntry={addNutritionEntry}
            onAddAcsi28Entry={addAcsi28Entry}
            onAddPsychNote={addPsychNote}
            onSavePsychWorkingOn={savePsychWorkingOn}
            onSaveNutritionWorkingOn={saveNutritionWorkingOn}
            onSavePhysicalWorkingOn={savePhysicalWorkingOn}
            onSaveLifestyleWorkingOn={saveLifestyleWorkingOn}
            onSavePerformanceBrag={savePerformanceBrag}
            onAddCheckIn={addCheckIn}
          />
        )}

        {view === 'dataentry' && (
          <DataEntryView
            athletes={athletes}
            syncSessionData={syncSessionData}
            updateLatestEntry={updateLatestEntry}
            onUpdateAthlete={updateAthlete}
          />
        )}

        {view === 'sessions' && (
          <SessionTracker
            athletes={athletes}
            onNavigateToNote={handleNavigateToNote}
          />
        )}
      </main>
    </div>
  );
}
