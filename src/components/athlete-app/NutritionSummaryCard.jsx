import { Apple, ChevronRight, GlassWater, Lightbulb, Moon, Plus, Sun } from 'lucide-react';
import { useNutritionSettings } from '../../hooks/useNutritionSettings';
import { useTodayMealStructure, BLOCK_TYPES } from '../../hooks/useMealStructures';
import { useMealEntries } from '../../hooks/useMealEntries';

const GOLD = '#A58D69';
const TYPE_ICONS = { breakfast: Sun, lunch: Sun, snack: Apple, dinner: Moon, drink: GlassWater };

function todayIso() {
  return new Date().toLocaleDateString('en-CA');
}

/**
 * NutritionSummaryCard — home-screen shortcut into the Nutrition tab.
 * When today's applicable meal structure has blocks, shows a progress
 * ring + per-slot icon row (same completion logic as the Food Diary on
 * the Nutrition tab itself); otherwise collapses to a plain "Log a
 * Meal / Snack" shortcut. Hidden entirely when snap & send is off.
 */
export default function NutritionSummaryCard({ athleteId, onOpen }) {
  const { settings, loading: settingsLoading } = useNutritionSettings(athleteId);
  const { today, loading: structureLoading, hasBlocks } = useTodayMealStructure(athleteId);
  const { entries } = useMealEntries(athleteId, todayIso());

  if (settingsLoading || structureLoading || !settings?.meal_logging_enabled) return null;

  const filledByType = {};
  for (const e of entries) {
    const t = e.meal_type?.startsWith('snack') ? 'snack' : e.meal_type;
    if (t) filledByType[t] = (filledByType[t] || 0) + 1;
  }

  const seen = {};
  const positional = (hasBlocks ? today.blocks : []).map(block => {
    const type = block.type;
    let isFilled = false;
    if (type) {
      const idx = seen[type] || 0;
      isFilled = (filledByType[type] || 0) > idx;
      seen[type] = idx + 1;
    }
    return { ...block, isFilled };
  });

  if (!hasBlocks) {
    return (
      <button
        onClick={onOpen}
        className="w-full rounded-xl p-4 text-left flex items-center gap-3 active:scale-[0.99] transition-all"
        style={{ border: '1px solid rgba(165,141,105,0.35)', backgroundColor: 'rgba(165,141,105,0.06)' }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
             style={{ backgroundColor: 'rgba(165,141,105,0.14)', color: GOLD }}>
          <Apple size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-bold text-ink-900">Nutrition</p>
          <p className="text-meta text-ink-500">Log a meal or snack</p>
        </div>
        <ChevronRight size={18} className="text-ink-300 shrink-0" />
      </button>
    );
  }

  const total = positional.length;
  const done  = positional.filter(b => b.isFilled).length;
  const r = 26, c = 2 * Math.PI * r;
  const offset = c * (1 - (total ? done / total : 0));

  const bodyText = done === 0
    ? "You haven't logged any meals yet today. Fuel well to perform and recover."
    : done === total
      ? 'All meals logged for today — nice work fuelling right.'
      : `${done} of ${total} logged today — keep going.`;

  return (
    <div className="rounded-xl p-4" style={{ border: '1px solid rgba(165,141,105,0.35)', backgroundColor: 'rgba(165,141,105,0.06)' }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
             style={{ backgroundColor: 'rgba(165,141,105,0.14)', color: GOLD }}>
          <Apple size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-bold text-ink-900">Nutrition</p>
          <p className="text-meta font-semibold" style={{ color: GOLD }}>Keep your fuel on track 🔥</p>
          <p className="text-meta text-ink-500 mt-0.5">{bodyText}</p>
        </div>
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          <svg viewBox="0 0 60 60" width={56} height={56}>
            <circle cx="30" cy="30" r={r} stroke="#e5e5e7" strokeWidth="5" fill="none" />
            <circle cx="30" cy="30" r={r} stroke={GOLD} strokeWidth="5" fill="none"
              strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
              transform="rotate(-90 30 30)" style={{ transition: 'stroke-dashoffset 300ms ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-sm font-bold text-ink-900">{done}/{total}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onOpen}
        className="w-full py-3 rounded-lg text-sm font-bold text-white inline-flex items-center justify-center gap-1.5 mb-3 active:scale-[0.99] transition-all"
        style={{ backgroundColor: GOLD }}
      >
        <Plus size={15} /> Log a Meal / Snack
      </button>

      <div className="relative mb-3" style={{ height: 52 }}>
        <div className="absolute border-t border-dashed" style={{ left: 18, right: 18, top: 18, borderColor: '#d9d9dc' }} />
        <div className="relative flex justify-between">
          {positional.map(block => {
            const Icon = TYPE_ICONS[block.type] || Apple;
            const meta = BLOCK_TYPES.find(t => t.key === block.type);
            return (
              <div key={block.id} className="flex flex-col items-center" style={{ width: 44 }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white"
                  style={{
                    border: `1.5px solid ${block.isFilled ? GOLD : '#d9d9dc'}`,
                    backgroundColor: block.isFilled ? GOLD : '#fff',
                    color: block.isFilled ? '#fff' : '#9a9aa0',
                  }}
                >
                  <Icon size={15} />
                </div>
                <span className="text-micro text-ink-400 mt-1 truncate" style={{ maxWidth: 44 }}>
                  {meta?.label || 'Meal'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid rgba(165,141,105,0.20)' }}>
        <Lightbulb size={14} style={{ color: GOLD }} className="shrink-0" />
        <p className="text-meta text-ink-600 flex-1">Aim for 3–4 eating occasions per day including meals and snacks.</p>
        <ChevronRight size={14} className="text-ink-300 shrink-0" />
      </div>
    </div>
  );
}
