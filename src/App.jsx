import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/mobile/MobileBottomNav';
import RecentUpdatesView from './components/recent/RecentUpdatesView';
import WellnessAdherencePanel from './components/recent/WellnessAdherencePanel';
import AthleteRoster from './components/AthleteRoster';
import AthleteProfile from './components/AthleteProfile';
import DataEntryView from './components/dataentry/DataEntryView';
import SessionTracker from './components/SessionTracker';
import UserManagementView from './components/UserManagementView';
import LoginScreen from './components/LoginScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import InstallPrompt from './components/InstallPrompt';
// Lazy so a coach's page load never pays for the athlete-app bundle —
// this only mounts for the rare case of a role='athlete' session
// somehow landing on the coach app's own root (e.g. old install icon,
// manual navigation). Their normal path is the /athlete route.
const AthleteStableEntry = lazy(() => import('./components/athlete-app/AthleteStableEntry.jsx'));
import { useAthletes } from './hooks/useAthletes';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { useWellnessRoster } from './hooks/useWellnessRoster';
import WellnessOverview from './components/WellnessOverview';
import ProgrammeMasterView from './components/programming/ProgrammeMasterView';
import ProgrammeModule    from './components/programming/ProgrammeModule';
import ResourcesAdminView from './components/resources/ResourcesAdminView';
import MessagesView from './components/messages/MessagesView';
import SafeguardingView from './components/messages/SafeguardingView';
import TimetableView from './components/timetable/TimetableView';
import { useStaffUnread } from './hooks/useStaffUnread';
import { setAppBadgeCount } from './utils/appBadge';

// ── Navigation persistence ──────────────────────────────────────────────────
// Remembers the coach's last top-level view, selected athlete, and (if
// viewing a profile) which profile tab was open, so a page reload lands
// back where they left off instead of always resetting to the Updates
// feed. Per-browser (localStorage), not per-account — fine for a tool
// used from the same handful of devices.
const NAV_STORAGE_KEY = 'propath:last_nav';

function loadLastNav() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(NAV_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveLastNav(nav) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(nav));
  } catch { /* quota / private mode — silently ignore */ }
}

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
function AuthenticatedApp({ role, allocations, userEmail, userName, signOut }) {
  const isExternal = role === 'external';
  const isAdmin    = role === 'admin';

  // Default landing view — Updates for coaches (they open the app to
  // check what happened overnight), Roster for external providers who
  // don't see Updates. Redirected below if the chosen view isn't
  // permitted for the current role. A reload restores whatever was last
  // open instead (see NAV_STORAGE_KEY) — the role-restriction effect
  // further down still catches a restored view the current role can't see.
  // A push notification for an athlete reply opens "/?messages=<athleteId>".
  // A group/private chat notification opens "/?chat=<roomId>".
  const [messagesAthleteId] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('messages') || null; } catch { return null; }
  });
  const [messagesRoomId] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('chat') || null; } catch { return null; }
  });
  const [view, setView] = useState(() => {
    if (role === 'external') return 'roster';
    if (messagesAthleteId || messagesRoomId) return 'messages';
    return loadLastNav()?.view || 'updates';
  });
  useEffect(() => {
    if (messagesAthleteId || messagesRoomId) window.history.replaceState({}, '', window.location.pathname);
  }, [messagesAthleteId, messagesRoomId]);
  const [selectedId, setSelectedId] = useState(() => loadLastNav()?.selectedId || null);
  const [profileNav, setProfileNav] = useState(() => {
    const saved = loadLastNav();
    return saved?.view === 'profile' && saved?.selectedId && saved?.athleteTab
      ? { tab: saved.athleteTab, navId: 'restore' }
      : null;
  });
  // Mirrors AthleteProfile's own activeTab (see onActiveTabChange below)
  // purely so it can be written back to storage alongside view/selectedId.
  const [lastAthleteTab, setLastAthleteTab] = useState(() => loadLastNav()?.athleteTab || null);

  useEffect(() => {
    saveLastNav({ view, selectedId, athleteTab: lastAthleteTab });
  }, [view, selectedId, lastAthleteTab]);

  const {
    athletes, archivedAthletes, loading, error: athletesError, getAthlete,
    addAthlete, updateAthlete, archiveAthlete, restoreAthlete, deleteAthlete, updateRag, addRagEntry,
    updatePhoto,
    addMaturationEntry, addMobilityEntry, addPerformanceEntry,
    addPhysioEntry, addGeneralNote, addNutritionEntry, addAcsi28Entry, addPsychNote,
    addInjuryEntry, updateInjuryEntry, deleteInjuryEntry,
    savePerformanceBrag, saveReportMetrics,
    updateLatestEntry, updateEntryById,
    deleteRagEntry, updatePhysioEntry, deletePhysioEntry,
    syncSessionData,
  } = useAthletes({ seedEnabled: !isExternal });

  // Catch-up sync for saved data-entry sessions (admin/co_admin only).
  // PhysicalMobilitySheet already syncs a session the moment it's saved,
  // so this is only a safety net for anything that missed it. It used to
  // replay EVERY historical session on EVERY page load — N sessions x M
  // athletes of full-row athlete upserts plus performance_test_results
  // churn each time — so each session id is now remembered per-browser
  // once synced and skipped from then on.
  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (loading || initialSyncDone.current || isExternal) return;
    initialSyncDone.current = true;
    supabase.from('sessions').select('data').then(({ data }) => {
      if (!data) return;
      let synced;
      try { synced = new Set(JSON.parse(window.localStorage.getItem('propath:synced_session_ids') || '[]')); }
      catch { synced = new Set(); }
      const pending = data.map(row => row.data).filter(s => s?.savedAt && s.id && !synced.has(s.id));
      if (!pending.length) return;
      pending.forEach(s => {
        syncSessionData({ ...s, customMetrics: s.customMetrics || {} });
        synced.add(s.id);
      });
      try { window.localStorage.setItem('propath:synced_session_ids', JSON.stringify([...synced])); }
      catch { /* quota / private mode — worst case it re-syncs next load */ }
    });
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect non-admin/external users away from restricted views.
  useEffect(() => {
    if (isExternal && (view === 'dataentry' || view === 'sessions' || view === 'users' || view === 'resources' || view === 'messages' || view === 'safeguarding' || view === 'timetable')) {
      setView('roster');
    }
    if (!isAdmin && (view === 'users' || view === 'safeguarding')) {
      setView('roster');
    }
  }, [isExternal, isAdmin, view]);

  // A restored profile view (see NAV_STORAGE_KEY) can point at an athlete
  // who's since been archived/deleted, or — for an external provider —
  // one they're no longer allocated to. Rather than render a blank
  // content area, fall back to the roster once athletes have loaded.
  useEffect(() => {
    if (loading || view !== 'profile' || !selectedId) return;
    const stillAccessible = getAthlete(selectedId)
      && (!isExternal || allocations.includes(selectedId));
    if (!stillAccessible) {
      setView(isExternal ? 'roster' : 'updates');
      setSelectedId(null);
    }
  }, [loading, view, selectedId, isExternal, allocations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wellness status for roster cards (must be above early returns — hooks cannot be conditional)
  const visibleAthletes = loading ? [] : (isExternal
    ? athletes.filter(a => allocations.includes(a.id))
    : athletes);
  const { wellnessMap } = useWellnessRoster(visibleAthletes.map(a => a.id));
  // Unread athlete replies — badge on the Messages nav item.
  const { count: messagesUnread, refresh: refreshMessagesUnread } = useStaffUnread(!isExternal);
  useEffect(() => { setAppBadgeCount(messagesUnread); }, [messagesUnread]);

  if (loading) return <LoadingSpinner message="Loading ProPath…" />;

  // External providers cannot delete notes.
  const canDelete = !isExternal;
  // Athlete-level delete is destructive (FK CASCADE wipes every linked
  // training_block, planned_session, set_log, check-in, mental-skills
  // session etc.) so we keep it tighter than canDelete — only the
  // primary admin sees the trash icon on roster cards. Other admins
  // / co-admins can still edit, just not nuke.
  const isMainAdmin = isAdmin
    && userEmail === (import.meta.env.VITE_MAIN_ADMIN_EMAIL || 'jonahsmithhintsa@gmail.com');

  const handleNavigate = (v) => {
    if (isExternal && (v === 'dataentry' || v === 'sessions' || v === 'users' || v === 'programme' || v === 'shared-calendar' || v === 'resources' || v === 'messages' || v === 'safeguarding' || v === 'timetable')) return;
    if (!isAdmin && (v === 'users' || v === 'safeguarding')) return;
    setView(v);
    if (v === 'roster') setSelectedId(null);
  };

  const handleSelectAthlete = (id, opts) => {
    if (isExternal && !allocations.includes(id)) return;
    setSelectedId(id);
    if (opts?.tab) {
      setProfileNav({ tab: opts.tab, navId: Date.now().toString() });
    }
    setView('profile');
  };

  const handleBack = () => { setView('roster'); setSelectedId(null); };

  // RAG/notes for every domain now live in Goals & Development — only
  // physio (a separate assessment log, not part of the goals system)
  // still routes to its own tab.
  const PILLAR_TAB_MAP = {
    physical:  'goals',
    psych:     'goals',
    nutrition: 'goals',
    lifestyle: 'goals',
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
      {/* Sidebar: full-width on desktop (md+), hidden on mobile in
          favour of the bottom nav. Sidebar contains every module the
          coach uses on desktop; the mobile bottom nav exposes the 5
          most-used ones. */}
      <div className="hidden md:flex">
        <Sidebar
          view={view}
          onNavigate={handleNavigate}
          role={role}
          userEmail={userEmail}
          userName={userName}
          onSignOut={signOut}
          isAdmin={isAdmin}
          messagesUnread={messagesUnread}
        />
      </div>

      {/* Main content — pads the bottom on mobile so the bottom nav
          doesn't cover the last row of scrollable content. */}
      <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">

        {athletesError && (
          <div
            className="px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0"
            style={{ backgroundColor: '#fef2f2', color: '#991b1b', borderBottom: '1px solid #fecaca' }}
          >
            Couldn't load athletes — {athletesError.message || 'unknown error'}. Try refreshing the page.
          </div>
        )}

        {view === 'updates' && !isExternal && (
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-white">
              <RecentUpdatesView
                athletes={visibleAthletes}
                onNavigateToAthlete={handleSelectAthlete}
                onAddRagEntry={addRagEntry}
                onAddPhysioEntry={addPhysioEntry}
                onAddGeneralNote={addGeneralNote}
                senderName={userName || userEmail}
              />
            </div>
            <div className="hidden xl:flex flex-1 min-w-0">
              <WellnessAdherencePanel
                athletes={visibleAthletes}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        )}

        {view === 'roster' && (
          <AthleteRoster
            athletes={visibleAthletes}
            archivedAthletes={isExternal ? [] : archivedAthletes}
            onSelectAthlete={handleSelectAthlete}
            onAddAthlete={canDelete ? addAthlete : undefined}
            onArchiveAthlete={canDelete ? archiveAthlete : undefined}
            onRestoreAthlete={canDelete ? restoreAthlete : undefined}
            onDeleteAthlete={isMainAdmin ? deleteAthlete : undefined}
            wellnessMap={wellnessMap}
          />
        )}

        {view === 'profile' && accessibleAthlete && (
          <AthleteProfile
            key={selectedId + '-' + (profileNav?.navId || '0')}
            athlete={accessibleAthlete}
            initialTab={profileNav?.tab}
            initialHighlight={profileNav?.highlight}
            allAthletes={visibleAthletes}
            role={role}
            onBack={handleBack}
            onActiveTabChange={setLastAthleteTab}
            onUpdate={updateAthlete}
            onUpdateRag={updateRag}
            onAddRagEntry={addRagEntry}
            onUpdatePhoto={updatePhoto}
            onAddMaturationEntry={addMaturationEntry}
            onAddMobilityEntry={addMobilityEntry}
            onAddPerformanceEntry={addPerformanceEntry}
            onAddPhysioEntry={addPhysioEntry}
            onAddNutritionEntry={addNutritionEntry}
            onAddAcsi28Entry={addAcsi28Entry}
            onAddPsychNote={addPsychNote}
            onSavePerformanceBrag={savePerformanceBrag}
            onSaveReportMetrics={saveReportMetrics}
            onDeleteRagEntry={canDelete ? deleteRagEntry : undefined}
            onUpdatePhysioEntry={updatePhysioEntry}
            onDeletePhysioEntry={canDelete ? deletePhysioEntry : undefined}
            onAddInjuryEntry={addInjuryEntry}
            onUpdateInjuryEntry={updateInjuryEntry}
            onDeleteInjuryEntry={canDelete ? deleteInjuryEntry : undefined}
          />
        )}

        {view === 'dataentry' && !isExternal && (
          <DataEntryView
            athletes={athletes}
            syncSessionData={syncSessionData}
            updateLatestEntry={updateLatestEntry}
            updateEntryById={updateEntryById}
            onUpdateAthlete={updateAthlete}
          />
        )}

        {view === 'sessions' && !isExternal && (
          <SessionTracker
            athletes={athletes}
            onNavigateToNote={handleNavigateToNote}
          />
        )}

        {view === 'wellness' && !isExternal && (
          <WellnessOverview athletes={visibleAthletes} role={role} />
        )}

        {view === 'programme' && !isExternal && (
          <ProgrammeModule />
        )}

        {view === 'shared-calendar' && !isExternal && (
          <ProgrammeMasterView allAthletes={visibleAthletes} role={role} onSelectAthlete={handleSelectAthlete} />
        )}

        {view === 'resources' && !isExternal && (
          <ResourcesAdminView />
        )}

        {view === 'users' && isAdmin && (
          <UserManagementView athletes={athletes} />
        )}

        {view === 'timetable' && !isExternal && (
          <TimetableView athletes={visibleAthletes} />
        )}

        {view === 'messages' && !isExternal && (
          <MessagesView
            athletes={visibleAthletes}
            senderName={userName || userEmail}
            initialAthleteId={messagesAthleteId}
            initialRoomId={messagesRoomId}
            onUnreadChange={refreshMessagesUnread}
          />
        )}

        {view === 'safeguarding' && isAdmin && (
          <SafeguardingView athletes={[...athletes, ...archivedAthletes]} />
        )}

      </main>

      {/* Mobile-only bottom nav — 5 icons: Updates / Athletes / Data /
          Programme / Wellness. Hidden on md+ where the sidebar shows
          the full navigation. */}
      {!isExternal && (
        <MobileBottomNav view={view} onNavigate={handleNavigate} messagesUnread={messagesUnread} />
      )}
    </div>
  );
}

// ── Dev-mode banner — visible on every screen, only on localhost ─────────────
function DevBanner() {
  if (!import.meta.env.DEV) return null;
  console.log('DEV mode:', import.meta.env.DEV);
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#F59E0B',
        color: '#fff',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 700,
        padding: '4px 0',
        letterSpacing: '0.05em',
      }}
    >
      DEVELOPMENT MODE
    </div>
  );
}

// ── Root — handles auth gate before rendering the app ─────────────────────────
export default function App() {
  const {
    session, user, role, userName, allocations, loading,
    needsPasswordSet, clearNeedsPasswordSet,
    signIn, signOut, sendPasswordReset,
  } = useAuth();

  if (loading) return <><DevBanner /><LoadingSpinner /></>;

  // Intercept password-reset and invite links before entering the main app.
  if (needsPasswordSet) {
    return <><DevBanner /><ResetPasswordScreen onDone={clearNeedsPasswordSet} /></>;
  }

  if (!session) {
    return <><DevBanner /><LoginScreen onSignIn={signIn} onResetPassword={sendPasswordReset} /></>;
  }

  // A real athlete-role session (see athlete-real-auth-2026-09-01.sql)
  // landed on the coach app's own root — route them to their app
  // instead of the coach shell. Their normal path is the /athlete
  // route; this is a fallback for e.g. an old install icon.
  if (role === 'athlete') {
    return <Suspense fallback={<LoadingSpinner />}><AthleteStableEntry /></Suspense>;
  }

  return (
    <>
      <DevBanner />
      <AuthenticatedApp
        role={role}
        allocations={allocations}
        userEmail={user?.email}
        userName={userName}
        signOut={signOut}
      />
      <InstallPrompt />
    </>
  );
}
