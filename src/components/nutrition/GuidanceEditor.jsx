import { useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useMealStructureGuidance, GUIDANCE_SECTIONS } from '../../hooks/useMealStructureGuidance';

const GOLD = '#A58D69';

/**
 * GuidanceEditor — coach-facing editor for the Meal Structure &
 * Guidance content shown to the athlete. One textarea per section
 * (general / breakfast / lunch / snack / dinner / hydration) with
 * an auto-save on blur. Header carries a saved-state indicator so
 * the coach always knows where they are.
 */
export default function GuidanceEditor({ athleteId, athleteName }) {
  const { content, loading, saving, save } = useMealStructureGuidance(athleteId);
  const [draft, setDraft] = useState(content);
  const [savedTick, setSavedTick] = useState(0);
  const debounceRef = useRef(null);

  // Sync local draft when the server-side content arrives.
  useEffect(() => {
    setDraft(content);
  }, [content]);

  const isDirty = GUIDANCE_SECTIONS.some(s => (draft[s.key] || '') !== (content[s.key] || ''));

  const onChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const flushSave = async () => {
    if (!isDirty || saving) return;
    const res = await save(draft);
    if (res.ok) setSavedTick(t => t + 1);
  };

  // Save on blur (already wired below) plus a 1.2s debounce on
  // typing so a busy session lands changes without forcing the
  // coach to click off the textarea.
  useEffect(() => {
    if (!isDirty) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { flushSave(); }, 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-gray-100 p-6 text-xs text-gray-400 flex items-center gap-2"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Loader2 size={12} className="animate-spin" /> Loading guidance…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-xl bg-white border border-gray-100 px-5 py-4 flex items-center justify-between"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div>
          <p className="text-sm font-bold text-gray-900">
            Meal Structure &amp; Guidance{athleteName ? ` for ${athleteName}` : ''}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            What the athlete sees when they tap <em>"View recommended food"</em> on their app.
            Changes save automatically.
          </p>
        </div>
        <div className="text-[11px] font-semibold inline-flex items-center gap-1.5"
             style={{ color: saving ? '#6b7280' : isDirty ? '#A58D69' : '#16a34a' }}>
          {saving
            ? <><Loader2 size={11} className="animate-spin" /> Saving…</>
            : isDirty
              ? 'Unsaved changes…'
              : savedTick > 0
                ? <><Check size={11} /> Saved</>
                : 'Up to date'}
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {GUIDANCE_SECTIONS.map(sec => (
          <div key={sec.key}
            className="rounded-xl bg-white border border-gray-100 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">{sec.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sec.hint}</p>
            </div>
            <div className="p-3">
              <textarea
                value={draft[sec.key] || ''}
                onChange={(e) => onChange(sec.key, e.target.value)}
                onBlur={flushSave}
                rows={5}
                placeholder={`Tap to add ${sec.label.toLowerCase()} guidance…`}
                className="w-full text-xs px-3 py-2 rounded border border-gray-100 focus:outline-none focus:border-gold-400 resize-y bg-gray-50/40 placeholder:text-gray-300 leading-relaxed"
                style={{ color: '#1C1C1C' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
