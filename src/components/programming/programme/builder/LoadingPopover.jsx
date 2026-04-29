import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Zap } from 'lucide-react';
import { LOADING_PATTERNS } from './loadingPatterns';

/**
 * LoadingPopover — pattern picker. The panel is rendered into a React
 * portal at document.body level so it escapes the sticky-left
 * stacking contexts in the builder. Coordinates are pinned to the
 * trigger button on open.
 */
export default function LoadingPopover({ prescriptions, onApply, onSetRestAll }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const buttonRef = useRef(null);
  const panelRef  = useRef(null);
  const wk1 = (prescriptions || []).find(p => p.week_number === 1) || {};
  const restValue = wk1.rest_seconds ?? '';

  const positionPanel = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 4, left: rect.left });
  };

  const toggle = () => {
    if (open) { setOpen(false); return; }
    positionPanel();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const apply = (pattern) => {
    onApply(pattern.apply(prescriptions));
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border-0 cursor-pointer hover:bg-[rgba(165,141,105,0.16)] transition-colors"
        style={{ color: '#A58D69', backgroundColor: 'rgba(165,141,105,0.10)' }}
        title="Loading pattern"
      >
        <Zap size={10} />
        Loading
        <ChevronDown size={10} />
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          className="bg-white rounded-lg shadow-lg py-1.5"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            border: '1px solid #e5e7eb',
            minWidth: 240,
          }}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
            Pattern
          </div>
          {LOADING_PATTERNS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => apply(p)}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <div className="text-[12px] font-semibold" style={{ color: '#1C1C1C' }}>{p.label}</div>
              <div className="text-[10px]" style={{ color: '#9ca3af' }}>{p.sub}</div>
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-2 px-3 pb-2">
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: '#9ca3af' }}>
              Rest (all weeks)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                inputMode="numeric"
                value={restValue}
                onChange={(e) => {
                  const v = e.target.value;
                  onSetRestAll(v === '' ? null : Number(v));
                }}
                placeholder="—"
                className="w-16 px-2 py-1 text-[12px] tabular-nums rounded border border-gray-200 focus:outline-none focus:border-gray-400"
              />
              <span className="text-[11px]" style={{ color: '#6b7280' }}>seconds</span>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
