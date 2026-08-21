import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useWaterIntake, GLASS_ML } from '../../hooks/useWaterIntake';

const GOLD = '#A58D69';
const TEAL_LIGHT = '#5e8e9e';
const TEAL_DARK  = '#346574';
const MIN_TARGET = 1;
const MAX_TARGET = 16;

// Matches the app's own teal ramp (tailwind.config.js `teal`) rather
// than an arbitrary blue, so it reads as part of the same design
// system instead of a bolted-on placeholder icon.
function GlassIcon({ filled, index }) {
  const gradId = `water-glass-fill-${index}`;
  return (
    <div style={{
      filter: filled ? 'drop-shadow(0 3px 6px rgba(52,101,116,0.30))' : 'none',
      transition: 'filter 200ms ease',
    }}>
      <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL_LIGHT} />
            <stop offset="100%" stopColor={TEAL_DARK} />
          </linearGradient>
        </defs>
        <path
          d="M6 6 H28 L25.2 38.5 a4 4 0 0 1 -4 3.5 H12.8 a4 4 0 0 1 -4 -3.5 L6 6 Z"
          fill={filled ? `url(#${gradId})` : '#fafafa'}
          stroke={filled ? TEAL_DARK : '#d1d1d4'}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: 'fill 200ms ease, stroke 200ms ease' }}
        />
        <ellipse
          cx="17" cy="6" rx="11" ry="2.4"
          fill={filled ? TEAL_LIGHT : '#fafafa'}
          stroke={filled ? TEAL_DARK : '#d1d1d4'}
          strokeWidth="1.6"
          style={{ transition: 'fill 200ms ease, stroke 200ms ease' }}
        />
        {filled && (
          <path d="M10.5 11 L9 30" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

/**
 * WaterIntakeWidget — athlete-app row of tap-to-fill glasses. Tapping
 * glass i fills up to and including it, or (if it's already the last
 * filled glass) empties back down to it — the usual star-rating click
 * behaviour, so no separate undo control is needed. The "N x 500ml"
 * label opens a small popup to change the daily glass target; the
 * 500ml-per-glass size itself is fixed.
 */
export default function WaterIntakeWidget({ athleteId, target, onChangeTarget }) {
  const { glasses, setGlasses } = useWaterIntake(athleteId);
  const [editingTarget, setEditingTarget] = useState(false);

  const tapGlass = (index) => {
    const next = glasses > index ? index : index + 1;
    setGlasses(next);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-ink-900">Water intake</h3>
        <button
          type="button"
          onClick={() => setEditingTarget(true)}
          className="text-meta text-ink-500 underline decoration-dotted underline-offset-2"
        >
          {target} x {GLASS_ML}ml
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {Array.from({ length: target }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tapGlass(i)}
            aria-label={`${i < glasses ? 'Empty' : 'Fill'} glass ${i + 1}`}
            className="active:scale-95 transition-transform"
          >
            <GlassIcon filled={i < glasses} index={i} />
          </button>
        ))}
      </div>

      {editingTarget && (
        <TargetPopup
          initial={target}
          onCancel={() => setEditingTarget(false)}
          onSave={(n) => { onChangeTarget(n); setEditingTarget(false); }}
        />
      )}
    </div>
  );
}

function TargetPopup({ initial, onCancel, onSave }) {
  const [value, setValue] = useState(initial);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white w-full rounded-2xl shadow-2xl" style={{ maxWidth: 340 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>Daily water target</h3>
          <button onClick={onCancel} className="p-1.5 rounded hover:bg-ink-50">
            <X size={16} className="text-ink-500" />
          </button>
        </div>

        <div className="px-5 py-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setValue(v => Math.max(MIN_TARGET, v - 1))}
              className="w-9 h-9 rounded-full border border-ink-200 flex items-center justify-center disabled:opacity-30"
              disabled={value <= MIN_TARGET}
            >
              <Minus size={15} className="text-ink-600" />
            </button>
            <div className="text-center" style={{ width: 96 }}>
              <p className="text-2xl font-bold text-ink-900">{value}</p>
              <p className="text-meta text-ink-500">x {GLASS_ML}ml</p>
            </div>
            <button
              type="button"
              onClick={() => setValue(v => Math.min(MAX_TARGET, v + 1))}
              className="w-9 h-9 rounded-full border border-ink-200 flex items-center justify-center disabled:opacity-30"
              disabled={value >= MAX_TARGET}
            >
              <Plus size={15} className="text-ink-600" />
            </button>
          </div>
          <p className="text-meta text-ink-400">= {value * GLASS_ML}ml per day</p>
        </div>

        <div className="px-5 py-3 border-t border-ink-100 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg text-sm font-semibold text-ink-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            className="flex-[2] py-3 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: GOLD }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
