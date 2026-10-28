import { useEffect, useMemo, useRef, useState } from 'react';
import { Apple, Brain, Flower, TrendingUp, ChevronLeft, ChevronRight, FileText, Download, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { buildGroups, snippetParts } from '../../utils/resourceSearch';

// Visual config per category, in the ProPath palette (gold / teal / deep teal / amber over dark).
// Coach-authored content (resource_items) powers the list inside each category.
const CATEGORIES = [
  { id: 'nutrition',  label: 'Nutrition',          icon: Apple,
    blurb: 'Fuel, hydration and eating around training',
    gradient: 'linear-gradient(120deg, #C9982E 0%, #7a5a1c 55%, #241b0c 100%)' },
  { id: 'psychology', label: 'Psychology',         icon: Brain,
    blurb: 'Mindset, confidence and handling pressure',
    gradient: 'linear-gradient(120deg, #085777 0%, #0a3a4f 55%, #0b1d27 100%)' },
  { id: 'lifestyle',  label: 'Lifestyle',          icon: Flower,
    blurb: 'Sleep, recovery and life around sport',
    gradient: 'linear-gradient(120deg, #437E8D 0%, #2b5560 55%, #13262c 100%)' },
  { id: 'future',     label: 'Future Preparation', icon: TrendingUp,
    blurb: 'Pathways, planning and what comes next',
    gradient: 'linear-gradient(120deg, #A58D69 0%, #6b5a40 55%, #231e16 100%)' },
];
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Everything the athlete screens need — search_text (the full PDF text) stays on the server.
const COLUMNS = 'id,category,title,summary,content,display_order,created_at,cover_image_url,file_url,file_name,tags';

const open = (item) => window.open(item.file_url, '_blank', 'noopener,noreferrer');

/**
 * ResourcesTab — its own tab.
 *   Home      search bar · four category cards (with counts) · "New" row
 *   Category  tag chips (filter) · list of guides
 *   Search    results across every category, with a snippet of the matching text
 * Tapping a guide opens its file; guides authored without a file open the structured-content page.
 */
export default function ResourcesTab() {
  const [view, setView]       = useState({ kind: 'home' });          // home | category:catId | item:itemId
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');
  const [tag, setTag]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('resource_items')
        .select(COLUMNS)
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      if (cancelled) return;
      if (error) { console.error('[Resources] fetch failed', error); setItems([]); }
      else setItems(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const byId = useMemo(() => Object.fromEntries(items.map(i => [i.id, i])), [items]);
  const itemsByCat = useMemo(() => {
    const m = {};
    for (const it of items) (m[it.category] = m[it.category] || []).push(it);
    return m;
  }, [items]);
  const newest = useMemo(
    () => [...items].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 4),
    [items],
  );

  const pick = (item) => {
    if (item.file_url) { open(item); return; }
    setView({ kind: 'item', itemId: item.id, from: view });
  };

  if (view.kind === 'item') {
    const it = byId[view.itemId];
    if (!it) return null;
    return <ItemDetail item={it} category={CAT_BY_ID[it.category]} onBack={() => setView(view.from || { kind: 'home' })} />;
  }

  if (view.kind === 'category') {
    const cat = CAT_BY_ID[view.catId];
    return (
      <CategoryPage
        category={cat}
        items={itemsByCat[view.catId] || []}
        tag={tag}
        onTag={setTag}
        onBack={() => { setTag(null); setView({ kind: 'home' }); }}
        onPick={pick}
      />
    );
  }

  const searching = query.trim().length > 0;
  return (
    <div className="px-4 py-4">
      <div className="mb-3">
        <h1 className="text-h2 text-ink-900 font-bold leading-tight">Resources</h1>
        <p className="text-meta text-ink-500 mt-1">Guides from your coaching team.</p>
      </div>

      <SearchBar value={query} onChange={setQuery} />

      {searching ? (
        <SearchResults query={query} byId={byId} onPick={pick} />
      ) : (
        <>
          <div className="space-y-3 mt-4">
            {CATEGORIES.map(c => (
              <CategoryCard
                key={c.id}
                category={c}
                count={(itemsByCat[c.id] || []).length}
                onOpen={() => { setTag(null); setView({ kind: 'category', catId: c.id }); }}
              />
            ))}
          </div>

          {newest.length > 0 && (
            <div className="mt-6">
              <p className="text-micro font-bold uppercase tracking-widest text-ink-400 mb-2">Recently added</p>
              <div className="rounded-xl bg-white border border-ink-100 divide-y divide-ink-100 overflow-hidden">
                {newest.map(it => <ResourceRow key={it.id} item={it} showCategory onPick={pick} />)}
              </div>
            </div>
          )}
          {loading && <p className="text-center text-meta text-ink-400 mt-6 italic">Loading…</p>}
        </>
      )}
    </div>
  );
}

// ─── Search ───────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
      {/* text-base (16px): anything smaller makes iPhones zoom the page when the box is tapped */}
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search e.g. pre-game snacks"
        enterKeyHint="search"
        autoComplete="off"
        className="w-full rounded-xl bg-white border border-ink-200 pl-10 pr-10 py-3 text-base text-ink-900 placeholder:text-ink-400 outline-none focus:border-[#A58D69]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-ink-400 hover:text-ink-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function SearchResults({ query, byId, onPick }) {
  const [state, setState] = useState({ status: 'idle', hits: [] });
  const seq = useRef(0);

  useEffect(() => {
    const groups = buildGroups(query);
    if (groups.length === 0) { setState({ status: 'idle', hits: [] }); return undefined; }
    const mine = ++seq.current;
    setState(s => ({ ...s, status: 'loading' }));
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_resources', { p_groups: groups });
      if (mine !== seq.current) return;                       // a newer search has started
      if (error) { console.error('[Resources] search failed', error); setState({ status: 'error', hits: [] }); return; }
      setState({ status: 'done', hits: data || [] });
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const hits = state.hits.filter(h => byId[h.id]);
  const exact = hits.filter(h => h.all_ideas);
  const partial = hits.filter(h => !h.all_ideas);

  if (state.status === 'error') {
    return <p className="text-meta text-ink-500 mt-6 text-center">Search isn’t working right now — try again in a moment.</p>;
  }
  if (state.status === 'idle') return null;
  if (state.status === 'done' && hits.length === 0) {
    return (
      <div className="text-center mt-8 px-6">
        <p className="text-body font-semibold text-ink-800">Nothing found for “{query.trim()}”</p>
        <p className="text-meta text-ink-500 mt-1">Try a simpler word, or browse a category. If you’re after something we don’t have yet, message your coach.</p>
      </div>
    );
  }

  const group = (label, list) => list.length > 0 && (
    <div className="mt-4">
      {label && <p className="text-micro font-bold uppercase tracking-widest text-ink-400 mb-2">{label}</p>}
      <div className="rounded-xl bg-white border border-ink-100 divide-y divide-ink-100 overflow-hidden">
        {list.map(h => <ResourceRow key={h.id} item={byId[h.id]} snippet={h.snippet} showCategory onPick={onPick} />)}
      </div>
    </div>
  );

  return (
    <div className={state.status === 'loading' ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      {group(null, exact)}
      {group(exact.length ? 'Related' : 'Closest matches', partial)}
    </div>
  );
}

// ─── Home: one wide card per category ─────────────────────────────────────
function CategoryCard({ category, count, onOpen }) {
  const Icon = category.icon;
  const empty = count === 0;
  return (
    <button
      onClick={empty ? undefined : onOpen}
      disabled={empty}
      className="relative w-full rounded-2xl overflow-hidden text-left transition-transform active:scale-[0.99] disabled:active:scale-100"
      style={{ background: category.gradient, minHeight: 118 }}
    >
      <Icon
        size={96} strokeWidth={1}
        className="absolute -right-3 -bottom-4 text-white pointer-events-none"
        style={{ opacity: 0.12 }}
      />
      {empty && <span className="absolute inset-0" style={{ backgroundColor: 'rgba(28,28,28,0.55)' }} />}
      <div className="relative z-10 flex items-end justify-between gap-3 p-4 h-full" style={{ minHeight: 118 }}>
        <div className="min-w-0">
          <p className="text-[17px] font-extrabold uppercase tracking-wide text-white leading-tight">{category.label}</p>
          <p className="text-[11px] text-white/75 mt-1 leading-snug">{category.blurb}</p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-white rounded-full px-2.5 py-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
          {empty ? 'Coming soon' : <>{count} guide{count === 1 ? '' : 's'} <ChevronRight size={12} /></>}
        </span>
      </div>
    </button>
  );
}

// ─── Category page: tag chips + a scrollable list that stays tidy as it grows ──
function CategoryPage({ category, items, tag, onTag, onBack, onPick }) {
  const Icon = category.icon;
  const tags = useMemo(() => {
    const counts = new Map();
    for (const it of items) for (const t of it.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [items]);
  const shown = tag ? items.filter(it => (it.tags || []).includes(tag)) : items;

  return (
    <div className="px-4 py-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-meta text-ink-500 hover:text-ink-800 transition-colors mb-3">
        <ChevronLeft size={14} /> Resources
      </button>

      <div className="relative rounded-2xl overflow-hidden mb-4 p-5 flex items-end" style={{ background: category.gradient, minHeight: 112 }}>
        <Icon size={92} strokeWidth={1} className="absolute -right-3 -bottom-4 text-white pointer-events-none" style={{ opacity: 0.12 }} />
        <div className="relative">
          <p className="text-[20px] font-extrabold uppercase tracking-wide text-white leading-tight">{category.label}</p>
          <p className="text-[11px] text-white/75 mt-1">{items.length} guide{items.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-3 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <Chip active={!tag} onClick={() => onTag(null)}>All</Chip>
          {tags.map(t => <Chip key={t} active={tag === t} onClick={() => onTag(tag === t ? null : t)}>{t}</Chip>)}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-meta text-ink-500 text-center mt-8">Nothing here yet.</p>
      ) : (
        <div className="rounded-xl bg-white border border-ink-100 divide-y divide-ink-100 overflow-hidden">
          {shown.map(it => <ResourceRow key={it.id} item={it} onPick={onPick} />)}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize border transition-colors"
      style={active
        ? { backgroundColor: '#A58D69', borderColor: '#A58D69', color: '#fff' }
        : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#4b5563' }}
    >
      {children}
    </button>
  );
}

// ─── One guide: thumbnail · title · summary/snippet · tags ────────────────
function ResourceRow({ item, snippet, showCategory, onPick }) {
  const cat = CAT_BY_ID[item.category];
  const parts = snippetParts(snippet);
  const hasMatchText = parts.some(p => p.hit);
  return (
    <button onClick={() => onPick(item)} className="w-full flex items-center gap-3 p-3 text-left active:bg-ink-50 transition-colors">
      <div
        className="shrink-0 w-12 h-16 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ background: item.cover_image_url ? `center/cover url(${item.cover_image_url})` : (cat?.gradient || '#437E8D') }}
      >
        {!item.cover_image_url && <FileText size={18} className="text-white" strokeWidth={1.6} />}
      </div>
      <div className="min-w-0 flex-1">
        {showCategory && cat && (
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#A58D69' }}>{cat.label}</p>
        )}
        <p className="text-body font-semibold text-ink-900 leading-tight">{item.title}</p>
        {hasMatchText ? (
          <p className="text-[12px] text-ink-500 mt-1 leading-snug line-clamp-2">
            …{parts.map((p, i) => p.hit
              ? <mark key={i} className="rounded px-0.5 font-semibold text-ink-900" style={{ backgroundColor: 'rgba(201,152,46,0.28)' }}>{p.text}</mark>
              : <span key={i}>{p.text}</span>)}…
          </p>
        ) : item.summary ? (
          <p className="text-[12px] text-ink-500 mt-1 leading-snug line-clamp-2">{item.summary}</p>
        ) : null}
      </div>
      <ChevronRight size={16} className="shrink-0 text-ink-300" />
    </button>
  );
}

// ─── Item detail — cover + Open PDF + structured blocks (for guides written without a file) ──
function ItemDetail({ item, category, onBack }) {
  const Icon = category?.icon;
  const blocks = Array.isArray(item.content) ? item.content : [];
  const hasFile = !!item.file_url;
  const hasCover = !!item.cover_image_url;

  return (
    <div className="px-4 py-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-meta text-ink-500 hover:text-ink-800 transition-colors mb-4">
        <ChevronLeft size={14} /> Back
      </button>

      <div className="mb-3">
        <p className="text-meta font-semibold uppercase tracking-widest text-ink-400 flex items-center gap-1.5">
          {Icon && <Icon size={12} />}
          {category?.label}
        </p>
        <p className="text-h2 text-ink-900 font-bold leading-tight mt-1">{item.title}</p>
        {item.summary && <p className="text-meta text-ink-500 mt-2 leading-snug">{item.summary}</p>}
      </div>

      {hasCover ? (
        <div className="mb-4 rounded-xl overflow-hidden border border-ink-100 bg-ink-100">
          <img src={item.cover_image_url} alt={`${item.title} cover`} className="w-full h-auto block" />
        </div>
      ) : (
        <div className="mb-4 rounded-xl overflow-hidden p-8 flex items-center justify-center" style={{ background: category?.gradient, minHeight: 220 }}>
          <p className="text-h2 font-bold text-white text-center">{item.title}</p>
        </div>
      )}

      {hasFile && (
        <a
          href={item.file_url} target="_blank" rel="noopener noreferrer"
          className="block w-full text-center rounded-lg py-3 mb-5 text-body font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#A58D69' }}
        >
          <span className="inline-flex items-center gap-2"><Download size={14} /> Open {item.file_name || 'PDF'}</span>
        </a>
      )}

      {blocks.length > 0 && <div className="space-y-5">{blocks.map((b, i) => <Block key={i} block={b} />)}</div>}
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
        {block.title && <h2 className="text-meta font-bold uppercase tracking-widest text-ink-500 mb-3">{block.title}</h2>}
        <div className="space-y-3">
          {cards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-ink-100 shadow-card p-4">
              <p className="text-body font-bold text-ink-900 leading-tight">{c.title}</p>
              {c.subtitle && <p className="text-meta font-semibold text-gold-600 mt-0.5">{c.subtitle}</p>}
              {Array.isArray(c.bullets) && c.bullets.length > 0 && (
                <ul className="mt-2 space-y-1 text-body text-ink-700">
                  {c.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#A58D69' }} />
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
