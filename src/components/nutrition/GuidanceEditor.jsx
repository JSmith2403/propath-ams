import { useEffect, useRef, useState } from 'react';
import { Apple, Check, ChevronDown, ChevronUp, GlassWater, Loader2, Moon, Plus, Sun, X } from 'lucide-react';
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
 * GuidanceEditor — coach-facing editor for the Meal Structure &
 * Guidance content shown to the athlete. A general-guidance note, a
 * chronological sequence of meal blocks the coach builds up with
 * +Breakfast / +Lunch / +Snack / +Dinner / +Drink (mirroring how the
 * athlete's own day actually runs — e.g. Breakfast, Snack, Lunch,
 * Snack, Dinner), and a hydration note. Auto-saves on blur / a short
 * debounce while typing.
 */
export default function GuidanceEditor({ athleteId, athleteName }) {
  const { content, loading, saving, save } = useMealStructureGuidance(athleteId);
  const [draft, setDraft] = useState(content);
  const [savedTick, setSavedTick] = useState(0);
  const debounceRef = useRef(null);

  useEffect(() => { setDraft(content); }, [content]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(content);

  const flushSave = async () => {
    if (!isDirty || saving) return;
    const res = await save(draft);
    if (res.ok) setSavedTick(t => t + 1);
  };

  useEffect(() => {
    if (!isDirty) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { flushSave(); }, 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  const addBlock = (type) => setDraft(prev => ({
    ...prev,
    blocks: [...prev.blocks, { id: crypto.randomUUID(), type, text: '' }],
  }));

  const updateBlockText = (id, text) => setDraft(prev => ({
    ...prev,
    blocks: prev.blocks.map(b => b.id === id ? { ...b, text } : b),
  }));

  const removeBlock = (id) => setDraft(prev => ({
    ...prev,
    blocks: prev.blocks.filter(b => b.id !== id),
  }));

  const moveBlock = (id, dir) => setDraft(prev => {
    const i = prev.blocks.findIndex(b => b.id === id);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= prev.blocks.length) return prev;
    const blocks = [...prev.blocks];
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    return { ...prev, blocks };
  });

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

      {/* General guidance */}
      <div className="rounded-xl bg-white border border-gray-100 overflow-hidden"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Overall guidance</p>
          <p className="text-[10px] text-gray-400 mt-0.5">General principles, energy intake, what to prioritise.</p>
        </div>
        <div className="p-3">
          <textarea
            value={draft.general || ''}
            onChange={e => setField('general', e.target.value)}
            onBlur={flushSave}
            rows={3}
            placeholder="Tap to add overall guidance…"
            className="w-full text-xs px-3 py-2 rounded border border-gray-100 focus:outline-none focus:border-gold-400 resize-y bg-gray-50/40 placeholder:text-gray-300 leading-relaxed"
            style={{ color: '#1C1C1C' }}
          />
        </div>
      </div>

      {/* Chronological meal blocks */}
      <div className="rounded-xl bg-white border border-gray-100 overflow-hidden"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Daily structure</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Build the day out in order — add as many Breakfast / Snack / Lunch / Snack / Dinner blocks as the athlete actually eats.
          </p>
        </div>

        <div className="p-3 space-y-2">
          {draft.blocks.length === 0 && (
            <p className="text-xs text-gray-300 italic px-1 py-2">No blocks yet — add the first one below.</p>
          )}
          {draft.blocks.map((block, i) => {
            const meta = BLOCK_TYPES.find(t => t.key === block.type);
            const Icon = TYPE_ICONS[block.type] || Sun;
            return (
              <div key={block.id} className="rounded-lg border border-gray-100 bg-gray-50/40 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                       style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}>
                    <Icon size={13} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 flex-1">{meta?.label || block.type}</span>
                  <button onClick={() => moveBlock(block.id, -1)} disabled={i === 0}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent">
                    <ChevronUp size={13} />
                  </button>
                  <button onClick={() => moveBlock(block.id, 1)} disabled={i === draft.blocks.length - 1}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent">
                    <ChevronDown size={13} />
                  </button>
                  <button onClick={() => removeBlock(block.id)}
                    className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400">
                    <X size={13} />
                  </button>
                </div>
                <div className="p-2.5">
                  <textarea
                    value={block.text}
                    onChange={e => updateBlockText(block.id, e.target.value)}
                    onBlur={flushSave}
                    rows={3}
                    placeholder={`What should they eat for this ${meta?.label.toLowerCase() || 'block'}?`}
                    className="w-full text-xs px-3 py-2 rounded border border-gray-100 focus:outline-none focus:border-gold-400 resize-y bg-white placeholder:text-gray-300 leading-relaxed"
                    style={{ color: '#1C1C1C' }}
                  />
                </div>
              </div>
            );
          })}

          {/* Quick-add row */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {BLOCK_TYPES.map(t => {
              const Icon = TYPE_ICONS[t.key] || Sun;
              return (
                <button
                  key={t.key}
                  onClick={() => addBlock(t.key)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={11} /> <Icon size={12} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hydration */}
      <div className="rounded-xl bg-white border border-gray-100 overflow-hidden"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Hydration</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Daily fluid targets, electrolyte timing, around training.</p>
        </div>
        <div className="p-3">
          <textarea
            value={draft.hydration || ''}
            onChange={e => setField('hydration', e.target.value)}
            onBlur={flushSave}
            rows={3}
            placeholder="Tap to add hydration guidance…"
            className="w-full text-xs px-3 py-2 rounded border border-gray-100 focus:outline-none focus:border-gold-400 resize-y bg-gray-50/40 placeholder:text-gray-300 leading-relaxed"
            style={{ color: '#1C1C1C' }}
          />
        </div>
      </div>
    </div>
  );
}
