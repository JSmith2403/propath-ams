import { ArrowLeft, Apple, GlassWater, Loader2, Moon, Sun } from 'lucide-react';
import { useMealStructureGuidance, BLOCK_TYPES } from '../../hooks/useMealStructureGuidance';

const GOLD = '#A58D69';

const TYPE_ICONS = {
  breakfast: Sun,
  lunch:     Sun,
  snack:     Apple,
  dinner:    Moon,
  drink:     GlassWater,
};

/**
 * GuidanceSheet — athlete-facing view of the recommended-plate
 * guidance set by the nutritionist in the Meal Structure & Guidance
 * sub-tab. General note first, then the coach's chronological run of
 * meal blocks in the order they built them, then hydration. Empty
 * blocks/notes are skipped so the athlete sees only what matters.
 */
export default function GuidanceSheet({ athleteId, onClose }) {
  const { content, loading, isEmpty } = useMealStructureGuidance(athleteId);

  return (
    <div className="fixed inset-0 z-[60] bg-ink-50 overflow-y-auto"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-[480px] mx-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-ink-100 px-4 py-3 flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded hover:bg-ink-50" aria-label="Back">
            <ArrowLeft size={18} className="text-ink-500" />
          </button>
          <h2 className="text-base font-bold text-ink-900">Recommended food structure</h2>
        </div>

        <div className="px-4 py-4 space-y-3">
          {loading ? (
            <div className="py-10 text-center text-xs text-ink-400 flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : isEmpty ? (
            <div className="rounded-xl bg-white border border-ink-100 p-6 text-center text-xs italic text-ink-400"
                 style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              Your nutritionist hasn't added recommended structure guidance yet —
              check back soon, or ask them to fill it in from your profile.
            </div>
          ) : (
            <>
              {content.general.trim() && (
                <section className="rounded-xl bg-white border border-ink-100 overflow-hidden"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 pt-3 pb-2 border-b border-ink-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>
                      Overall guidance
                    </p>
                  </div>
                  <p className="px-4 py-3 text-sm text-ink-800 whitespace-pre-wrap leading-relaxed">
                    {content.general}
                  </p>
                </section>
              )}

              {content.blocks
                .filter(b => String(b.text || '').trim())
                .map((block, i) => {
                  const meta = BLOCK_TYPES.find(t => t.key === block.type);
                  const Icon = TYPE_ICONS[block.type] || Sun;
                  return (
                    <section
                      key={block.id}
                      className="rounded-xl bg-white border border-ink-100 overflow-hidden"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <div className="px-4 pt-3 pb-2 border-b border-ink-100 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                             style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}>
                          <Icon size={13} />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>
                          {i + 1}. {meta?.label || block.type}
                        </p>
                      </div>
                      <p className="px-4 py-3 text-sm text-ink-800 whitespace-pre-wrap leading-relaxed">
                        {block.text}
                      </p>
                    </section>
                  );
                })}

              {content.hydration.trim() && (
                <section className="rounded-xl bg-white border border-ink-100 overflow-hidden"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 pt-3 pb-2 border-b border-ink-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>
                      Hydration
                    </p>
                  </div>
                  <p className="px-4 py-3 text-sm text-ink-800 whitespace-pre-wrap leading-relaxed">
                    {content.hydration}
                  </p>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
