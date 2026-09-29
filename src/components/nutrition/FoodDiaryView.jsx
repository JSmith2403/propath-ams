import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Sun, Apple, Moon, Coffee, Leaf, GlassWater,
  Image as ImageIcon, Check, Loader2, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useMealEntriesRange, useMealLogDates } from '../../hooks/useMealEntries';
import { useWaterIntakeRange, GLASS_ML } from '../../hooks/useWaterIntake';
import { useNutritionSettings } from '../../hooks/useNutritionSettings';
import { mondayOfISO, addDaysISO, parseDate, toISO } from '../../utils/blockHelpers';

const GOLD = '#A58D69';
const TEAL = '#437E8D';

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
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}
function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function formatWeekRange(startISO, endISO) {
  const s = parseDate(startISO), e = parseDate(endISO);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const eStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric' });
  return `${sStr} – ${eStr}, ${e.getFullYear()}`;
}
function formatMonthYear(d) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/**
 * FoodDiaryView — coach-facing Food Diary surface inside the
 * Nutritional tab, modelled on the athlete's supplied mockup: a 7-day
 * week grid (day columns of meal cards + a water row), a Month view
 * whose day cells carry a small dot wherever the athlete submitted at
 * least one meal, and clicking a dotted day jumps straight into that
 * week. Reads from meal_entries / meal_photos / meal_events written by
 * the athlete app's Snap-and-Send flow, and water_intake_logs for the
 * water row.
 *
 * Per-meal/day kcal and macro totals are intentionally NOT shown —
 * nothing in the schema captures them today (meals are photo +
 * free-text only), so faking numbers would be worse than omitting
 * them. See useMealEntries.js / meal_entries for the real shape.
 */
export default function FoodDiaryView({ athleteId, athleteName }) {
  const [mode, setMode] = useState('week'); // 'week' | 'month'
  const [weekStart, setWeekStart] = useState(() => mondayOfISO(toISO(new Date())));
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [reviewEntryId, setReviewEntryId] = useState(null);

  const todayISO = toISO(new Date());

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i)),
    [weekStart],
  );
  const weekEnd = weekDates[6];

  const { entries, loading, refresh } = useMealEntriesRange(athleteId, weekStart, weekEnd);
  const { glassesByDate } = useWaterIntakeRange(athleteId, weekStart, weekEnd);
  const { settings } = useNutritionSettings(athleteId);
  const { dates: logDates } = useMealLogDates(athleteId);

  const logDatesMap = useMemo(
    () => new Map(logDates.map(d => [d.log_date, d.count])),
    [logDates],
  );

  const entriesByDate = useMemo(() => {
    const m = new Map(weekDates.map(d => [d, []]));
    entries.forEach(e => {
      if (!m.has(e.log_date)) m.set(e.log_date, []);
      m.get(e.log_date).push(e);
    });
    for (const list of m.values()) {
      list.sort((a, b) => MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type));
    }
    return m;
  }, [entries, weekDates]);

  // Batch-sign every thumbnail once per fetch instead of one signed-URL
  // call per card — a week can easily hold 15-20 meals.
  const [signedThumbs, setSignedThumbs] = useState({});
  useEffect(() => {
    const paths = [...new Set(
      entries.flatMap(e => e.photos.map(p => p.thumbnail_path || p.storage_path)),
    )];
    if (!paths.length) { setSignedThumbs({}); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.storage.from('meal-photos').createSignedUrls(paths, 3600);
      if (cancelled) return;
      if (error) { console.error('[FoodDiaryView] thumbnail sign failed', error); return; }
      const map = {};
      (data || []).forEach((r, i) => { map[paths[i]] = r.signedUrl; });
      setSignedThumbs(map);
    })();
    return () => { cancelled = true; };
  }, [entries]);

  const reviewEntry = reviewEntryId ? entries.find(e => e.id === reviewEntryId) || null : null;

  const shiftWeek  = (n) => setWeekStart(prev => addDaysISO(prev, n * 7));
  const goToday    = () => setWeekStart(mondayOfISO(todayISO));
  const jumpToDate = (iso) => { setWeekStart(mondayOfISO(iso)); setMode('week'); };

  return (
    <div className="space-y-3">
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        rangeLabel={mode === 'week' ? formatWeekRange(weekStart, weekEnd) : formatMonthYear(monthCursor)}
        onPrev={() => (mode === 'week' ? shiftWeek(-1) : setMonthCursor(m => addMonths(m, -1)))}
        onNext={() => (mode === 'week' ? shiftWeek(1)  : setMonthCursor(m => addMonths(m, 1)))}
        onToday={() => (mode === 'week' ? goToday() : setMonthCursor(new Date()))}
      />

      {mode === 'week' ? (
        <div className="overflow-x-auto">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(7, minmax(160px, 1fr))', minWidth: 960 }}
          >
            {weekDates.map(dateISO => (
              <DayColumn
                key={dateISO}
                dateISO={dateISO}
                isToday={dateISO === todayISO}
                entries={entriesByDate.get(dateISO) || []}
                glasses={glassesByDate[dateISO] || 0}
                waterTarget={settings?.water_daily_target ?? 6}
                loading={loading}
                signedThumbs={signedThumbs}
                onSelectMeal={setReviewEntryId}
              />
            ))}
          </div>
        </div>
      ) : (
        <MonthCalendar
          cursor={monthCursor}
          todayISO={todayISO}
          logDatesMap={logDatesMap}
          onSelectDate={jumpToDate}
        />
      )}

      {reviewEntry && (
        <MealReviewModal
          entry={reviewEntry}
          athleteName={athleteName}
          onClose={() => setReviewEntryId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

// ─── Toolbar — prev/next, Today, range label, Week/Month toggle ───────
function Toolbar({ mode, onModeChange, rangeLabel, onPrev, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap px-4 py-3 rounded-xl bg-white border border-gray-100">
      <div className="flex items-center gap-1">
        <button onClick={onPrev} className="p-1.5 rounded hover:bg-gray-100 transition-colors" aria-label="Previous">
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <button
          onClick={onToday}
          className="px-3 py-1 text-xs font-semibold rounded transition-colors"
          style={{ color: TEAL, border: `1px solid ${TEAL}`, backgroundColor: 'white' }}
        >
          Today
        </button>
        <button onClick={onNext} className="p-1.5 rounded hover:bg-gray-100 transition-colors" aria-label="Next">
          <ChevronRight size={16} className="text-gray-500" />
        </button>
        <span className="ml-2 text-sm font-semibold" style={{ color: '#1C1C1C' }}>{rangeLabel}</span>
      </div>

      <div className="inline-flex rounded overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        {['week', 'month'].map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className="px-3 py-1 text-xs font-semibold capitalize transition-colors"
            style={{ color: mode === m ? '#fff' : '#6b7280', backgroundColor: mode === m ? TEAL : 'white' }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Week grid — one column per day ────────────────────────────────────
function DayColumn({ dateISO, isToday, entries, glasses, waterTarget, loading, signedThumbs, onSelectMeal }) {
  const d = parseDate(dateISO);
  const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short' });

  return (
    <div
      className="rounded-xl bg-white overflow-hidden flex flex-col"
      style={{ border: `1px solid ${isToday ? TEAL : '#f3f4f6'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div
        className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between"
        style={{ backgroundColor: isToday ? 'rgba(67,126,141,0.06)' : 'transparent' }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#1C1C1C' }}>
            {dayLabel} {d.getDate()}
          </p>
          <p className="text-[10px] text-gray-400">{d.toLocaleDateString('en-GB', { month: 'short' })}</p>
        </div>
        {isToday && (
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ color: TEAL, backgroundColor: 'rgba(67,126,141,0.10)' }}
          >
            Today
          </span>
        )}
      </div>

      <div className="flex-1 p-1.5 space-y-1" style={{ minHeight: 90 }}>
        {loading ? (
          <p className="text-[10px] italic text-gray-300 px-1.5 py-2">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-[10px] italic text-gray-300 px-1.5 py-2">No meals logged</p>
        ) : (
          entries.map(e => (
            <MealCard
              key={e.id}
              entry={e}
              thumbUrl={signedThumbs[e.photos[0]?.thumbnail_path || e.photos[0]?.storage_path]}
              onClick={() => onSelectMeal(e.id)}
            />
          ))
        )}
      </div>

      <WaterRow glasses={glasses} target={waterTarget} />
    </div>
  );
}

function MealCard({ entry, thumbUrl, onClick }) {
  const conf = MEAL_LABELS[entry.meal_type] || { label: entry.meal_type, icon: Apple };
  const Icon = conf.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100"
    >
      <div
        className="shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: 'rgba(165,141,105,0.10)' }}
      >
        {thumbUrl
          ? <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
          : <Icon size={15} style={{ color: GOLD }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{conf.label}</p>
        <p className="text-[11px] font-semibold truncate" style={{ color: '#1C1C1C' }}>
          {entry.description || '—'}
        </p>
        <p className="text-[9px] text-gray-400">{fmtTime(entry.submitted_at)}</p>
      </div>
    </button>
  );
}

function WaterRow({ glasses, target }) {
  const ml = glasses * GLASS_ML;
  const targetMl = target * GLASS_ML;
  return (
    <div className="px-3 py-2 border-t border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Water</span>
        <span className="text-[9px] font-semibold text-gray-500">
          {ml.toLocaleString()} / {targetMl.toLocaleString()} ml
        </span>
      </div>
      <div className="flex items-center gap-0.5 flex-wrap">
        {Array.from({ length: target }, (_, i) => (
          <GlassWater key={i} size={11} style={{ color: i < glasses ? TEAL : '#e5e7eb' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Month view — dot per day with a submission, click to jump ────────
function buildMonthWeeks(cursor) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstMonday = mondayOfISO(toISO(first));
  const weeks = [];
  let cur = firstMonday;
  for (let w = 0; w < 6; w++) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDaysISO(cur, i)));
    cur = addDaysISO(cur, 7);
  }
  return weeks;
}

function MonthCalendar({ cursor, todayISO, logDatesMap, onSelectDate }) {
  const weeks = useMemo(() => buildMonthWeeks(cursor), [cursor]);

  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="grid grid-cols-7 border-b border-gray-100 text-center">
        {DAY_LABELS.map(d => (
          <div key={d} className="py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-b-0">
          {week.map(iso => {
            const inMonth = parseDate(iso).getMonth() === cursor.getMonth();
            const count   = logDatesMap.get(iso) || 0;
            const isToday = iso === todayISO;
            return (
              <button
                key={iso}
                onClick={() => onSelectDate(iso)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 transition-colors hover:bg-gray-50"
                style={{ opacity: inMonth ? 1 : 0.35 }}
              >
                <span className="text-xs font-semibold" style={{ color: isToday ? TEAL : '#1C1C1C' }}>
                  {parseDate(iso).getDate()}
                </span>
                <span
                  className="rounded-full"
                  style={{
                    width: 6, height: 6,
                    backgroundColor: count > 0 ? GOLD : 'transparent',
                  }}
                  title={count > 0 ? `${count} meal${count === 1 ? '' : 's'} logged` : undefined}
                />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Meal review modal — detail + submission info + history ───────────
function MealReviewModal({ entry, athleteName, onClose, onChanged }) {
  const [signedUrls, setSignedUrls] = useState({});
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [note,    setNote]    = useState('');

  useEffect(() => {
    if (!entry?.photos?.length) { setSignedUrls({}); return; }
    let cancelled = false;
    (async () => {
      const paths = entry.photos.map(p => p.storage_path);
      const { data, error } = await supabase.storage.from('meal-photos').createSignedUrls(paths, 3600);
      if (cancelled) return;
      if (error) { console.error('[MealReviewModal] signed URL fetch failed', error); return; }
      const map = {};
      (data || []).forEach((r, i) => { map[paths[i]] = r.signedUrl; });
      setSignedUrls(map);
    })();
    return () => { cancelled = true; };
  }, [entry?.id, entry?.photos?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = useCallback(async () => {
    if (!entry?.id) { setEvents([]); return; }
    setEventsLoading(true);
    const { data, error } = await supabase
      .from('meal_events')
      .select('id, event_type, note, created_at')
      .eq('entry_id', entry.id)
      .order('created_at', { ascending: true });
    setEventsLoading(false);
    if (error) { console.error('[MealReviewModal] events fetch', error); return; }
    setEvents(data || []);
  }, [entry?.id]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const conf = MEAL_LABELS[entry.meal_type] || { label: entry.meal_type };
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
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold" style={{ color: '#1C1C1C' }}>
              {conf.label}{athleteName ? ` · ${athleteName}` : ''}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(entry.submitted_at)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" aria-label="Close">
            <X size={16} />
          </button>
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
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Athlete notes</p>
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

          <div className="pt-1 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: reviewed ? '#16a34a' : GOLD }}
              />
              {reviewed ? 'Reviewed' : 'Submitted'}
            </span>
            {!reviewed && (
              <button
                onClick={markReviewed}
                disabled={marking}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded text-white"
                style={{ backgroundColor: GOLD, opacity: marking ? 0.7 : 1 }}
              >
                {marking
                  ? <><Loader2 size={11} className="animate-spin" /> Marking…</>
                  : <><Check size={11} /> Mark reviewed</>}
              </button>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">History</p>
            {eventsLoading ? (
              <p className="text-[11px] italic text-gray-400">Loading…</p>
            ) : (
              <ul className="space-y-2.5">
                {events.map(ev => (
                  <li key={ev.id} className="flex items-start gap-2">
                    <span
                      className="mt-1 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: eventDotColour(ev.event_type) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-700">{fmtDate(ev.created_at)}</p>
                      <p className="text-[10px] text-gray-500">{eventLabel(ev.event_type)}</p>
                      {ev.event_type === 'note_added' && ev.note && (
                        <p className="text-[11px] text-gray-700 mt-0.5">&ldquo;{ev.note}&rdquo;</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

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
          </div>
        </div>
      </div>
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
