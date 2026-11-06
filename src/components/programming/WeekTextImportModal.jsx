import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Undo2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useExerciseLibrary } from '../../hooks/useExerciseLibrary';
import { findBestExerciseMatch } from '../../utils/fuzzyMatchExercise';
import { parseWeekText, placeOnDates, WEEKDAY_NAMES } from '../../utils/weekProgrammeText';
import { addDaysISO, mondayOfISO } from '../../utils/blockHelpers';
import { importPlannedDays, resolveExercises, undoImportedDays } from '../../lib/importWeekProgramme';

const GOLD = '#A58D69';
const EXAMPLE = `Monday
* Hang Clean – 4 x 3
* Back Squat – 3 x 5
* Chin-up – 3 x 6-8

Wednesday
* Hang Snatch – 4 x 3
* Bench Press – 3 x 6`;

const niceDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * Add training from text: paste one day, a week with day headings (Monday, Wednesday…), or several weeks
 * with "Week 1", "Week 2" headings. Each day is placed on its date in the chosen week and created as a
 * session for this athlete. Check the preview, then add.
 */
export default function WeekTextImportModal({ athlete, defaultDateISO, onClose, onDone }) {
  const { exercises: library } = useExerciseLibrary();
  const [text, setText] = useState('');
  const [monday, setMonday] = useState(() => mondayOfISO(defaultDateISO || new Date().toLocaleDateString('en-CA')));
  const [fallback, setFallback] = useState(() => defaultDateISO || new Date().toLocaleDateString('en-CA'));
  const [dateOverride, setDateOverride] = useState({});     // index → ISO the coach moved a day to
  const [existing, setExisting] = useState({});             // ISO → sessions already planned that day
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);               // { created, failed, madeExercises }

  const parsed = useMemo(() => parseWeekText(text), [text]);
  const placed = useMemo(
    () => placeOnDates(parsed, monday, fallback).map((d, i) => ({ ...d, date: dateOverride[i] || d.date })),
    [parsed, monday, fallback, dateOverride],
  );
  const hasUndated = placed.some(d => d.weekday == null);
  const exerciseCount = placed.reduce((n, d) => n + d.exercises.length, 0);

  // Reset manual date moves when the text itself changes shape.
  useEffect(() => { setDateOverride({}); }, [parsed.weeks.length, text]);

  // Which of those dates already have a session planned?
  const datesKey = placed.map(d => d.date).join(',');
  useEffect(() => {
    if (!placed.length) { setExisting({}); return undefined; }
    let cancelled = false;
    const dates = [...new Set(placed.map(d => d.date))];
    supabase.from('planned_sessions').select('planned_date').eq('athlete_id', athlete.id).in('planned_date', dates)
      .then(({ data }) => {
        if (cancelled) return;
        const m = {};
        (data || []).forEach(r => { m[r.planned_date] = (m[r.planned_date] || 0) + 1; });
        setExisting(m);
      });
    return () => { cancelled = true; };
  }, [datesKey, athlete.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const matchOf = (name) => findBestExerciseMatch(name, library);

  const add = async () => {
    if (!placed.length || busy) return;
    setBusy(true); setError(null);
    try {
      const names = placed.flatMap(d => d.exercises.map(e => e.name));
      const resolved = await resolveExercises(names, library, findBestExerciseMatch);
      const days = placed.map(d => ({
        date: d.date, label: d.label, notes: d.notes,
        exercises: d.exercises.map(e => ({ exercise_id: resolved.get(e.name.toLowerCase()).id, sets: e.sets, reps: e.reps, note: e.note })),
      }));
      const out = await importPlannedDays({ athleteId: athlete.id, days });
      setResult({ ...out, madeExercises: [...resolved.values()].filter(r => r.created).length });
      if (out.created.length) onDone?.();
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const undo = async () => {
    setBusy(true);
    await undoImportedDays(result.created);
    setBusy(false);
    setResult(null);
    onDone?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add training from text</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              For {athlete.name}. Paste one day, a week with day headings (Monday, Wednesday…), or several weeks with “Week 1”, “Week 2” headings.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>

        {result ? (
          <div className="px-5 pb-5 overflow-y-auto">
            {result.created.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-800">
                  Added {result.created.length} session{result.created.length === 1 ? '' : 's'}: {result.created.map(c => niceDate(c.date)).join(', ')}.
                  {result.madeExercises > 0 && <span className="block text-xs text-gray-600 mt-1">{result.madeExercises} exercise{result.madeExercises === 1 ? ' was' : 's were'} new and added to your exercise library.</span>}
                </div>
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold mb-1">These days didn’t go in:</p>
                {result.failed.map(f => <p key={f.date} className="text-xs">{niceDate(f.date)}: {f.message}</p>)}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              {result.created.length > 0 && (
                <button onClick={undo} disabled={busy} className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  <Undo2 size={14} /> Undo
                </button>
              )}
              <button onClick={onClose} className="text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ backgroundColor: GOLD }}>Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 pb-3 overflow-y-auto space-y-4">
              <textarea value={text} onChange={e => setText(e.target.value)} rows={8} spellCheck={false}
                placeholder={EXAMPLE} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono leading-relaxed" />

              <div className="flex flex-wrap items-end gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600">Week starting (Monday)</span>
                  <input type="date" value={monday} onChange={e => e.target.value && setMonday(mondayOfISO(e.target.value))}
                    className="mt-1 block rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </label>
                {hasUndated && (
                  <label className="block">
                    <span className="text-xs font-semibold text-gray-600">Date for the session (no day in the text)</span>
                    <input type="date" value={fallback} onChange={e => e.target.value && setFallback(e.target.value)}
                      className="mt-1 block rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                  </label>
                )}
              </div>

              {parsed.unreadLines > 0 && (
                <p className="text-xs text-amber-700 flex items-center gap-1.5"><AlertTriangle size={13} /> {parsed.unreadLines} line{parsed.unreadLines === 1 ? '' : 's'} had no sets and reps, so {parsed.unreadLines === 1 ? 'it is' : 'they are'} kept as a note on that day.</p>
              )}

              {placed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Preview: {placed.length} session{placed.length === 1 ? '' : 's'}, {exerciseCount} exercises</p>
                  {placed.map((d, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 p-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                        <span className="text-sm font-bold text-gray-900">{d.weekday != null ? WEEKDAY_NAMES[d.weekday] : 'Session'}{d.label ? ` · ${d.label}` : ''}</span>
                        <input type="date" value={d.date} aria-label="Date for this session"
                          onChange={e => e.target.value && setDateOverride(o => ({ ...o, [i]: e.target.value }))}
                          className="rounded-md border border-gray-300 px-2 py-0.5 text-xs" />
                        <span className="text-xs text-gray-500">{niceDate(d.date)}</span>
                        {existing[d.date] > 0 && <span className="text-[11px] font-semibold text-amber-700">already has {existing[d.date]} session{existing[d.date] === 1 ? '' : 's'}: this adds another</span>}
                      </div>
                      <ul className="text-xs text-gray-700 space-y-0.5">
                        {d.exercises.map((e, j) => {
                          const m = matchOf(e.name);
                          return (
                            <li key={j} className="flex flex-wrap gap-x-2">
                              <span className="font-medium">{e.name}</span>
                              <span className="text-gray-500">{e.sets} × {e.reps}{e.note ? `, ${e.note}` : ''}</span>
                              <span className={m ? 'text-gray-400' : 'text-amber-700'}>
                                {m ? (m.score >= 0.999 ? '' : `→ ${m.exercise.name}`) : '(new exercise, will be added to the library)'}
                              </span>
                            </li>
                          );
                        })}
                        {d.notes.map((n, j) => <li key={`n${j}`} className="italic text-gray-500">Note: {n}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500">Adds to the programme as it is. Existing sessions are left alone.</p>
              <button onClick={add} disabled={busy || !placed.length || !exerciseCount}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: GOLD }}>
                {busy && <Loader2 size={14} className="animate-spin" />}
                Add {placed.length || ''} session{placed.length === 1 ? '' : 's'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
