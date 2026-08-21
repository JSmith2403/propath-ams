import { useEffect, useMemo, useState } from 'react';
import {
  Apple, Calendar, Check, ChevronDown, ChevronUp, Clock3, GlassWater,
  GripVertical, Info, Loader2, Moon, Pencil, Plus, Repeat, Sun, Trash2,
} from 'lucide-react';
import { useMealStructures, BLOCK_TYPES, DAY_KEYS, DAY_LABELS } from '../../hooks/useMealStructures';

const GOLD = '#A58D69';

const TYPE_ICONS = { breakfast: Sun, lunch: Sun, snack: Apple, dinner: Moon, drink: GlassWater };

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
];

function emptyDraft() {
  return { name: '', all_days: true, days: [], priority: 2, blocks: [], general: '', hydration: '' };
}

function newBlock() {
  return { id: crypto.randomUUID(), type: null, text: '' };
}

function dayBadge(structure) {
  if (structure.all_days) return 'All days';
  const days = structure.days || [];
  if (!days.length) return 'No days set';
  return days.map(d => DAY_LABELS[d]?.slice(0, 3)).join(', ');
}

/**
 * MealStructureBuilder — coach editor for an athlete's meal structures.
 * A structure is a named, day-of-week-scoped, chronological sequence of
 * generic "Meal / Snack" blocks (each optionally typed + annotated via
 * its pencil edit). Multiple structures can coexist — e.g. a Training
 * Day structure and a separate Rest Day one — priority breaks ties
 * when more than one could apply to the same day.
 */
export default function MealStructureBuilder({ athleteId, athleteName }) {
  const { structures, loading, createStructure, updateStructure, deleteStructure } = useMealStructures(athleteId);
  const [selectedId, setSelectedId] = useState(null);
  // Distinguishes "nothing auto-selected yet" from "coach explicitly
  // cleared the selection to start a new structure" — both look like
  // selectedId === null, but only the first should trigger auto-select.
  const [creatingNew, setCreatingNew] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [dragBlockId, setDragBlockId] = useState(null);

  useEffect(() => {
    if (selectedId || creatingNew || !structures.length) return;
    setSelectedId(structures[0].id);
  }, [structures, selectedId, creatingNew]);

  useEffect(() => {
    if (creatingNew && !selectedId) return; // preserve the in-progress new-structure draft
    const s = structures.find(x => x.id === selectedId);
    setDraft(s ? { ...s, days: s.days || [], blocks: s.blocks || [] } : null);
  }, [selectedId, structures, creatingNew]);

  const isDirty = useMemo(() => {
    if (!draft) return false;
    const orig = structures.find(s => s.id === selectedId);
    if (!orig) return true;
    const strip = s => JSON.stringify({ ...s, updated_at: undefined, created_at: undefined });
    return strip(orig) !== strip(draft);
  }, [draft, structures, selectedId]);

  const startNew = () => {
    setCreatingNew(true);
    setSelectedId(null);
    setDraft(emptyDraft());
    setEditingBlockId(null);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    if (selectedId) {
      await updateStructure(selectedId, draft);
    } else {
      const res = await createStructure(draft);
      if (res.ok) { setCreatingNew(false); setSelectedId(res.structure.id); }
    }
    setSaving(false);
    setSavedTick(t => t + 1);
  };

  const handleCancel = () => {
    if (selectedId) {
      const s = structures.find(x => x.id === selectedId);
      setDraft(s ? { ...s, days: s.days || [], blocks: s.blocks || [] } : null);
    } else {
      setCreatingNew(false);
      setDraft(null);
      setSelectedId(structures[0]?.id || null);
    }
    setEditingBlockId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) { setDraft(null); return; }
    await deleteStructure(selectedId);
    setSelectedId(null);
    setDraft(null);
  };

  const setField = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  const toggleDay = (day) => setDraft(prev => {
    const has = (prev.days || []).includes(day);
    return { ...prev, days: has ? prev.days.filter(d => d !== day) : [...(prev.days || []), day] };
  });

  const addBlock = () => setDraft(prev => ({ ...prev, blocks: [...prev.blocks, newBlock()] }));
  const updateBlock = (id, patch) => setDraft(prev => ({
    ...prev, blocks: prev.blocks.map(b => b.id === id ? { ...b, ...patch } : b),
  }));
  const removeBlock = (id) => setDraft(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
  const moveBlock = (id, dir) => setDraft(prev => {
    const i = prev.blocks.findIndex(b => b.id === id);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= prev.blocks.length) return prev;
    const blocks = [...prev.blocks];
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    return { ...prev, blocks };
  });

  const handleBlockDragEnter = (overId) => {
    if (!dragBlockId || dragBlockId === overId) return;
    setDraft(prev => {
      const blocks = [...prev.blocks];
      const from = blocks.findIndex(b => b.id === dragBlockId);
      const to = blocks.findIndex(b => b.id === overId);
      if (from === -1 || to === -1) return prev;
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      return { ...prev, blocks };
    });
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-gray-100 p-6 text-xs text-gray-400 flex items-center gap-2"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Loader2 size={12} className="animate-spin" /> Loading meal structures…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Meal Structure &amp; Guidance{athleteName ? ` for ${athleteName}` : ''}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Build one or more day-scoped structures — the athlete always sees whichever applies today.
          </p>
        </div>
        <SaveStatus saving={saving} isDirty={isDirty} savedTick={savedTick} />
      </div>

      <StructureSwitcher structures={structures} selectedId={selectedId} onSelect={setSelectedId} onNew={startNew} />

      {!draft ? (
        <div className="rounded-xl bg-white border border-gray-100 p-8 text-center"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p className="text-sm text-gray-500 mb-3">No meal structures yet for this athlete.</p>
          <button onClick={startNew}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: GOLD }}>
            <Plus size={13} /> Create structure
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <AboutColumn />
            <BuildColumn
              blocks={draft.blocks}
              editingBlockId={editingBlockId}
              setEditingBlockId={setEditingBlockId}
              onAdd={addBlock}
              onUpdate={updateBlock}
              onRemove={removeBlock}
              onMove={moveBlock}
              dragBlockId={dragBlockId}
              setDragBlockId={setDragBlockId}
              onDragEnter={handleBlockDragEnter}
            />
            <ApplyColumn draft={draft} setField={setField} toggleDay={toggleDay} />
          </div>

          <div className="rounded-xl bg-white border border-gray-100 px-5 py-3 flex items-center justify-between"
               style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {selectedId ? (
              <button onClick={handleDelete} className="text-xs font-semibold text-red-400 hover:text-red-600 inline-flex items-center gap-1">
                <Trash2 size={12} /> Delete structure
              </button>
            ) : <span />}
            <div className="flex items-center gap-2">
              <button onClick={handleCancel} disabled={!isDirty}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-40 rounded-lg border border-gray-200">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!isDirty || saving}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: GOLD }}>
                {saving ? 'Saving…' : 'Save Structure'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SaveStatus({ saving, isDirty, savedTick }) {
  return (
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
  );
}

function StructureSwitcher({ structures, selectedId, onSelect, onNew }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {structures.map(s => {
        const active = s.id === selectedId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="shrink-0 px-3 py-2 rounded-lg border text-left transition-colors"
            style={{
              borderColor: active ? GOLD : '#e5e7eb',
              backgroundColor: active ? 'rgba(165,141,105,0.08)' : '#fff',
            }}
          >
            <p className="text-xs font-bold text-gray-800">{s.name || 'Untitled structure'}</p>
            <p className="text-[10px] text-gray-400">{dayBadge(s)} · {PRIORITY_OPTIONS.find(p => p.value === s.priority)?.label} priority</p>
          </button>
        );
      })}
      <button onClick={onNew}
        className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold">
        <Plus size={12} /> New Structure
      </button>
    </div>
  );
}

function AboutColumn() {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p className="text-sm font-bold text-gray-900 mb-1">About Meal Structure</p>
      <p className="text-[11px] text-gray-500 mb-4">Define the recommended meal/snack structure for this athlete.</p>

      <div className="space-y-3">
        <AboutRow icon={Clock3} title="Chronological structure" body="Build meals in the order they should occur during the day." />
        <AboutRow icon={Repeat} title="Flexible & personalised" body="Tailor the structure to training days, rest days, or any schedule." />
        <AboutRow icon={Calendar} title="Applies to selected days" body="Choose which days of the week this structure applies to." />
      </div>

      <div className="mt-5 rounded-lg px-3 py-3" style={{ backgroundColor: 'rgba(165,141,105,0.08)' }}>
        <p className="text-[11px] font-bold mb-1" style={{ color: GOLD }}>Tips</p>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Keep it simple and realistic. Aim for 3–6 eating occasions per day including meals and snacks.
        </p>
      </div>
    </div>
  );
}

function AboutRow({ icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-800">{title}</p>
        <p className="text-[11px] text-gray-500">{body}</p>
      </div>
    </div>
  );
}

function BuildColumn({ blocks, editingBlockId, setEditingBlockId, onAdd, onUpdate, onRemove, onMove, dragBlockId, setDragBlockId, onDragEnter }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p className="text-sm font-bold text-gray-900 mb-1">1. Build Meal Structure</p>
      <p className="text-[11px] text-gray-500 mb-4">Create the chronological structure for this athlete's day.</p>

      <div>
        {blocks.map((block, i) => {
          const meta = BLOCK_TYPES.find(t => t.key === block.type);
          const Icon = TYPE_ICONS[block.type] || null;
          const isEditing = editingBlockId === block.id;
          return (
            <div key={block.id}>
              <div className="flex items-stretch gap-2.5">
                <div className="flex flex-col items-center shrink-0" style={{ width: 24 }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                       style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                    {i + 1}
                  </div>
                  {i < blocks.length - 1 && <div className="flex-1 w-px my-1" style={{ backgroundColor: '#e5e7eb' }} />}
                </div>

                <div
                  draggable
                  onDragStart={() => setDragBlockId(block.id)}
                  onDragEnter={() => onDragEnter(block.id)}
                  onDragOver={e => e.preventDefault()}
                  onDragEnd={() => setDragBlockId(null)}
                  className="flex-1 mb-3 rounded-lg border border-gray-100 bg-gray-50/40 overflow-hidden"
                  style={{ opacity: dragBlockId === block.id ? 0.4 : 1 }}
                >
                  <div className="flex items-center gap-2 px-2.5 py-2">
                    <GripVertical size={13} className="text-gray-300 shrink-0" style={{ cursor: 'grab' }} />
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                         style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}>
                      {Icon ? <Icon size={14} /> : <Plus size={14} />}
                    </div>
                    <span className="text-xs font-bold text-gray-700 flex-1">{meta?.label || 'Meal / Snack'}</span>
                    <button onClick={() => setEditingBlockId(isEditing ? null : block.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onRemove(block.id)} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {isEditing && (
                    <div className="px-2.5 pb-2.5 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {BLOCK_TYPES.map(t => {
                          const TIcon = TYPE_ICONS[t.key];
                          const on = block.type === t.key;
                          return (
                            <button key={t.key} type="button"
                              onClick={() => onUpdate(block.id, { type: on ? null : t.key })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors"
                              style={{
                                borderColor: on ? GOLD : '#e5e7eb',
                                backgroundColor: on ? 'rgba(165,141,105,0.10)' : '#fff',
                                color: on ? GOLD : '#6b7280',
                              }}>
                              <TIcon size={11} /> {t.label}
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={block.text}
                        onChange={e => onUpdate(block.id, { text: e.target.value })}
                        rows={2}
                        placeholder="Optional guidance for this slot…"
                        className="w-full text-xs px-2.5 py-2 rounded border border-gray-100 focus:outline-none focus:border-gold-400 resize-y bg-white placeholder:text-gray-300"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => onMove(block.id, -1)} disabled={i === 0}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30">
                          <ChevronUp size={13} />
                        </button>
                        <button onClick={() => onMove(block.id, 1)} disabled={i === blocks.length - 1}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30">
                          <ChevronDown size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onAdd}
        className="w-full py-2.5 rounded-lg border border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 text-xs font-bold inline-flex items-center justify-center gap-1.5">
        <Plus size={13} /> Add Meal / Snack
      </button>

      <div className="mt-3 rounded-lg px-3 py-2.5 flex items-start gap-2" style={{ backgroundColor: '#eff6ff' }}>
        <Info size={13} className="shrink-0 mt-0.5" style={{ color: '#3b82f6' }} />
        <p className="text-[11px]" style={{ color: '#1e40af' }}>
          This structure will appear to the athlete as a single "+ Meal/Snack" entry for each item in your set order.
        </p>
      </div>
    </div>
  );
}

function ApplyColumn({ draft, setField, toggleDay }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p className="text-sm font-bold text-gray-900 mb-1">2. Apply Structure To</p>
      <p className="text-[11px] text-gray-500 mb-4">Choose when this meal structure should apply.</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => setField('all_days', false)}
          className="py-2 rounded-lg border text-xs font-bold"
          style={{
            borderColor: !draft.all_days ? GOLD : '#e5e7eb',
            backgroundColor: !draft.all_days ? 'rgba(165,141,105,0.08)' : '#fff',
            color: !draft.all_days ? GOLD : '#6b7280',
          }}>
          Specific Days
        </button>
        <button onClick={() => setField('all_days', true)}
          className="py-2 rounded-lg border text-xs font-bold"
          style={{
            borderColor: draft.all_days ? GOLD : '#e5e7eb',
            backgroundColor: draft.all_days ? 'rgba(165,141,105,0.08)' : '#fff',
            color: draft.all_days ? GOLD : '#6b7280',
          }}>
          All Days
        </button>
      </div>

      {!draft.all_days && (
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-700 mb-1">Select days</p>
          <p className="text-[11px] text-gray-400 mb-2">The structure will apply only to the selected days.</p>
          <div className="space-y-1.5">
            {DAY_KEYS.map(day => (
              <label key={day} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={(draft.days || []).includes(day)} onChange={() => toggleDay(day)}
                  className="rounded border-gray-300" style={{ accentColor: GOLD }} />
                {DAY_LABELS[day]}
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="block mb-4">
        <span className="text-xs font-bold text-gray-700 block mb-1">Structure Name (Optional)</span>
        <span className="text-[11px] text-gray-400 block mb-1.5">Helps you identify this structure.</span>
        <input
          value={draft.name}
          onChange={e => setField('name', e.target.value)}
          placeholder="e.g. Training Day Structure"
          className="w-full text-xs px-3 py-2 rounded border border-gray-200 focus:outline-none focus:border-gold-400"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold text-gray-700 block mb-1">Priority</span>
        <span className="text-[11px] text-gray-400 block mb-1.5">Choose which structure takes precedence if multiple apply.</span>
        <select
          value={draft.priority}
          onChange={e => setField('priority', Number(e.target.value))}
          className="w-full text-xs px-3 py-2 rounded border border-gray-200 focus:outline-none focus:border-gold-400 bg-white"
        >
          {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </label>
    </div>
  );
}
