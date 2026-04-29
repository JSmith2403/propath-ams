import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search } from 'lucide-react';
import { useExerciseLibrary } from '../../../../hooks/useExerciseLibrary';

/**
 * ExerciseSearchDropdown — searchable picker over exercise_library.
 *
 * The result panel renders into a React portal at document.body level
 * so it escapes the sticky-left stacking contexts in the builder
 * (which kept clipping the panel behind subsequent session headers
 * and the "+ Add section" button). Coordinates are pinned to the
 * input's bounding rect.
 */
export default function ExerciseSearchDropdown({
  onSelect,
  autoFocus = false,
  onClose,
  label = 'Add exercise',
  placeholder = 'Search exercises…',
  initialQuery = '',
  selectOnFocus = false,
}) {
  const { exercises, loading } = useExerciseLibrary();
  const [query, setQuery] = useState(initialQuery);
  const [open,  setOpen]  = useState(autoFocus);
  const [coords, setCoords] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const positionPanel = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  };

  // Outside click / Esc / scroll close
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      if (containerRef.current && containerRef.current.contains(e.target)) return;
      setOpen(false);
      if (onClose) onClose();
    };
    const onScroll = () => positionPanel();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) positionPanel();
  }, [open, query]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (selectOnFocus) inputRef.current.select();
      positionPanel();
    }
  }, [autoFocus, selectOnFocus]);

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
        {label ? (
          <>
            <Plus size={14} style={{ color: '#A58D69' }} />
            <span className="text-xs font-semibold shrink-0" style={{ color: '#A58D69' }}>{label}</span>
          </>
        ) : null}
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={(e) => { setOpen(true); if (selectOnFocus) e.target.select(); }}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false);
                if (onClose) onClose();
              }
            }}
            placeholder={loading ? 'Loading library…' : placeholder}
            disabled={loading}
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gray-300 disabled:bg-gray-50"
          />
        </div>
      </div>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          className="bg-white rounded-lg shadow-lg"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: Math.max(coords.width, 240),
            maxHeight: 288,
            overflowY: 'auto',
            zIndex: 9999,
            border: '1px solid #e5e7eb',
          }}
        >
          {filtered.length > 0 ? (
            filtered.map(ex => (
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
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                    {(ex.category || '').replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))
          ) : !loading ? (
            <div className="px-3 py-3 text-[11px]" style={{ color: '#9ca3af' }}>
              No exercises matching "{query}".
            </div>
          ) : null}
        </div>,
        document.body,
      )}
    </div>
  );
}
