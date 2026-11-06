import { useSupportLevel } from '../../hooks/useSupportLevel';
import { SUPPORT_LEVELS, levelOf } from '../../utils/support';

const GOLD = '#A58D69';

/**
 * Support level for this athlete, at the top of Physical Development. Not everyone is programmed or tracked:
 * this is how the dashboard knows who to expect programmes, check-ins and watch data for.
 */
export default function SupportLevelBar({ athleteId }) {
  const { level, available, loading, saving, error, save } = useSupportLevel(athleteId);
  const current = levelOf(level);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mb-5 no-print">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-gray-900">Level of support</h3>
        <p className="text-xs text-gray-500">
          {current.programmed ? 'Programmed here' : 'Not programmed here'} · {current.tracked ? 'wearable tracked' : 'no wearable'}
        </p>
      </div>
      {!available ? (
        <p className="text-xs text-amber-800 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          Levels of support aren’t switched on yet. They need <code>sql/support_levels_2026-11-06.sql</code> to be run once. Until then everyone counts as full support.
        </p>
      ) : (
        <div role="radiogroup" aria-label="Level of support" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORT_LEVELS.map(l => {
            const on = level === l.key;
            return (
              <button key={l.key} role="radio" aria-checked={on} disabled={loading || saving} onClick={() => !on && save(l.key)}
                className="text-left rounded-lg border px-3 py-2 transition disabled:opacity-60"
                style={{ borderColor: on ? GOLD : '#e5e7eb', backgroundColor: on ? '#f1eadc' : '#ffffff', boxShadow: on ? '0 0 0 2px rgba(165,141,105,0.25)' : 'none' }}>
                <span className="block text-sm font-semibold text-gray-900">{l.label}</span>
                <span className="block text-[11px] text-gray-500 leading-snug mt-0.5">{l.blurb}</span>
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
