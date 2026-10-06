import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Copy, Send, Trash2, Pencil, Loader2, UserRound, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  COHORT_OPTIONS, fmtRange, addDaysISO, mondayOf, slotAppliesTo, dayLabel,
} from '../../utils/timetable';

const GOLD = '#A58D69';
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLS = 'id, slot_date, start_time, end_time, title, kind, cohorts, location, notes, published_at';

/** Friday–Sunday you're normally setting NEXT week's timetable. */
function defaultWeek() {
  const dow = new Date().getDay();            // 0 Sun … 6 Sat
  const thisMonday = mondayOf();
  return (dow === 0 || dow === 5 || dow === 6) ? addDaysISO(thisMonday, 7) : thisMonday;
}

const blankForm = (date) => ({
  slot_date: date, start_time: '16:00', end_time: '17:00',
  kind: 'session', title: 'Group session', cohorts: [], location: '', notes: '',
});

function SlotForm({ weekStart, initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleCohort = (c) => set('cohorts', form.cohorts.includes(c) ? form.cohorts.filter(x => x !== c) : [...form.cohorts, c]);
  const valid = form.start_time && form.end_time && form.end_time > form.start_time && form.title.trim();
  const cls = 'text-sm rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 focus:outline-none focus:border-[#A58D69]';

  return (
    <div className="rounded-xl border p-3 bg-white space-y-2.5" style={{ borderColor: GOLD }}>
      <div className="flex flex-wrap gap-2">
        <select value={form.slot_date} onChange={(e) => set('slot_date', e.target.value)} className={cls} aria-label="Day">
          {DAY_NAMES.map((n, i) => {
            const d = addDaysISO(weekStart, i);
            return <option key={d} value={d}>{n} {new Date(`${d}T12:00:00`).getDate()}</option>;
          })}
        </select>
        <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className={cls} aria-label="Start" />
        <span className="self-center text-gray-400 text-sm">to</span>
        <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} className={cls} aria-label="End" />
        <select
          value={form.kind}
          onChange={(e) => {
            const kind = e.target.value;
            setForm(f => ({
              ...f, kind,
              title: ['Group session', '1:1 session', ''].includes(f.title) ? (kind === 'one_to_one' ? '1:1 session' : 'Group session') : f.title,
            }));
          }}
          className={cls} aria-label="Type"
        >
          <option value="session">Group session</option>
          <option value="one_to_one">1:1</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Title" className={`${cls} flex-1 min-w-[140px]`} />
        <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Location (optional)" className={`${cls} flex-1 min-w-[140px]`} />
      </div>
      <input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Note for athletes (optional)" className={`${cls} w-full`} />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Who:</span>
        {COHORT_OPTIONS.map(c => (
          <button
            key={c} type="button" onClick={() => toggleCohort(c)}
            className="text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors"
            style={form.cohorts.includes(c)
              ? { backgroundColor: GOLD, borderColor: GOLD, color: '#fff' }
              : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
          >
            {c}
          </button>
        ))}
        <span className="text-[11px] text-gray-400">{form.cohorts.length ? '' : 'Nothing selected = everyone'}</span>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)} disabled={!valid || saving}
          className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: GOLD }}
        >
          {saving ? 'Saving…' : 'Save session'}
        </button>
        <button onClick={onCancel} className="text-sm text-gray-500 px-3 py-1.5">Cancel</button>
      </div>
    </div>
  );
}

/**
 * Timetable — coaches build the academy's weekly timetable (usually on a
 * Friday), publish it, and see who's attending each slot. Athletes get a push
 * on publish, a pop-up on Sunday afternoon (UAE) and a reminder to anyone who
 * hasn't answered. 1:1 slots are a placeholder: athletes say what time they
 * intend to take it and a message goes to the coaches (caps by package TBD).
 */
export default function TimetableView({ athletes = [] }) {
  const [weekStart, setWeekStart] = useState(defaultWeek);
  const [slots, setSlots] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(null);       // date string being added to
  const [editing, setEditing] = useState(null);     // slot id
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState(null);

  const weekEnd = addDaysISO(weekStart, 6);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('timetable_slots').select(COLS)
      .gte('slot_date', weekStart).lte('slot_date', weekEnd)
      .order('slot_date').order('start_time');
    if (err) { setError(err.message); setLoading(false); return; }
    setError(null);
    setSlots(data || []);
    if (data?.length) {
      const { data: rs } = await supabase
        .from('timetable_responses').select('slot_id, athlete_id, status, note')
        .in('slot_id', data.map(s => s.id));
      setResponses(rs || []);
    } else {
      setResponses([]);
    }
    setLoading(false);
  }, [weekStart, weekEnd]);

  useEffect(() => {
    setLoading(true); setNotice(null); setAdding(null); setEditing(null);
    load();
  }, [load]);

  // Responses trickle in while the page is open.
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const nameById = useMemo(() => new Map(athletes.map(a => [a.id, a.name])), [athletes]);
  const byDay = useMemo(
    () => DAY_NAMES.map((n, i) => {
      const date = addDaysISO(weekStart, i);
      return { name: n, date, items: slots.filter(s => s.slot_date === date) };
    }),
    [slots, weekStart]
  );
  const unpublished = slots.filter(s => !s.published_at).length;

  const payload = (f) => ({
    slot_date: f.slot_date, start_time: f.start_time, end_time: f.end_time,
    title: f.title.trim(), kind: f.kind, cohorts: f.cohorts,
    location: f.location.trim() || null, notes: f.notes.trim() || null,
  });

  const saveSlot = async (form, id) => {
    setSaving(true); setError(null);
    const q = id
      ? supabase.from('timetable_slots').update(payload(form)).eq('id', id)
      : supabase.from('timetable_slots').insert(payload(form));
    const { error: err } = await q;
    setSaving(false);
    if (err) { setError(err.message); return; }
    setAdding(null); setEditing(null);
    await load();
  };

  const deleteSlot = async (id) => {
    setConfirmDelete(null);
    const { error: err } = await supabase.from('timetable_slots').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    await load();
  };

  const copyPrevious = async () => {
    setError(null); setNotice(null);
    const { data, error: err } = await supabase
      .from('timetable_slots').select(COLS)
      .gte('slot_date', addDaysISO(weekStart, -7)).lte('slot_date', addDaysISO(weekStart, -1));
    if (err) { setError(err.message); return; }
    if (!data?.length) { setNotice('Last week has no timetable to copy.'); return; }
    const rows = data.map(s => ({
      slot_date: addDaysISO(s.slot_date, 7), start_time: s.start_time, end_time: s.end_time,
      title: s.title, kind: s.kind, cohorts: s.cohorts, location: s.location, notes: s.notes,
    }));
    const { error: insErr } = await supabase.from('timetable_slots').insert(rows);
    if (insErr) { setError(insErr.message); return; }
    setNotice(`Copied ${rows.length} session${rows.length === 1 ? '' : 's'} from last week (as a draft — edit, then publish).`);
    await load();
  };

  const publish = async () => {
    setPublishing(true); setError(null); setNotice(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/push/timetable-publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ week_start: weekStart }),
      });
      const json = await res.json().catch(() => ({ ok: false, error: `Server error (${res.status}).` }));
      if (!json.ok) throw new Error(json.error || 'Couldn\'t publish.');
      setNotice(
        `Published ${json.published} session${json.published === 1 ? '' : 's'}`
        + (json.pushConfigured === false ? ' — notifications aren\'t configured, so athletes will see it next time they open the app.'
          : `. Notified ${json.notified} athlete${json.notified === 1 ? '' : 's'}.`)
      );
      await load();
    } catch (err) {
      setError(err.message);
    }
    setPublishing(false);
  };

  const toggleExpanded = (id) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderSlot = (s) => {
    if (editing === s.id) {
      return (
        <SlotForm
          key={s.id} weekStart={weekStart} saving={saving}
          initial={{
            slot_date: s.slot_date, start_time: s.start_time.slice(0, 5), end_time: s.end_time.slice(0, 5),
            kind: s.kind, title: s.title, cohorts: s.cohorts || [], location: s.location || '', notes: s.notes || '',
          }}
          onSave={(f) => saveSlot(f, s.id)} onCancel={() => setEditing(null)}
        />
      );
    }
    const eligible = athletes.filter(a => slotAppliesTo(s, a.cohort));
    const mine = responses.filter(r => r.slot_id === s.id);
    const attending = mine.filter(r => r.status === 'attending');
    const declined = mine.filter(r => r.status === 'not_attending');
    const answeredIds = new Set(mine.map(r => r.athlete_id));
    const waiting = eligible.filter(a => !answeredIds.has(a.id));
    const open = expanded.has(s.id);
    const oneToOne = s.kind === 'one_to_one';

    return (
      <div key={s.id} className="rounded-xl border border-gray-100 bg-white">
        <div className="flex items-start gap-3 px-3.5 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{fmtRange(s.start_time, s.end_time)}</span>
              <span className="text-sm text-gray-700 inline-flex items-center gap-1">
                {oneToOne && <UserRound size={12} />}{s.title}
              </span>
              {s.location && <span className="text-xs text-gray-400">· {s.location}</span>}
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={s.published_at ? { backgroundColor: '#dcfce7', color: '#166534' } : { backgroundColor: '#fef3c7', color: '#92400e' }}
              >
                {s.published_at ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {s.cohorts?.length ? s.cohorts.join(' · ') : 'Everyone'}
              {s.notes ? ` — ${s.notes}` : ''}
            </p>
            {s.published_at && (
              <button onClick={() => toggleExpanded(s.id)} className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900">
                <span className="font-semibold text-green-700">{attending.length} {oneToOne ? 'taking it' : 'attending'}</span>
                <span className="text-gray-300">·</span>
                <span className="font-semibold text-red-600">{declined.length} {oneToOne ? 'not this week' : 'can\'t make it'}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{waiting.length} no response</span>
                {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {confirmDelete === s.id ? (
              <>
                <button onClick={() => deleteSlot(s.id)} className="text-xs font-semibold px-2 py-1 rounded text-white bg-red-500">Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 px-1.5"><X size={12} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(s.id)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50" aria-label="Edit"><Pencil size={13} /></button>
                <button onClick={() => setConfirmDelete(s.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-gray-50" aria-label="Delete"><Trash2 size={13} /></button>
              </>
            )}
          </div>
        </div>

        {open && (
          <div className="border-t border-gray-100 px-3.5 py-3 grid gap-3 sm:grid-cols-3 text-xs">
            <div>
              <p className="font-semibold text-green-700 mb-1">{oneToOne ? 'Taking it' : 'Attending'} ({attending.length})</p>
              {attending.map(r => (
                <p key={r.athlete_id} className="text-gray-700">
                  {nameById.get(r.athlete_id) || r.athlete_id}
                  {r.note && <span className="text-gray-400"> — {r.note}</span>}
                </p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-red-600 mb-1">{oneToOne ? 'Not this week' : 'Can\'t make it'} ({declined.length})</p>
              {declined.map(r => (
                <p key={r.athlete_id} className="text-gray-700">
                  {nameById.get(r.athlete_id) || r.athlete_id}
                  {r.note && <span className="text-gray-400"> — {r.note}</span>}
                </p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-gray-500 mb-1">No response ({waiting.length})</p>
              {waiting.map(a => <p key={a.id} className="text-gray-500">{a.name}</p>)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f4f5f7' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Timetable</h1>
            <p className="text-xs text-gray-500 mt-0.5 max-w-md">
              Build the week, publish it, and athletes confirm Attending / Can&rsquo;t make it for each session.
              They&rsquo;re notified when you publish and get a pop-up on Sunday afternoon.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setWeekStart(addDaysISO(weekStart, -7))} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50" aria-label="Previous week"><ChevronLeft size={14} /></button>
            <div className="text-center px-2 min-w-[150px]">
              <p className="text-sm font-semibold text-gray-900">Week of {dayLabel(weekStart).replace(/^\w+ /, '')}</p>
              <p className="text-[11px] text-gray-400">{weekStart === mondayOf() ? 'This week' : weekStart === addDaysISO(mondayOf(), 7) ? 'Next week' : ''}</p>
            </div>
            <button onClick={() => setWeekStart(addDaysISO(weekStart, 7))} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50" aria-label="Next week"><ChevronRight size={14} /></button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={publish}
            disabled={publishing || unpublished === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {unpublished ? `Publish ${unpublished} draft${unpublished === 1 ? '' : 's'} & notify athletes` : 'Everything is published'}
          </button>
          <button
            onClick={copyPrevious}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          >
            <Copy size={14} /> Copy last week
          </button>
        </div>

        {notice && <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-sm text-green-800">{notice}</div>}
        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error} {/timetable_slots|relation/.test(error) && '(Has sql/timetable_2026-10-08.sql been run?)'}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : (
          <div className="space-y-5">
            {byDay.map(day => (
              <div key={day.date}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    {day.name} {new Date(`${day.date}T12:00:00`).getDate()}
                  </p>
                  {adding !== day.date && (
                    <button
                      onClick={() => { setAdding(day.date); setEditing(null); }}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
                    >
                      <Plus size={12} /> Add session
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {day.items.map(renderSlot)}
                  {adding === day.date && (
                    <SlotForm
                      weekStart={weekStart} saving={saving} initial={blankForm(day.date)}
                      onSave={(f) => saveSlot(f)} onCancel={() => setAdding(null)}
                    />
                  )}
                  {!day.items.length && adding !== day.date && (
                    <p className="text-xs text-gray-300 italic px-1">Nothing scheduled</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
