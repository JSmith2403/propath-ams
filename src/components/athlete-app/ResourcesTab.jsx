import { useEffect, useMemo, useState } from 'react';
import { Apple, Brain, Flower, TrendingUp, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
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
 *   1. Category grid (4 tiles)
 *   2. Items list per category (cards titled by resource_item.title)
 *   3. Item detail page (renders structured content blocks)
 *
 * Content lives in public.resource_items (Supabase). RLS lets the
 * athlete app read published items via anon. Coaches author/edit
 * from the AMS-side Resources module.
 */
export default function ResourcesTab() {
  const [view, setView]     = useState({ kind: 'grid' }); // grid | list:catId | item:itemId
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all published items once. Categories with no rows simply show
  // an empty-state in the list view.
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

  // ── Item detail view ───────────────────────────────────────────────────
  if (view.kind === 'item') {
    const it = items.find(x => x.id === view.itemId);
    if (!it) return null;
    const cat = CATEGORIES.find(c => c.id === it.category);
    return <ItemDetail item={it} category={cat} onBack={() => setView({ kind: 'list', catId: it.category })} />;
  }

  // ── Category list view ─────────────────────────────────────────────────
  if (view.kind === 'list') {
    const cat = CATEGORIES.find(c => c.id === view.catId);
    const list = itemsByCat[view.catId] || [];
    return <CategoryList category={cat} items={list} onBack={() => setView({ kind: 'grid' })}
      onPick={(id) => setView({ kind: 'item', itemId: id })} />;
  }

  // ── Top-level grid ─────────────────────────────────────────────────────
  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h1 className="text-h2 text-ink-900 font-bold leading-tight">Resources</h1>
        <p className="text-meta text-ink-500 mt-1">
          Explore tools and insights to support your journey.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          const count = (itemsByCat[c.id] || []).length;
          return (
            <button
              key={c.id}
              onClick={() => setView({ kind: 'list', catId: c.id })}
              className="relative rounded-xl overflow-hidden text-left transition-transform active:scale-[0.98]"
              style={{ aspectRatio: '3 / 4', background: c.gradient }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
                >
                  <Icon size={26} className="text-white" strokeWidth={1.6} />
                </div>
              </div>
              {count > 0 && (
                <span
                  className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#1C1C1C' }}
                >
                  {count}
                </span>
              )}
              <div
                className="absolute left-0 right-0 bottom-0 px-3 py-3"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
                }}
              >
                <p className="text-meta font-bold text-white text-center">
                  {c.label}
                </p>
              </div>
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

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-100 shadow-card p-6 text-center">
          <p className="text-meta text-ink-500">
            No content here yet — your coach will add resources soon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(it => (
            <button
              key={it.id}
              onClick={() => onPick(it.id)}
              className="w-full bg-white rounded-xl border border-ink-100 shadow-card p-4 text-left transition-shadow active:shadow-raised flex items-start gap-3"
            >
              <div
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(165,141,105,0.14)' }}
              >
                <FileText size={16} style={{ color: '#A58D69' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-bold text-ink-900 leading-tight">{it.title}</p>
                {it.summary && (
                  <p className="text-meta text-ink-500 mt-1 leading-snug">{it.summary}</p>
                )}
              </div>
              <ChevronRight size={16} className="shrink-0 text-ink-300 mt-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Item detail — renders structured content blocks ──────────────────────
function ItemDetail({ item, category, onBack }) {
  const Icon = category?.icon;
  const blocks = Array.isArray(item.content) ? item.content : [];

  return (
    <div className="px-4 py-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-meta text-ink-500 hover:text-ink-800 transition-colors mb-4"
      >
        <ChevronLeft size={14} />
        {category?.label || 'Back'}
      </button>

      {/* Hero */}
      <div
        className="rounded-xl overflow-hidden mb-5 p-5"
        style={{ background: category?.gradient, minHeight: 160 }}
      >
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              <Icon size={18} className="text-white" strokeWidth={1.8} />
            </div>
          )}
          <p className="text-meta font-semibold uppercase tracking-widest text-white/75">
            {category?.label}
          </p>
        </div>
        <p className="text-h2 text-white font-bold leading-tight">{item.title}</p>
        {item.summary && (
          <p className="text-meta text-white/80 mt-2 leading-snug">{item.summary}</p>
        )}
      </div>

      <div className="space-y-5">
        {blocks.map((b, i) => <Block key={i} block={b} />)}
      </div>
    </div>
  );
}

// ─── Block renderer ───────────────────────────────────────────────────────
function Block({ block }) {
  if (!block || !block.type) return null;

  if (block.type === 'paragraph') {
    return (
      <p className="text-body text-ink-700 leading-relaxed">{block.text}</p>
    );
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

  // Unknown block type — soft fallback so authoring mistakes don't crash
  return null;
}
