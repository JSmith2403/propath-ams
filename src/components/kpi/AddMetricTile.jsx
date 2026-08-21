import { useMemo, useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, ChevronLeft, Search, X } from 'lucide-react';
import { getKpiTestGroups } from '../../data/kpiBoardRegistry';

/**
 * The board's "+ Add metric" tile — a dashed square that opens a
 * test-then-metric picker (rather than one long flat dropdown/list),
 * built from the same metric catalogue the old KPI dropdown used
 * (sessionMetrics categories, custom metrics, VALD imports by test type).
 *
 * customMetrics is passed in rather than fetched here — useCustomMetrics()
 * opens a Supabase Realtime channel with a fixed, non-unique name, so a
 * second concurrent instance (this component alongside
 * PerformanceTestingTab's own call) throws on subscribe.
 */
export default function AddMetricTile({ onSelect, excludeKeys = [], valdMetrics = [], customMetrics = {} }) {
  const [open, setOpen] = useState(false);
  const [test, setTest] = useState(null);
  const [query, setQuery] = useState('');
  const ref = useRef();
  const searchRef = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setTest(null); setQuery(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Autofocus the search box on open so typing works immediately.
  useEffect(() => { if (open) searchRef.current?.focus(); }, [open]);

  const groups = getKpiTestGroups({ valdMetrics, customMetrics, excludeKeys });
  const activeGroup = groups.find(g => g.test === test);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return groups.flatMap(g => g.metrics
      .filter(m => m.label.toLowerCase().includes(q) || m.key.toLowerCase().includes(q))
      .map(m => ({ ...m, test: g.test })));
  }, [groups, query]);

  const handlePick = (key) => {
    onSelect(key);
    setOpen(false);
    setTest(null);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative col-span-1">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full h-full min-h-[116px] flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <Plus size={18} />
        <span className="text-xs font-semibold">Add metric</span>
      </button>

      {open && (
        <div
          className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          style={{ width: 260, maxHeight: 380, top: 0, left: 0 }}
        >
          {/* Search — always visible; typing bypasses the test drill-down */}
          <div className="p-2 border-b border-gray-100 flex items-center gap-1.5">
            <Search size={13} className="text-gray-300 shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search metrics…"
              className="w-full text-xs px-1 py-1 focus:outline-none placeholder:text-gray-300"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-0.5 rounded hover:bg-gray-100 shrink-0" aria-label="Clear search">
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </div>

          {searchResults ? (
            <div className="overflow-y-auto">
              {searchResults.length === 0 && (
                <p className="px-3 py-4 text-xs text-gray-300 italic">No metrics match "{query}".</p>
              )}
              {searchResults.map(m => (
                <button
                  key={m.key}
                  onClick={() => handlePick(m.key)}
                  className="w-full px-3 py-1.5 flex items-center justify-between gap-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs text-gray-700 truncate">
                    {m.label}{m.unit ? <span className="text-gray-400"> ({m.unit})</span> : null}
                  </span>
                  <span className="text-[10px] text-gray-300 shrink-0">{m.test}</span>
                </button>
              ))}
            </div>
          ) : !activeGroup ? (
            <>
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                Add metric — choose a test
              </div>
              <div className="overflow-y-auto">
                {groups.length === 0 && (
                  <p className="px-3 py-4 text-xs text-gray-300 italic">Everything available is already on the board.</p>
                )}
                {groups.map(g => (
                  <button
                    key={g.test}
                    onClick={() => setTest(g.test)}
                    className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-gray-700">{g.test}</span>
                      <span className="block text-[10px] text-gray-400">{g.metrics.length} metric{g.metrics.length > 1 ? 's' : ''} available</span>
                    </span>
                    <ChevronRight size={13} className="text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setTest(null)}
                className="px-3 py-2 flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft size={13} /> {activeGroup.test}
              </button>
              <div className="overflow-y-auto">
                {activeGroup.metrics.map(m => (
                  <button
                    key={m.key}
                    onClick={() => handlePick(m.key)}
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {m.label}{m.unit ? <span className="text-gray-400"> ({m.unit})</span> : null}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
