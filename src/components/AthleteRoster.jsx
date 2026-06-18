import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import AthleteCard from './AthleteCard';
import AddAthleteModal from './AddAthleteModal';
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

export default function AthleteRoster({ athletes, onSelectAthlete, onAddAthlete, onDeleteAthlete, wellnessMap = {} }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // athlete to delete
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#A58D69' }}
          >
            <Plus size={16} />
            Add Athlete
          </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                onClick={onSelectAthlete}
                wellnessData={wellnessMap[athlete.id]}
                onRequestDelete={onDeleteAthlete ? (a) => { setDeleteError(null); setConfirmDelete(a); } : null}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddAthleteModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddAthlete}
        />
      )}

      {/* Confirm-delete modal — destructive action gets a clear two-step
          flow with the athlete's name typed back at the coach so they
          can't blow away the wrong row on a stray click. */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
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
                  Delete {confirmDelete.name}?
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#6b7280' }}>
                  Permanently removes <span className="font-semibold">{confirmDelete.name}</span> and
                  everything linked to them: training blocks, planned sessions, logged sets, check-ins,
                  wellness history, mental skills progress. <span className="font-semibold text-red-600">This can't be undone.</span>
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
                Cancel
              </button>
              <button
                onClick={runDelete}
                disabled={deleteBusy}
                className="px-4 py-2 text-sm font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#fff', backgroundColor: '#dc2626' }}
              >
                {deleteBusy ? 'Deleting…' : `Delete ${confirmDelete.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
