import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useExerciseLibrary } from '../../../../hooks/useExerciseLibrary';

const PRESCRIPTION_LABELS = {
  kg:             'kg',
  percent_1rm:    '%1RM',
  velocity_zone:  'velocity',
  rir:            'RIR',
  rpe:            'RPE',
  time:           'time',
  reps_only:      'reps',
  band_colour:    'band',
};

/**
 * ExerciseSearchDropdown — searchable picker over exercise_library.
 * onSelect(libraryRow) appends the exercise to the session.
 */
export default function ExerciseSearchDropdown({ onSelect }) {
  const { exercises, loading } = useExerciseLibrary();
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises.slice(0, 40);
    return exercises.filter(e => e.name.toLowerCase().includes(q)).slice(0, 40);
  }, [query, exercises]);

  const handleSelect = (ex) => {
    onSelect(ex);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <Plus size={14} style={{ color: '#A58D69' }} />
        <span className="text-xs font-semibold shrink-0" style={{ color: '#A58D69' }}>
          Add exercise
        </span>
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
          <input
            type="text"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            placeholder={loading ? 'Loading library…' : 'Search exercises…'}
            disabled={loading}
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gray-300 disabled:bg-gray-50"
          />
        </div>
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white rounded-lg shadow-lg z-50"
          style={{ border: '1px solid #e5e7eb' }}
        >
          {filtered.map(ex => (
            <button
              key={ex.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(ex); }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 border-b border-gray-50 last:border-b-0"
            >
              <span className="text-xs font-semibold truncate" style={{ color: '#1C1C1C' }}>
                {ex.name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="text-[9px] uppercase tracking-wider"
                  style={{ color: '#9ca3af' }}
                >
                  {(ex.category || '').replace('_', ' ')}
                </span>
                <span
                  className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                >
                  {PRESCRIPTION_LABELS[ex.default_prescription_type] || ex.default_prescription_type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && filtered.length === 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 px-3 py-3 bg-white rounded-lg shadow-lg z-50 text-[11px]"
          style={{ border: '1px solid #e5e7eb', color: '#9ca3af' }}
        >
          No exercises matching "{query}".
        </div>
      )}
    </div>
  );
}
