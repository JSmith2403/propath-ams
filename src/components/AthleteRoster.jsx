import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import AthleteCard from './AthleteCard';
import AddAthleteModal from './AddAthleteModal';
import { COHORTS } from '../data/athletes';

const FILTER_OPTIONS = ['All', ...COHORTS];

export default function AthleteRoster({ athletes, onSelectAthlete, onAddAthlete }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = athletes.filter((a) => {
    const matchesTier = activeFilter === 'All' || a.cohort === activeFilter;
    const matchesSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sport.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

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
    </div>
  );
}
