import { useEffect, useMemo, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, ChevronLeft, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * ResourcesAdminView — coach-side authoring for the athlete-app
 * Resources tab. Two layers:
 *
 *   • Index — list every resource_item grouped by category, with quick
 *     publish toggle, edit and delete actions.
 *   • Editor — title, summary, category select, plus a structured
 *     content editor that supports paragraph and card_group blocks.
 *     Card groups have a section title plus N cards; each card has a
 *     title, optional subtitle, and a bullet list. Same shape the
 *     Performance Plate seed uses.
 *
 * Saving an item makes it instantly available in every athlete's app
 * (RLS lets anon read published rows; the athlete-app subscribes
 * fresh per session).
 */

const CATEGORIES = [
  { id: 'nutrition',  label: 'Nutrition'           },
  { id: 'psychology', label: 'Psychology'          },
  { id: 'lifestyle',  label: 'Lifestyle'           },
  { id: 'future',     label: 'Future Preparation'  },
];

const GOLD = '#A58D69';

function blankItem() {
  return {
    id:            null,
    category:      'nutrition',
    title:         '',
    summary:       '',
    content:       [{ type: 'paragraph', text: '' }],
    display_order: 0,
    is_published:  true,
  };
}

export default function ResourcesAdminView() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | item draft
  const [toast, setToast]     = useState(null);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resource_items')
      .select('*')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });
    if (error) {
      console.error('[Resources admin] fetch failed', error);
      showToast(`Couldn't load resources: ${error.message}`, 'error');
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const grouped = useMemo(() => {
    const m = Object.fromEntries(CATEGORIES.map(c => [c.id, []]));
    for (const it of items) (m[it.category] = m[it.category] || []).push(it);
    return m;
  }, [items]);

  // ── Save / Delete / Toggle publish ──────────────────────────────────────
  const save = async (draft) => {
    const payload = {
      category:      draft.category,
      title:         draft.title.trim(),
      summary:       draft.summary?.trim() || null,
      content:       draft.content || [],
      display_order: draft.display_order ?? 0,
      is_published:  !!draft.is_published,
    };
    if (!payload.title) {
      showToast('Title is required.', 'error');
      return false;
    }
    let result;
    if (draft.id) {
      result = await supabase.from('resource_items').update(payload).eq('id', draft.id).select().single();
    } else {
      result = await supabase.from('resource_items').insert(payload).select().single();
    }
    if (result.error) {
      console.error('[Resources admin] save failed', result.error);
      showToast(`Save failed: ${result.error.message}`, 'error');
      return false;
    }
    showToast(draft.id ? 'Resource updated.' : 'Resource created.');
    await fetchAll();
    return true;
  };

  const togglePublish = async (it) => {
    const { error } = await supabase
      .from('resource_items')
      .update({ is_published: !it.is_published })
      .eq('id', it.id);
    if (error) {
      showToast(`Couldn't update: ${error.message}`, 'error');
      return;
    }
    await fetchAll();
  };

  const remove = async (it) => {
    if (!window.confirm(`Delete "${it.title}"? This removes it from every athlete's app.`)) return;
    const { error } = await supabase.from('resource_items').delete().eq('id', it.id);
    if (error) {
      showToast(`Couldn't delete: ${error.message}`, 'error');
      return;
    }
    showToast('Resource deleted.');
    await fetchAll();
  };

  // ── Render ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <Editor
        draft={editing}
        onCancel={() => setEditing(null)}
        onSave={async (d) => { const ok = await save(d); if (ok) setEditing(null); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#f4f5f7' }}>
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Resources</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Coach-authored content delivered to every athlete's app.
          </p>
        </div>
        <button
          onClick={() => setEditing(blankItem())}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          <Plus size={13} /> New Resource
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: '#e5e7eb', borderTopColor: GOLD }} />
          </div>
        ) : (
          CATEGORIES.map(cat => {
            const list = grouped[cat.id] || [];
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{cat.label}</h2>
                  <span className="text-xs text-gray-400">
                    {list.length} item{list.length === 1 ? '' : 's'}
                  </span>
                </div>
                {list.length === 0 ? (
                  <p className="text-xs text-gray-300 italic px-2">No resources in this category yet.</p>
                ) : (
                  <div className="space-y-2">
                    {list.map(it => (
                      <div key={it.id} className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center gap-3"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                        <div
                          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(165,141,105,0.14)' }}
                        >
                          <FileText size={16} style={{ color: GOLD }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 truncate">{it.title}</p>
                            {!it.is_published && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                style={{ color: '#92400e', backgroundColor: '#fef3c7' }}>
                                Hidden
                              </span>
                            )}
                          </div>
                          {it.summary && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{it.summary}</p>
                          )}
                        </div>
                        <button
                          onClick={() => togglePublish(it)}
                          className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title={it.is_published ? 'Hide from athletes' : 'Publish to athletes'}
                        >
                          {it.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => setEditing(it)}
                          className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => remove(it)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[90] max-w-md"
          style={{ backgroundColor: toast.kind === 'error' ? '#dc2626' : '#1C1C1C' }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────
function Editor({ draft: initial, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial);
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));

  const updateBlock = (idx, patch) => {
    setDraft(d => ({
      ...d,
      content: d.content.map((b, i) => i === idx ? { ...b, ...patch } : b),
    }));
  };
  const removeBlock = (idx) => {
    setDraft(d => ({ ...d, content: d.content.filter((_, i) => i !== idx) }));
  };
  const addBlock = (type) => {
    const fresh =
      type === 'paragraph'  ? { type: 'paragraph',  text: '' }
    : type === 'heading'    ? { type: 'heading',    text: '', level: 2 }
    : type === 'card_group' ? { type: 'card_group', title: '', cards: [] }
    :                         { type: 'paragraph',  text: '' };
    setDraft(d => ({ ...d, content: [...d.content, fresh] }));
  };
  const moveBlock = (idx, dir) => {
    setDraft(d => {
      const next = [...d.content];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return d;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...d, content: next };
    });
  };

  const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors bg-white';

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#f4f5f7' }}>
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onCancel}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <h1 className="text-base font-bold text-gray-900 truncate">
            {draft.id ? 'Edit Resource' : 'New Resource'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel}
            className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(draft)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}>
            <Save size={13} /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-card">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Category</label>
                <select value={draft.category} onChange={e => set({ category: e.target.value })}
                  className={inp + ' bg-white'}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Display Order</label>
                <input type="number" value={draft.display_order ?? 0}
                  onChange={e => set({ display_order: Number(e.target.value) || 0 })}
                  className={inp} />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Title</label>
              <input type="text" value={draft.title} onChange={e => set({ title: e.target.value })}
                placeholder="e.g. Build Your Athlete's Plate"
                className={inp} />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Summary (one line)</label>
              <input type="text" value={draft.summary || ''} onChange={e => set({ summary: e.target.value })}
                placeholder="Short blurb shown in the list view."
                className={inp} />
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!draft.is_published}
                onChange={e => set({ is_published: e.target.checked })} />
              <span className="text-xs text-gray-700">Published — visible in every athlete's app</span>
            </label>
          </div>

          {/* Blocks */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Content blocks</p>
            {draft.content.map((b, i) => (
              <BlockEditor
                key={i}
                block={b}
                onChange={(patch) => updateBlock(i, patch)}
                onRemove={() => removeBlock(i)}
                onMoveUp={() => moveBlock(i, -1)}
                onMoveDown={() => moveBlock(i, +1)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-1">Add:</span>
            <button onClick={() => addBlock('paragraph')}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded text-gray-700 hover:bg-gray-50">
              Paragraph
            </button>
            <button onClick={() => addBlock('heading')}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded text-gray-700 hover:bg-gray-50">
              Heading
            </button>
            <button onClick={() => addBlock('card_group')}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded text-gray-700 hover:bg-gray-50">
              Card group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Per-block editor ─────────────────────────────────────────────────────
function BlockEditor({ block, onChange, onRemove, onMoveUp, onMoveDown }) {
  const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gold-500 transition-colors bg-white';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {block.type.replace('_', ' ')}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp}
            className="text-[10px] px-1.5 py-0.5 rounded text-gray-400 hover:bg-gray-100">↑</button>
          <button onClick={onMoveDown}
            className="text-[10px] px-1.5 py-0.5 rounded text-gray-400 hover:bg-gray-100">↓</button>
          <button onClick={onRemove}
            className="p-1 rounded text-gray-300 hover:text-red-600 hover:bg-red-50">
            <X size={12} />
          </button>
        </div>
      </div>

      {block.type === 'paragraph' && (
        <textarea value={block.text || ''} onChange={e => onChange({ text: e.target.value })}
          rows={3} className={`${inp} resize-y`}
          placeholder="Paragraph text…" />
      )}

      {block.type === 'heading' && (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input type="text" value={block.text || ''} onChange={e => onChange({ text: e.target.value })}
            placeholder="Heading text" className={inp} />
          <select value={block.level || 2} onChange={e => onChange({ level: Number(e.target.value) })}
            className={inp + ' bg-white'}>
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
        </div>
      )}

      {block.type === 'card_group' && (
        <CardGroupEditor block={block} onChange={onChange} />
      )}
    </div>
  );
}

function CardGroupEditor({ block, onChange }) {
  const cards = block.cards || [];
  const setCards = (next) => onChange({ cards: next });

  const updateCard = (i, patch) => setCards(cards.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  const addCard    = ()         => setCards([...cards, { title: '', subtitle: '', bullets: [''] }]);
  const removeCard = (i)        => setCards(cards.filter((_, idx) => idx !== i));

  const inp = 'w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-gold-500 transition-colors bg-white';

  return (
    <div className="space-y-3">
      <input type="text" value={block.title || ''} onChange={e => onChange({ title: e.target.value })}
        placeholder="Group title (e.g. The Athlete's Plate)"
        className={inp + ' font-semibold'} />

      {cards.map((c, i) => (
        <div key={i} className="rounded border border-gray-200 p-2.5 bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Card {i + 1}
            </span>
            <button onClick={() => removeCard(i)}
              className="p-0.5 rounded text-gray-300 hover:text-red-600 hover:bg-red-50">
              <X size={11} />
            </button>
          </div>
          <input type="text" value={c.title || ''} onChange={e => updateCard(i, { title: e.target.value })}
            placeholder="Card title" className={inp + ' font-semibold mb-1.5'} />
          <input type="text" value={c.subtitle || ''} onChange={e => updateCard(i, { subtitle: e.target.value })}
            placeholder="Subtitle (optional)" className={inp + ' mb-2'} />

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Bullets</p>
          <div className="space-y-1">
            {(c.bullets || []).map((b, j) => (
              <div key={j} className="flex items-center gap-1.5">
                <input type="text" value={b} onChange={e => {
                  const nb = [...c.bullets]; nb[j] = e.target.value;
                  updateCard(i, { bullets: nb });
                }} placeholder="Bullet text" className={inp} />
                <button onClick={() => updateCard(i, { bullets: c.bullets.filter((_, k) => k !== j) })}
                  className="p-1 rounded text-gray-300 hover:text-red-600 hover:bg-red-50">
                  <X size={11} />
                </button>
              </div>
            ))}
            <button onClick={() => updateCard(i, { bullets: [...(c.bullets || []), ''] })}
              className="text-[10px] font-semibold text-gray-500 hover:text-gold-600 transition-colors">
              + Add bullet
            </button>
          </div>
        </div>
      ))}

      <button onClick={addCard}
        className="text-xs font-semibold text-gray-700 px-3 py-1.5 border border-dashed border-gray-300 rounded hover:bg-gray-50 w-full">
        + Add Card
      </button>
    </div>
  );
}
