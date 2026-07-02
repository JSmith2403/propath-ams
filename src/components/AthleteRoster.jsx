import { useState } from 'react';
import { Archive, ArchiveRestore, Plus, Search, Trash2, X } from 'lucide-react';
import AthleteCard from './AthleteCard';
import AddAthleteModal from './AddAthleteModal';
import MobileAthleteRow from './mobile/MobileAthleteRow';
import { COHORTS } from '../data/athletes';

const FILTER_OPTIONS = ['All', ...COHORTS];

const COHORT_ORDER = { Elite: 0, Gold: 1, Mini: 2 };

function lastName(name) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
}

function sortAthletes(list) {
  return [...list].sort((a, b) => {
    const cohortDiff = (COHORT_ORDER[a.cohort] ?? 99) - (COHORT_ORDER[b.cohort] ?? 99);
    if (cohortDiff !== 0) return cohortDiff;
    return lastName(a.name).localeCompare(lastName(b.name));
  });
}

export default function AthleteRoster({
  athletes,
  archivedAthletes = [],
  onSelectAthlete,
  onAddAthlete,
  onArchiveAthlete,
  onRestoreAthlete,
  onDeleteAthlete,
  wellnessMap = {},
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // confirmArchive — athlete tile clicked the archive icon
  const [confirmArchive, setConfirmArchive] = useState(null);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [archiveError, setArchiveError] = useState(null);

  // showArchived — slide-over panel listing archived athletes
  const [showArchived, setShowArchived] = useState(false);

  // confirmDelete — only reachable from inside the archived panel,
  // gated to onDeleteAthlete being passed (main admin only).
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const runArchive = async () => {
    if (!confirmArchive || !onArchiveAthlete) return;
    setArchiveBusy(true);
    setArchiveError(null);
    try { await onArchiveAthlete(confirmArchive.id); }
    catch (e) {
      setArchiveBusy(false);
      setArchiveError(e?.message || 'Could not archive.');
      return;
    }
    setArchiveBusy(false);
    setConfirmArchive(null);
  };

  const runDelete = async () => {
    if (!confirmDelete || !onDeleteAthlete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    const res = await onDeleteAthlete(confirmDelete.id);
    setDeleteBusy(false);
    if (res?.ok === false) {
      setDeleteError(res?.error?.message || 'Could not delete athlete.');
      return;
    }
    setConfirmDelete(null);
  };

  const filtered = sortAthletes(
    athletes.filter((a) => {
      const matchesTier = activeFilter === 'All' || a.cohort === activeFilter;
      const matchesSearch =
        !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sport.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    })
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Page header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Athlete Roster</h1>
            <p className="text-sm text-gray-500 mt-1">{athletes.length} athletes enrolled</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Archived link — only appears once there ARE archived
                athletes, so a fresh roster isn't cluttered with empty
                affordances. */}
            {onArchiveAthlete && archivedAthletes.length > 0 && (
              <button
                onClick={() => setShowArchived(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border"
                style={{ color: '#6b7280', borderColor: '#e5e7eb', backgroundColor: '#fff' }}
                title="View archived athletes"
              >
                <Archive size={13} />
                Archived ({archivedAthletes.length})
              </button>
            )}
            {onAddAthlete && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#A58D69' }}
              >
                <Plus size={16} />
                Add Athlete
              </button>
            )}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': '#A58D69' }}
            />
          </div>

          {/* Tier filters */}
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveFilter(tier)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeFilter === tier
                    ? 'text-white'
                    : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300'
                }`}
                style={activeFilter === tier ? { backgroundColor: '#A58D69' } : {}}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-8 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No athletes found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal rows (contact-list style). Denser,
                thumb-scannable, taps into the profile. Hidden on md+. */}
            <div className="md:hidden -mx-8 border-t border-ink-100 bg-white">
              {filtered.map((athlete) => (
                <MobileAthleteRow
                  key={athlete.id}
                  athlete={athlete}
                  onClick={onSelectAthlete}
                  onRequestArchive={onArchiveAthlete ? (a) => { setArchiveError(null); setConfirmArchive(a); } : null}
                />
              ))}
            </div>

            {/* Desktop / tablet: existing card grid. Hidden below md. */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((athlete) => (
                <AthleteCard
                  key={athlete.id}
                  athlete={athlete}
                  onClick={onSelectAthlete}
                  wellnessData={wellnessMap[athlete.id]}
                  onRequestArchive={onArchiveAthlete ? (a) => { setArchiveError(null); setConfirmArchive(a); } : null}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <AddAthleteModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddAthlete}
        />
      )}

      {/* Confirm-archive modal — non-destructive. Quick confirm copy:
          reassures coach they can bring the athlete back any time. */}
      {confirmArchive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => !archiveBusy && setConfirmArchive(null)}
        >
          <div
            className="rounded-xl bg-white w-full max-w-md p-6"
            style={{ border: '1px solid #e5e7eb', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, backgroundColor: 'rgba(165,141,105,0.14)' }}
              >
                <Archive size={18} style={{ color: '#A58D69' }} />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold" style={{ color: '#1C1C1C' }}>
                  Archive {confirmArchive.name}?
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#6b7280' }}>
                  Hides <span className="font-semibold">{confirmArchive.name}</span> from the
                  roster but keeps every training block, logged set, check-in, wellness entry
                  and mental skills session intact. Open <span className="font-semibold">Archived</span> at the
                  top of the roster to bring them back any time.
                </p>
              </div>
            </div>
            {archiveError && (
              <div
                className="mb-3 px-3 py-2 rounded text-[11px] font-semibold"
                style={{ color: '#991b1b', backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}
              >
                {archiveError}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmArchive(null)}
                disabled={archiveBusy}
                className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
              >
                Cancel
              </button>
              <button
                onClick={runArchive}
                disabled={archiveBusy}
                className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#fff', backgroundColor: '#A58D69' }}
              >
                {archiveBusy ? 'Archiving…' : `Archive ${confirmArchive.name}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archived athletes panel — slide-over from the right. Lists every
          archived athlete with name + photo. Restore brings them back to
          the roster instantly. Delete is the irreversible option, only
          shown when onDeleteAthlete is wired (primary admin gate). */}
      {showArchived && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowArchived(false)}
        >
          <div
            className="bg-white h-full w-full max-w-md flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Archive size={16} style={{ color: '#A58D69' }} />
                <h3 className="text-base font-bold" style={{ color: '#1C1C1C' }}>
                  Archived athletes
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ color: '#6b7280', backgroundColor: '#f3f4f6' }}>
                  {archivedAthletes.length}
                </span>
              </div>
              <button onClick={() => setShowArchived(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={16} style={{ color: '#6b7280' }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {archivedAthletes.length === 0 ? (
                <div className="text-center py-12 text-xs italic" style={{ color: '#9ca3af' }}>
                  No archived athletes.
                </div>
              ) : (
                archivedAthletes.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{ borderColor: '#e5e7eb', backgroundColor: '#fafafa' }}
                  >
                    {a.photo ? (
                      <img
                        src={a.photo}
                        alt={a.name}
                        className="shrink-0 rounded-md object-cover"
                        style={{ width: 44, height: 44, objectPosition: 'top center' }}
                      />
                    ) : (
                      <div
                        className="shrink-0 rounded-md flex items-center justify-center text-xs font-bold"
                        style={{ width: 44, height: 44, backgroundColor: '#085777', color: '#fff' }}
                      >
                        {a.name?.split(' ').map(p => p[0]).slice(0,2).join('') || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: '#1C1C1C' }}>{a.name}</div>
                      <div className="text-[11px]" style={{ color: '#9ca3af' }}>
                        {a.cohort || 'Elite'}{a.archived_at ? ` · archived ${new Date(a.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => onRestoreAthlete && onRestoreAthlete(a.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded transition-colors"
                      style={{ color: '#15803d', backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)' }}
                      title="Restore to roster"
                    >
                      <ArchiveRestore size={11} /> Restore
                    </button>
                    {onDeleteAthlete && (
                      <button
                        onClick={() => { setDeleteError(null); setConfirmDelete(a); }}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold rounded transition-colors"
                        style={{ color: '#b91c1c', backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}
                        title="Permanently delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 text-[10px] italic" style={{ color: '#9ca3af' }}>
              Archiving an athlete keeps all their data. Restore returns them to the roster with full history intact.
            </div>
          </div>
        </div>
      )}

      {/* Confirm-delete modal — reachable only from the archived panel */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => !deleteBusy && setConfirmDelete(null)}
        >
          <div
            className="rounded-xl bg-white w-full max-w-md p-6"
            style={{ border: '1px solid #e5e7eb', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, backgroundColor: 'rgba(220,38,38,0.12)' }}
              >
                <Trash2 size={18} style={{ color: '#dc2626' }} />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold" style={{ color: '#1C1C1C' }}>
                  Permanently delete {confirmDelete.name}?
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#6b7280' }}>
                  Wipes <span className="font-semibold">{confirmDelete.name}</span> and every linked
                  training block, planned session, logged set, check-in, wellness entry, and mental
                  skills session. <span className="font-semibold text-red-600">This can't be undone.</span>
                  {' '}If you might want them back, leave them archived instead.
                </p>
              </div>
            </div>
            {deleteError && (
              <div
                className="mb-3 px-3 py-2 rounded text-[11px] font-semibold"
                style={{ color: '#991b1b', backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}
              >
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleteBusy}
                className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
              >
                Keep archived
              </button>
              <button
                onClick={runDelete}
                disabled={deleteBusy}
                className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#fff', backgroundColor: '#dc2626' }}
              >
                {deleteBusy ? 'Deleting…' : `Permanently delete`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
