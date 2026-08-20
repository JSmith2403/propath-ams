import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Filter, MoreHorizontal,
  Sun, Apple, Moon, Coffee, Leaf, GlassWater, Image as ImageIcon, Check, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useMealEntries } from '../../hooks/useMealEntries';

const GOLD = '#A58D69';

// Stable display order — meal_type → label, time hint, icon.
const MEAL_LABELS = {
  breakfast: { label: 'Breakfast', icon: Sun        },
  snack_1:   { label: 'Snack 1',   icon: Apple      },
  lunch:     { label: 'Lunch',     icon: Coffee     },
  snack_2:   { label: 'Snack 2',   icon: Leaf       },
  dinner:    { label: 'Dinner',    icon: Moon       },
  snack_3:   { label: 'Snack 3',   icon: Coffee     },
  drink:     { label: 'Drink',     icon: GlassWater },
};
const MEAL_ORDER = ['breakfast','snack_1','lunch','snack_2','dinner','snack_3','drink'];

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtIsoDate(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

/**
 * FoodDiaryView — coach-facing Food Diary surface inside the
 * Nutritional tab. Date picker + three columns: meal index, meal
 * detail, submission + history. Reads from meal_entries / meal_photos
 * / meal_events written by the athlete app's Snap-and-Send flow.
 */
export default function FoodDiaryView({ athleteId, athleteName }) {
  const [logDate, setLogDate] = useState(fmtIsoDate(new Date()));
  const { entries, loading, refresh } = useMealEntries(athleteId, logDate);
  const [selectedId, setSelectedId] = useState(null);

  // Auto-select first meal when entries arrive / date changes.
  useEffect(() => {
    if (!entries.length) { setSelectedId(null); return; }
    setSelectedId(prev => entries.some(e => e.id === prev) ? prev : entries[0].id);
  }, [entries]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const ai = MEAL_ORDER.indexOf(a.meal_type);
      const bi = MEAL_ORDER.indexOf(b.meal_type);
      return ai - bi;
    });
  }, [entries]);

  const selected = sortedEntries.find(e => e.id === selectedId) || null;

  const shiftDate = (days) => {
    const d = new Date(logDate);
    d.setDate(d.getDate() + days);
    setLogDate(fmtIsoDate(d));
  };

  return (
    <div className="space-y-3">
      {/* Sub-toolbar — date nav + filters placeholder */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded border border-gray-200 hover:bg-gray-50"
            aria-label="Previous day"
          >
            <ChevronLeft size={14} className="text-gray-500" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 text-xs">
            <Calendar size={13} className="text-gray-400" />
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded border border-gray-200 hover:bg-gray-50"
            aria-label="Next day"
          >
            <ChevronRight size={14} className="text-gray-500" />
          </button>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 text-xs text-gray-400 cursor-not-allowed"
          title="Filters — coming soon"
        >
          <Filter size={12} /> Filters
        </button>
      </div>

      {/* Three-column body */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '220px 1fr 280px' }}>
        <MealsList
          entries={sortedEntries}
          selectedId={selectedId}
          loading={loading}
          onSelect={setSelectedId}
        />
        <MealDetail
          entry={selected}
          athleteName={athleteName}
          onChanged={refresh}
        />
        <SubmissionPanel entry={selected} onChanged={refresh} />
      </div>
    </div>
  );
}

// ─── Meals column ────────────────────────────────────────────────────
function MealsList({ entries, selectedId, loading, onSelect }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="px-4 py-3 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Meals
      </div>
      {loading ? (
        <div className="px-4 py-6 text-xs italic text-gray-400 flex items-center gap-2">
          <Loader2 size={12} className="animate-spin" /> Loading…
        </div>
      ) : entries.length === 0 ? (
        <div className="px-4 py-6 text-xs italic text-gray-400">
          No meals logged for this day yet.
        </div>
      ) : (
        <ul>
          {entries.map(e => {
            const conf = MEAL_LABELS[e.meal_type] || { label: e.meal_type, icon: Apple };
            const Icon = conf.icon;
            const active = e.id === selectedId;
            return (
              <li key={e.id}>
                <button
                  onClick={() => onSelect(e.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    backgroundColor: active ? 'rgba(165,141,105,0.10)' : 'transparent',
                    borderLeft: `3px solid ${active ? GOLD : 'transparent'}`,
                  }}
                >
                  <div
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(165,141,105,0.10)', color: GOLD }}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{conf.label}</p>
                    <p className="text-[10px] text-gray-400">{fmtTime(e.submitted_at)}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Centre detail ───────────────────────────────────────────────────
function MealDetail({ entry, athleteName, onChanged }) {
  const [signedUrls, setSignedUrls] = useState({});

  // Sign every photo path each time the entry changes. URLs are valid
  // for 1 hour — plenty for an open Food Diary session.
  useEffect(() => {
    if (!entry?.photos?.length) { setSignedUrls({}); return; }
    let cancelled = false;
    (async () => {
      const paths = entry.photos.map(p => p.storage_path);
      const { data, error } = await supabase.storage
        .from('meal-photos')
        .createSignedUrls(paths, 3600);
      if (cancelled) return;
      if (error) {
        console.error('[FoodDiaryView] signed URL fetch failed', error);
        return;
      }
      const map = {};
      (data || []).forEach((r, i) => { map[paths[i]] = r.signedUrl; });
      setSignedUrls(map);
    })();
    return () => { cancelled = true; };
  }, [entry?.id, entry?.photos?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!entry) {
    return (
      <div className="rounded-xl bg-white border border-gray-100 p-6 text-xs italic text-gray-400 text-center"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        Pick a meal on the left to see its detail.
      </div>
    );
  }

  const conf = MEAL_LABELS[entry.meal_type] || { label: entry.meal_type };

  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">{conf.label}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{fmtTime(entry.submitted_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
                style={{ color: '#6b7280', backgroundColor: '#f3f4f6' }}>
            Added by athlete
          </span>
          <button className="p-1.5 rounded hover:bg-gray-50" title="More actions" disabled>
            <MoreHorizontal size={15} className="text-gray-300" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {entry.description && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">What was eaten</p>
            <p className="text-sm text-gray-800">{entry.description}</p>
          </div>
        )}

        {entry.notes && (
          <div className="rounded-lg bg-gray-50 px-3 py-3 border border-gray-100">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Notes</p>
            <p className="text-xs text-gray-700">{entry.notes}</p>
          </div>
        )}

        {entry.photos.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">
              Photos · {entry.photos.length}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {entry.photos.map(p => (
                <a
                  key={p.id}
                  href={signedUrls[p.storage_path] || '#'}
                  target="_blank" rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                  title="Open full-size"
                >
                  {signedUrls[p.storage_path]
                    ? <img src={signedUrls[p.storage_path]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={18} /></div>}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Right column — Submission info + History ───────────────────────
function SubmissionPanel({ entry, onChanged }) {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [note,    setNote]    = useState('');

  const fetchEvents = useCallback(async () => {
    if (!entry?.id) { setEvents([]); return; }
    setEventsLoading(true);
    const { data, error } = await supabase
      .from('meal_events')
      .select('id, event_type, note, created_at')
      .eq('entry_id', entry.id)
      .order('created_at', { ascending: true });
    setEventsLoading(false);
    if (error) { console.error('[SubmissionPanel] events fetch', error); return; }
    setEvents(data || []);
  }, [entry?.id]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  if (!entry) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-white border border-gray-100 p-4 text-xs italic text-gray-400"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          Select a meal to see submission details.
        </div>
      </div>
    );
  }

  const reviewed = entry.status === 'reviewed';

  const markReviewed = async () => {
    setMarking(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: upErr } = await supabase
      .from('meal_entries')
      .update({ status: 'reviewed', updated_at: new Date().toISOString() })
      .eq('id', entry.id);
    if (upErr) { console.error(upErr); setMarking(false); return; }
    await supabase.from('meal_events').insert({
      entry_id: entry.id,
      event_type: 'reviewed',
      actor_id: user?.id || null,
    });
    setMarking(false);
    onChanged?.();
    fetchEvents();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('meal_events').insert({
      entry_id: entry.id,
      event_type: 'note_added',
      note: note.trim(),
      actor_id: user?.id || null,
    });
    setAdding(false);
    setNote('');
    fetchEvents();
  };

  return (
    <div className="space-y-3">
      <Card title="Submission info">
        <Row label="Submitted on" value={fmtDate(entry.submitted_at)} />
        <Row label="Source"       value={entry.source === 'mobile_app' ? 'Mobile App' : entry.source} />
        <Row label="Status">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: reviewed ? '#16a34a' : '#A58D69' }} />
            {reviewed ? 'Reviewed' : 'Submitted'}
          </span>
        </Row>
        {!reviewed && (
          <button
            onClick={markReviewed}
            disabled={marking}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded text-white"
            style={{ backgroundColor: GOLD, opacity: marking ? 0.7 : 1 }}
          >
            {marking
              ? <><Loader2 size={11} className="animate-spin" /> Marking…</>
              : <><Check size={11} /> Mark reviewed</>}
          </button>
        )}
      </Card>

      <Card title="Nutrition snapshot">
        <p className="text-[11px] italic text-gray-400">
          Nutrient breakdown will appear here when available.
        </p>
      </Card>

      <Card title="History">
        {eventsLoading ? (
          <p className="text-[11px] italic text-gray-400">Loading…</p>
        ) : (
          <ul className="space-y-2.5">
            {events.map(ev => (
              <li key={ev.id} className="flex items-start gap-2">
                <span className="mt-1 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: eventDotColour(ev.event_type) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-gray-700">
                    {fmtDate(ev.created_at)}
                  </p>
                  <p className="text-[10px] text-gray-500">{eventLabel(ev.event_type)}</p>
                  {ev.event_type === 'note_added' && ev.note && (
                    <p className="text-[11px] text-gray-700 mt-0.5">"{ev.note}"</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add coach note */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Add a coaching note…"
            className="w-full text-[11px] px-2 py-1.5 rounded border border-gray-200 focus:outline-none focus:border-gold-400 resize-none"
          />
          <button
            onClick={addNote}
            disabled={!note.trim() || adding}
            className="mt-1.5 w-full text-[11px] font-semibold py-1.5 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {adding ? 'Saving…' : 'Add note'}
          </button>
        </div>
      </Card>
    </div>
  );
}

function eventDotColour(type) {
  switch (type) {
    case 'reviewed':   return '#f59e0b';
    case 'note_added': return '#3b82f6';
    case 'submitted':
    default:           return '#16a34a';
  }
}
function eventLabel(type) {
  switch (type) {
    case 'reviewed':   return 'Reviewed by coach';
    case 'note_added': return 'Note added';
    case 'submitted':  return 'Submitted by athlete';
    default:           return type;
  }
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Row({ label, value, children }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-[11px] text-gray-500">{label}</span>
      {children ?? <span className="text-[11px] font-semibold text-gray-700">{value || '—'}</span>}
    </div>
  );
}
