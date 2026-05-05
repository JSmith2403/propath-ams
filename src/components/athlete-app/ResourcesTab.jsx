import { useEffect, useMemo, useState } from 'react';
import { Apple, Brain, Flower, TrendingUp, ChevronLeft, FileText, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Visual config per category. Coach-authored content (resource_items)
// powers the actual list inside each category.
const CATEGORIES = [
  { id: 'nutrition',  label: 'Nutrition',           icon: Apple,
    gradient: 'linear-gradient(135deg, #6b3a1a 0%, #1c1c1c 100%)' },
  { id: 'psychology', label: 'Psychology',          icon: Brain,
    gradient: 'linear-gradient(135deg, #1c1c1c 0%, #2a2a2a 100%)' },
  { id: 'lifestyle',  label: 'Lifestyle',           icon: Flower,
    gradient: 'linear-gradient(135deg, #d97a3c 0%, #b8541a 60%, #5e2a0a 100%)' },
  { id: 'future',     label: 'Future Preparation',  icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #5b3a1a 0%, #2c1f10 100%)' },
];

/**
 * ResourcesTab — three-level navigation:
 *   1. Category grid (4 horizontal tiles). Empty categories render
 *      with a "Coming Soon" overlay and aren't clickable.
 *   2. Items list per category (tile grid).
 *   3. Item detail — large PDF cover image + Open PDF button + any
 *      structured content blocks the coach also added.
 */
export default function ResourcesTab() {
  const [view, setView]     = useState({ kind: 'grid' }); // grid | list:catId | item:itemId
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('resource_items')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[Resources] fetch failed', error);
        setItems([]);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const itemsByCat = useMemo(() => {
    const m = {};
    for (const it of items) {
      (m[it.category] = m[it.category] || []).push(it);
    }
    return m;
  }, [items]);

  if (view.kind === 'item') {
    const it = items.find(x => x.id === view.itemId);
    if (!it) return null;
    const cat = CATEGORIES.find(c => c.id === it.category);
    return <ItemDetail item={it} category={cat} onBack={() => setView({ kind: 'list', catId: it.category })} />;
  }

  if (view.kind === 'list') {
    const cat = CATEGORIES.find(c => c.id === view.catId);
    const list = itemsByCat[view.catId] || [];
    return <CategoryList category={cat} items={list} onBack={() => setView({ kind: 'grid' })}
      onPick={(id) => setView({ kind: 'item', itemId: id })} />;
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h1 className="text-h2 text-ink-900 font-bold leading-tight">Resources</h1>
        <p className="text-meta text-ink-500 mt-1">
          Explore tools and insights to support your journey.
        </p>
      </div>

      {/* Horizontal row of 4 category tiles. Empty categories render
          with a dark grey "Coming Soon" overlay so the surface still
          looks balanced even when only some categories have content. */}
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          const list = itemsByCat[c.id] || [];
          const empty = list.length === 0;
          return (
            <button
              key={c.id}
              onClick={() => empty ? null : setView({ kind: 'list', catId: c.id })}
              disabled={empty}
              className="relative rounded-xl overflow-hidden text-left transition-transform active:scale-[0.98] disabled:active:scale-100"
              style={{ aspectRatio: '3 / 4', background: c.gradient }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
                >
                  <Icon size={18} className="text-white" strokeWidth={1.6} />
                </div>
              </div>
              <div
                className="absolute left-0 right-0 bottom-0 px-1.5 py-2"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)',
                }}
              >
                <p className="text-[10px] font-bold text-white text-center leading-tight">
                  {c.label}
                </p>
              </div>

              {/* Coming Soon overlay — dark grey wash that signals the
                  category exists but has no content yet. */}
              {empty && (
                <div
                  className="absolute inset-0 flex items-end justify-center pb-2"
                  style={{ backgroundColor: 'rgba(28,28,28,0.78)' }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest text-white/85"
                  >
                    Coming Soon
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-meta text-ink-400 mt-6 italic">Loading…</p>
      )}
    </div>
  );
}

// ─── Items list per category ──────────────────────────────────────────────
function CategoryList({ category, items, onBack, onPick }) {
  const Icon = category?.icon;
  return (
    <div className="px-4 py-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-meta text-ink-500 hover:text-ink-800 transition-colors mb-4"
      >
        <ChevronLeft size={14} />
        Resources
      </button>

      <div
        className="rounded-xl overflow-hidden mb-4 flex items-end p-5"
        style={{ background: category?.gradient, minHeight: 140 }}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              <Icon size={22} className="text-white" strokeWidth={1.8} />
            </div>
          )}
          <p className="text-h2 text-white font-bold leading-tight">{category?.label}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map(it => (
          <button
            key={it.id}
            onClick={() => onPick(it.id)}
            className="relative rounded-xl overflow-hidden text-left transition-transform active:scale-[0.98]"
            style={{
              aspectRatio: '3 / 4',
              // Cover image fills the tile when present; falls back to
              // the category gradient otherwise.
              background: it.cover_image_url
                ? `center/cover url(${it.cover_image_url})`
                : category?.gradient,
            }}
          >
            {!it.cover_image_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
                >
                  <FileText size={20} className="text-white" strokeWidth={1.6} />
                </div>
              </div>
            )}
            <div
              className="absolute left-0 right-0 bottom-0 px-3 py-3"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 100%)',
              }}
            >
              <p className="text-meta font-bold text-white leading-tight">{it.title}</p>
              {it.summary && (
                <p className="text-[10px] text-white/75 mt-1 leading-snug line-clamp-2">{it.summary}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Item detail — cover + Open PDF + structured blocks ───────────────────
function ItemDetail({ item, category, onBack }) {
  const Icon = category?.icon;
  const blocks = Array.isArray(item.content) ? item.content : [];
  const hasFile = !!item.file_url;
  const hasCover = !!item.cover_image_url;

  return (
    <div className="px-4 py-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-meta text-ink-500 hover:text-ink-800 transition-colors mb-4"
      >
        <ChevronLeft size={14} />
        {category?.label || 'Back'}
      </button>

      <div className="mb-3">
        <p className="text-meta font-semibold uppercase tracking-widest text-ink-400 flex items-center gap-1.5">
          {Icon && <Icon size={12} />}
          {category?.label}
        </p>
        <p className="text-h2 text-ink-900 font-bold leading-tight mt-1">{item.title}</p>
        {item.summary && (
          <p className="text-meta text-ink-500 mt-2 leading-snug">{item.summary}</p>
        )}
      </div>

      {/* PDF front cover preview — sized to feel like a magazine cover.
          Falls back to a category-gradient hero card with title only. */}
      {hasCover ? (
        <div className="mb-4 rounded-xl overflow-hidden border border-ink-100 bg-ink-100">
          <img src={item.cover_image_url} alt={`${item.title} cover`}
            className="w-full h-auto block" />
        </div>
      ) : (
        <div
          className="mb-4 rounded-xl overflow-hidden p-8 flex items-center justify-center"
          style={{ background: category?.gradient, minHeight: 220 }}
        >
          <p className="text-h2 font-bold text-white text-center">{item.title}</p>
        </div>
      )}

      {hasFile && (
        <a
          href={item.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center rounded-lg py-3 mb-5 text-body font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#A58D69' }}
        >
          <span className="inline-flex items-center gap-2">
            <Download size={14} />
            Open {item.file_name || 'PDF'}
          </span>
        </a>
      )}

      {blocks.length > 0 && (
        <div className="space-y-5">
          {blocks.map((b, i) => <Block key={i} block={b} />)}
        </div>
      )}
    </div>
  );
}

// ─── Block renderer (structured content support kept for legacy items) ────
function Block({ block }) {
  if (!block || !block.type) return null;

  if (block.type === 'paragraph') {
    return <p className="text-body text-ink-700 leading-relaxed">{block.text}</p>;
  }

  if (block.type === 'heading') {
    const lvl = block.level || 2;
    const cls = lvl === 1 ? 'text-h1 text-ink-900 font-bold'
              : lvl === 2 ? 'text-h2 text-ink-900 font-bold'
              :             'text-h3 text-ink-800 font-semibold';
    return <p className={`${cls} mt-2`}>{block.text}</p>;
  }

  if (block.type === 'list') {
    const items = block.items || [];
    return (
      <ul className="list-disc pl-5 space-y-1 text-body text-ink-700">
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    );
  }

  if (block.type === 'card_group') {
    const cards = block.cards || [];
    return (
      <div>
        {block.title && (
          <h2 className="text-meta font-bold uppercase tracking-widest text-ink-500 mb-3">
            {block.title}
          </h2>
        )}
        <div className="space-y-3">
          {cards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-ink-100 shadow-card p-4">
              <p className="text-body font-bold text-ink-900 leading-tight">{c.title}</p>
              {c.subtitle && (
                <p className="text-meta font-semibold text-gold-600 mt-0.5">{c.subtitle}</p>
              )}
              {Array.isArray(c.bullets) && c.bullets.length > 0 && (
                <ul className="mt-2 space-y-1 text-body text-ink-700">
                  {c.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span
                        className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#A58D69' }}
                      />
                      <span className="leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
