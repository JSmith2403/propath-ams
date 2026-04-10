import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AthleteRoster from './components/AthleteRoster';
import AthleteProfile from './components/AthleteProfile';
import DataEntryView from './components/dataentry/DataEntryView';
import SessionTracker from './components/SessionTracker';
import UserManagementView from './components/UserManagementView';
import LoginScreen from './components/LoginScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import { useAthletes } from './hooks/useAthletes';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

// ── Loading spinner shared by both auth and data loading states ───────────────
function LoadingSpinner({ message }) {
  return (
    <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
        />
        {message && (
          <p className="text-sm font-medium" style={{ color: '#A58D69' }}>{message}</p>
        )}
      </div>
    </div>
  );
}

// ── Main app — only mounted when a valid session exists ───────────────────────
function AuthenticatedApp({ role, allocations, userEmail, signOut }) {
  const isExternal = role === 'external';
  const isAdmin    = role === 'admin';

  const [view,       setView]       = useState('roster');
  const [selectedId, setSelectedId] = useState(null);
  const [profileNav, setProfileNav] = useState(null);

  const {
    athletes, loading, getAthlete,
    addAthlete, updateAthlete, updateRag, addRagEntry,
    saveQuarterlyReview, updatePhoto,
    addMaturationEntry, addMobilityEntry, addPerformanceEntry,
    addPhysioEntry, addNutritionEntry, addAcsi28Entry, addPsychNote,
    savePsychWorkingOn, saveNutritionWorkingOn,
    savePhysicalWorkingOn, saveLifestyleWorkingOn, savePerformanceBrag,
    updateLatestEntry,
    deleteRagEntry, deletePhysioEntry,
    syncSessionData,
    addCheckIn,
  } = useAthletes({ seedEnabled: !isExternal });

  // Re-sync all saved sessions once after athletes load (admin/co_admin only).
  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (loading || initialSyncDone.current || isExternal) return;
    initialSyncDone.current = true;
    supabase.from('sessions').select('data').then(({ data }) => {
      if (!data) return;
      data.map(row => row.data)
        .filter(s => s?.savedAt)
        .forEach(s => syncSessionData({ ...s, customMetrics: s.customMetrics || {} }));
    });
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect non-admin/external users away from restricted views.
  useEffect(() => {
    if (isExternal && (view === 'dataentry' || view === 'sessions' || view === 'users')) {
      setView('roster');
    }
    if (!isAdmin && view === 'users') {
      setView('roster');
    }
  }, [isExternal, isAdmin, view]);

  if (loading) return <LoadingSpinner message="Loading ProPath…" />;

  // External providers only see their allocated athletes.
  const visibleAthletes = isExternal
    ? athletes.filter(a => allocations.includes(a.id))
    : athletes;

  // External providers cannot delete notes.
  const canDelete = !isExternal;

  const handleNavigate = (v) => {
    if (isExternal && (v === 'dataentry' || v === 'sessions' || v === 'users')) return;
    if (!isAdmin && v === 'users') return;
    setView(v);
    if (v === 'roster') setSelectedId(null);
  };

  const handleSelectAthlete = (id) => {
    if (isExternal && !allocations.includes(id)) return;
    setSelectedId(id);
    setView('profile');
  };

  const handleBack = () => { setView('roster'); setSelectedId(null); };

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

  const selectedAthlete = selectedId ? getAthlete(selectedId) : null;

  // Guard: if an external user somehow has an unallocated athlete selected,
  // treat it as no selection (component won't render).
  const accessibleAthlete =
    selectedAthlete && isExternal && !allocations.includes(selectedAthlete.id)
      ? null
      : selectedAthlete;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f4f5f7' }}>
      <Sidebar
        view={view}
        onNavigate={handleNavigate}
        role={role}
        userEmail={userEmail}
        onSignOut={signOut}
        isAdmin={isAdmin}
      />

      <main className="flex-1 flex flex-col overflow-hidden">

        {view === 'roster' && (
          <AthleteRoster
            athletes={visibleAthletes}
            onSelectAthlete={handleSelectAthlete}
            onAddAthlete={canDelete ? addAthlete : undefined}
          />
        )}

        {view === 'profile' && accessibleAthlete && (
          <AthleteProfile
            key={selectedId + '-' + (profileNav?.navId || '0')}
            athlete={accessibleAthlete}
            initialTab={profileNav?.tab}
            initialHighlight={profileNav?.highlight}
            allAthletes={visibleAthletes}
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
            onDeleteRagEntry={canDelete ? deleteRagEntry : undefined}
            onDeletePhysioEntry={canDelete ? deletePhysioEntry : undefined}
          />
        )}

        {view === 'dataentry' && !isExternal && (
          <DataEntryView
            athletes={athletes}
            syncSessionData={syncSessionData}
            updateLatestEntry={updateLatestEntry}
            onUpdateAthlete={updateAthlete}
          />
        )}

        {view === 'sessions' && !isExternal && (
          <SessionTracker
            athletes={athletes}
            onNavigateToNote={handleNavigateToNote}
          />
        )}

        {view === 'users' && isAdmin && (
          <UserManagementView athletes={athletes} />
        )}

      </main>
    </div>
  );
}

// ── Root — handles auth gate before rendering the app ─────────────────────────
export default function App() {
  const {
    session, user, role, allocations, loading,
    needsPasswordSet, clearNeedsPasswordSet,
    signIn, signOut, sendPasswordReset,
  } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Intercept password-reset and invite links before entering the main app.
  if (needsPasswordSet) {
    return <ResetPasswordScreen onDone={clearNeedsPasswordSet} />;
  }

  if (!session) {
    return <LoginScreen onSignIn={signIn} onResetPassword={sendPasswordReset} />;
  }

  return (
    <AuthenticatedApp
      role={role}
      allocations={allocations}
      userEmail={user?.email}
      signOut={signOut}
    />
  );
}
