import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  useMealStructureGuidance, GUIDANCE_SECTIONS,
} from '../../hooks/useMealStructureGuidance';

const GOLD = '#A58D69';

/**
 * GuidanceSheet — athlete-facing view of the recommended-plate
 * guidance set by the nutritionist in the Meal Structure & Guidance
 * sub-tab. Renders one card per non-empty section; empty sections are
 * skipped so the athlete sees the bits that matter.
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
            GUIDANCE_SECTIONS
              .filter(sec => String(content[sec.key] || '').trim())
              .map(sec => (
                <section
                  key={sec.key}
                  className="rounded-xl bg-white border border-ink-100 overflow-hidden"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className="px-4 pt-3 pb-2 border-b border-ink-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>
                      {sec.label}
                    </p>
                  </div>
                  <p className="px-4 py-3 text-sm text-ink-800 whitespace-pre-wrap leading-relaxed">
                    {content[sec.key]}
                  </p>
                </section>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
