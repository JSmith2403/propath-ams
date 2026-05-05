import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, ChevronLeft, FileText, Upload, Image as ImageIcon } from 'lucide-react';
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
    id:               null,
    category:         'nutrition',
    title:            '',
    summary:          '',
    content:          [],
    cover_image_url:  null,
    file_url:         null,
    file_name:        null,
    display_order:    0,
    is_published:     true,
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
      category:         draft.category,
      title:            draft.title.trim(),
      summary:          draft.summary?.trim() || null,
      content:          draft.content || [],
      cover_image_url:  draft.cover_image_url || null,
      file_url:         draft.file_url || null,
      file_name:        draft.file_name || null,
      display_order:    draft.display_order ?? 0,
      is_published:     !!draft.is_published,
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

  // Persist a new order for one category. Optimistically updates the
  // local items state and pushes display_order updates to Supabase.
  const reorderCategory = async (catId, newOrderIds) => {
    // Optimistic local state — apply new order before the network call.
    setItems(prev => {
      const inCat = prev.filter(p => p.category === catId);
      const outCat = prev.filter(p => p.category !== catId);
      const reordered = newOrderIds.map((id, i) => {
        const found = inCat.find(p => p.id === id);
        return found ? { ...found, display_order: i } : null;
      }).filter(Boolean);
      return [...outCat, ...reordered];
    });
    // Push the new ordering to the DB. One UPDATE per row keeps it
    // simple; counts are tiny (handful per category).
    for (let i = 0; i < newOrderIds.length; i++) {
      await supabase
        .from('resource_items')
        .update({ display_order: i })
        .eq('id', newOrderIds[i]);
    }
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
          CATEGORIES.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              items={grouped[cat.id] || []}
              onTogglePublish={togglePublish}
              onEdit={setEditing}
              onRemove={remove}
              onReorder={(newOrder) => reorderCategory(cat.id, newOrder)}
            />
          ))
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

// ─── Category section — plain list (drag-and-drop is reserved for file
// upload inside the Editor, per coach feedback). Reorder via the
// Display Order field on the item.
function CategorySection({ cat, items, onTogglePublish, onEdit, onRemove }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{cat.label}</h2>
        <span className="text-xs text-gray-400">
          {items.length} item{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-gray-300 italic px-2">No resources in this category yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map(it => (
            <div key={it.id} className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center gap-3"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              {/* Cover thumbnail (or icon fallback) */}
              {it.cover_image_url ? (
                <img src={it.cover_image_url} alt=""
                  className="shrink-0 w-9 h-9 rounded-lg object-cover" />
              ) : (
                <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(165,141,105,0.14)' }}>
                  <FileText size={16} style={{ color: GOLD }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{it.title}</p>
                  {!it.is_published && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: '#92400e', backgroundColor: '#fef3c7' }}>Hidden</span>
                  )}
                  {it.file_url && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: '#437E8D', backgroundColor: 'rgba(67,126,141,0.10)' }}>PDF</span>
                  )}
                </div>
                {it.summary && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{it.summary}</p>
                )}
              </div>
              <button onClick={() => onTogglePublish(it)}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                title={it.is_published ? 'Hide from athletes' : 'Publish to athletes'}>
                {it.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => onEdit(it)}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => onRemove(it)}
                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
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

          {/* ── Files: PDF + cover image — drag-and-drop or click ──── */}
          <div className="grid grid-cols-2 gap-3">
            <FileDropZone
              label="PDF Document"
              accept="application/pdf,.pdf"
              icon={FileText}
              currentUrl={draft.file_url}
              currentName={draft.file_name}
              previewKind="pdf"
              hint="Cover auto-extracts from page 1"
              onUpload={(file) => uploadAndSet(file, 'pdf', set, draft)}
              onClear={() => set({ file_url: null, file_name: null })}
            />
            <FileDropZone
              label="Cover Image"
              accept="image/png,image/jpeg,image/webp"
              icon={ImageIcon}
              currentUrl={draft.cover_image_url}
              previewKind="image"
              onUpload={(file) => uploadAndSet(file, 'cover', set, draft)}
              onClear={() => set({ cover_image_url: null })}
            />
          </div>

          {/* Blocks */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Content blocks (optional)</p>
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

// ─── File upload helpers ──────────────────────────────────────────────────

// Render the first page of a PDF File to a PNG Blob, client-side, using
// pdfjs-dist. Returns null if anything fails — caller should treat the
// PDF upload as still successful and just leave the cover unset.
async function extractPdfFirstPagePng(file) {
  try {
    // Dynamic import keeps the (large) pdfjs bundle out of the main chunk.
    const pdfjs = await import('pdfjs-dist');
    // Vite-friendly worker URL — bundled as a static asset and served.
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const buf  = await file.arrayBuffer();
    const pdf  = await pdfjs.getDocument({ data: buf }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 }); // 2x for crisp display

    const canvas  = document.createElement('canvas');
    canvas.width  = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({
      canvas,                                // pdfjs 5.x prefers `canvas`
      canvasContext: canvas.getContext('2d'),
      viewport,
    }).promise;

    return await new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
  } catch (e) {
    console.warn('[PDF cover extract] failed:', e);
    return null;
  }
}

async function uploadAndSet(file, kind, set, draft) {
  if (!file) return;
  try {
    // PDF mime types vary across browsers / OSes; sniff by extension as
    // a fallback so a coach dropping a PDF labelled with an odd MIME
    // (e.g. application/x-pdf) still uploads cleanly.
    const ext      = (file.name.split('.').pop() || 'bin').toLowerCase();
    const isPdf    = file.type === 'application/pdf' || ext === 'pdf';
    const useType  = (kind === 'pdf' && isPdf) ? 'application/pdf' : (file.type || 'application/octet-stream');

    const safe = (draft.title || 'resource').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'resource';
    const path = `${kind}/${Date.now()}-${safe}.${ext}`;
    const { error: upErr } = await supabase
      .storage
      .from('resources')
      .upload(path, file, { contentType: useType, upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('resources').getPublicUrl(path);

    if (kind !== 'pdf') {
      set({ cover_image_url: pub.publicUrl });
      return;
    }

    // PDF path: set the file URL, then auto-extract page 1 as cover so
    // the athlete app shows the front cover without the coach uploading
    // a separate image. Manual cover upload still wins if the coach
    // chooses to override.
    set({ file_url: pub.publicUrl, file_name: file.name });

    const png = await extractPdfFirstPagePng(file);
    if (!png) return;

    const coverPath = `cover/${Date.now()}-${safe}-auto.png`;
    const { error: coverErr } = await supabase
      .storage
      .from('resources')
      .upload(coverPath, png, { contentType: 'image/png', upsert: false });
    if (coverErr) {
      console.warn('[PDF cover upload] failed:', coverErr);
      return;
    }
    const { data: coverPub } = supabase.storage.from('resources').getPublicUrl(coverPath);
    set({ cover_image_url: coverPub.publicUrl });
  } catch (e) {
    console.error('[Resources upload]', e);
    alert(`Upload failed: ${e.message || e}`);
  }
}

function FileDropZone({ label, accept, icon: Icon, currentUrl, currentName, previewKind, onUpload, onClear, hint }) {
  const [over, setOver]    = useState(false);
  const [busy, setBusy]    = useState(false);
  const inputRef = useRef(null);

  const pick = (file) => {
    if (!file) return;
    setBusy(true);
    Promise.resolve(onUpload(file)).finally(() => setBusy(false));
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) pick(f);
      }}
      className="relative bg-white rounded-lg border-2 border-dashed transition-colors p-3 flex flex-col"
      style={{
        borderColor: over ? GOLD : '#e5e7eb',
        backgroundColor: over ? 'rgba(165,141,105,0.04)' : '#fff',
        minHeight: 140,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{label}</p>

      {currentUrl ? (
        <div className="flex-1 flex flex-col">
          {previewKind === 'image' ? (
            <img src={currentUrl} alt="" className="rounded border border-gray-100 max-h-24 object-contain bg-ink-50/40" />
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-700 mb-2">
              <FileText size={14} style={{ color: GOLD }} />
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                {currentName || 'Open file'}
              </a>
            </div>
          )}
          <div className="mt-auto flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[11px] font-semibold text-gray-600 hover:text-gold-700 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] font-semibold text-gray-400 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gold-700 transition-colors"
        >
          {busy ? (
            <span className="text-xs italic text-gray-400">Uploading…</span>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(165,141,105,0.14)' }}>
                {Icon ? <Icon size={16} style={{ color: GOLD }} /> : <Upload size={16} style={{ color: GOLD }} />}
              </div>
              <p className="text-[11px] font-semibold text-center leading-tight">
                Drop file or click to upload
              </p>
              {hint && (
                <p className="text-[10px] text-gray-400 text-center leading-tight px-2">{hint}</p>
              )}
              <p className="text-[10px] text-gray-400">
                {accept.replace(/application\/|image\/|\./g, '').replace(/,/g, ' · ')}
              </p>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; pick(f); e.target.value = ''; }}
      />
    </div>
  );
}
