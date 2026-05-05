import { useMemo, useState } from 'react';
import { ArrowRightCircle, Edit2, Info, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useBlockGridSession } from '../../hooks/useBlockGridSession';
import {
  buildWpIndex,
  currentWeekNumber,
  effectiveExerciseId,
  exerciseMatches,
  firstEditableWeek,
  formatTarget,
  letterFor,
  prescriptionMatches,
} from '../../utils/blockGrid';
import ExercisePicker from './programme/builder/ExercisePicker';

const NAVY = '#085777';
const GOLD = '#A58D69';

/**
 * BlockGridEditor — full-screen overlay that lets a coach edit a single
 * session as an N-weeks-by-M-exercises grid.
 *
 *   Rows    = exercises (from session_exercises, in display_order)
 *   Columns = weeks 1..duration_weeks of the parent block
 *   Cells   = exercise_week_prescriptions row (sets, reps, target, rest)
 *
 * Past weeks (< current week of the block) are read-only and visually
 * muted. Current + future weeks are editable.
 *
 * Three editing modes:
 *
 *   1. Click an exercise NAME (left column) → ExercisePicker → choose a
 *      replacement → scope dialog ("apply to which weeks?") → confirm.
 *   2. Click a CELL → prescription dialog → "Save (this week only)" or
 *      "Save and apply forward".
 *   3. (3) is just (2)'s "apply forward" path, with smart-overwrite.
 *
 * Smart-overwrite rule (CRITICAL): when propagating a change forward,
 * only overwrite a downstream week IF that week currently still matches
 * the pre-edit value. Coach's prior intentional changes are protected.
 *
 * All writes go through a single RPC (apply_session_grid_changes) so
 * either every cell in the propagation succeeds or none do — no
 * half-applied state.
 */
export default function BlockGridEditor({ block, blockSessionId, onClose, onSaved }) {
  const { loading, data, error, refresh } = useBlockGridSession(blockSessionId);

  // Dialog stack: edit (cell), pickerFor (row swap target), swap (scope
  // chooser), confirmPayload (final pre-write summary).
  const [edit, setEdit]                     = useState(null);
  const [pickerFor, setPickerFor]           = useState(null);
  const [swap, setSwap]                     = useState(null);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [busy, setBusy]                     = useState(false);
  const [toast, setToast]                   = useState(null);
  const [highlight, setHighlight]           = useState(new Set()); // recently-saved cell keys

  const N        = block?.duration_weeks || 0;
  const weeks    = useMemo(() => Array.from({ length: N }, (_, i) => i + 1), [N]);
  const currentWk = useMemo(() => currentWeekNumber(block), [block]);
  const firstEdit = useMemo(() => firstEditableWeek(block), [block]);
  const wpIndex  = useMemo(() => buildWpIndex(data?.wps || []), [data]);

  const isEditable = (wk) => wk >= firstEdit && wk <= N;

  // Re-derive A/B/C letters per superset group across the visible rows.
  const rows = useMemo(() => {
    if (!data) return [];
    const out = [];
    let li = -1;
    let lastGroup = null;
    for (const ex of data.exercises) {
      if (ex.superset_group_id && ex.superset_group_id === lastGroup) {
        // continue current group, same letter
      } else {
        li++;
        lastGroup = ex.superset_group_id || null;
      }
      out.push({ ex, letter: letterFor(li) });
    }
    return out;
  }, [data]);

  // Mobile gate — phone-portrait users get a polite "use a bigger
  // screen" notice. The grid genuinely needs the horizontal real estate.
  const isPhonePortrait = typeof window !== 'undefined' && window.innerWidth < 640;

  if (!block || !blockSessionId) return null;

  if (isPhonePortrait) {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center">
          <p className="text-sm font-semibold mb-2" style={{ color: '#1C1C1C' }}>
            Open on a larger screen to edit programmes
          </p>
          <p className="text-xs text-gray-500 mb-4">
            The block-grid editor needs more horizontal space than your phone has.
            Use a tablet or laptop.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded text-white"
            style={{ backgroundColor: NAVY }}
          >
            Close
          </button>
        </div>
      </Overlay>
    );
  }

  if (loading) {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-white rounded-xl px-5 py-3 text-xs" style={{ color: '#6b7280' }}>
          Loading session…
        </div>
      </Overlay>
    );
  }
  if (error || !data) {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-white rounded-xl px-5 py-3 text-xs text-red-600">
          Failed to load session{error ? `: ${error.message}` : '.'}
        </div>
      </Overlay>
    );
  }

  // ── RPC submitter — single transaction, atomic batch ─────────────
  const submitChanges = async (changes) => {
    setBusy(true);
    try {
      const { data: rowsAffected, error: rpcErr } = await supabase
        .rpc('apply_session_grid_changes', { changes });
      if (rpcErr) {
        console.error('[BlockGridEditor] RPC failed', rpcErr);
        setToast({ kind: 'error', msg: `Failed: ${rpcErr.message}` });
      } else {
        // Brief gold flash on edited cells for ~1s.
        const cells = new Set();
        for (const c of changes) {
          for (const w of (c.week_numbers || [])) cells.add(`${c.session_exercise_id}_${w}`);
        }
        setHighlight(cells);
        setTimeout(() => setHighlight(new Set()), 1100);

        const n = rowsAffected ?? cells.size;
        setToast({ kind: 'success', msg: `Applied to ${n} week${n === 1 ? '' : 's'}.` });
        refresh();
        onSaved && onSaved();
      }
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 2400);
    }
  };

  // Save a single cell (no propagation).
  const saveSingleCell = async (form) => {
    const changes = [{
      kind:                'prescription_update',
      session_exercise_id: edit.ex.id,
      week_numbers:        [edit.week],
      sets:                form.sets,
      reps:                form.reps,
      target_value:        form.target_value,
      rest_seconds:        form.rest_seconds,
    }];
    setEdit(null);
    await submitChanges(changes);
  };

  // Apply forward — opens confirm modal showing exactly which weeks
  // will be overwritten under the smart-overwrite rule.
  const beginPropagateForward = (form) => {
    const baseline = wpIndex.get(edit.ex.id)?.get(edit.week) || {};
    const eligible = [];
    for (let w = edit.week; w <= N; w++) {
      if (!isEditable(w)) continue;
      if (w === edit.week) { eligible.push(w); continue; }
      const cur = wpIndex.get(edit.ex.id)?.get(w);
      if (prescriptionMatches(cur, baseline)) eligible.push(w);
    }
    const exName = data.libById[effectiveExerciseId(wpIndex, edit.ex, edit.week)]?.name || '?';
    const fromWeek = edit.week;
    setEdit(null);
    setConfirmPayload({
      kind: 'prescription',
      sessionExerciseId: edit.ex.id,
      exerciseName: exName,
      fromWeek,
      weeks: eligible,
      newVals: {
        sets:         form.sets,
        reps:         form.reps,
        target_value: form.target_value,
        rest_seconds: form.rest_seconds,
      },
    });
  };

  // Click an exercise name → open the picker.
  const onRowExerciseClick = (ex) => {
    if (!isEditable(firstEdit)) return; // block already finished
    setPickerFor({ ex, fromWeek: firstEdit });
  };
  const onPickerConfirm = (libRow) => {
    const target = pickerFor;
    setPickerFor(null);
    setSwap({ ex: target.ex, fromWeek: target.fromWeek, newExercise: libRow });
  };

  // After the swap-scope dialog: build the eligible week list with
  // smart-overwrite, then open the confirm modal.
  const finaliseSwap = (scope, customRange) => {
    const { ex, fromWeek, newExercise } = swap;
    const baselineEffective = effectiveExerciseId(wpIndex, ex, fromWeek);

    let target = [];
    if (scope === 'just_current') {
      target = currentWk && currentWk >= 1 && currentWk <= N ? [currentWk] : [];
    } else if (scope === 'editable_forward') {
      for (let w = firstEdit; w <= N; w++) target.push(w);
    } else if (scope === 'range') {
      const lo = Math.max(customRange[0], firstEdit);
      const hi = Math.min(customRange[1], N);
      for (let w = lo; w <= hi; w++) target.push(w);
    }

    const eligible = target.filter(w => {
      if (w === fromWeek) return true; // the cell coach explicitly chose
      const wp = wpIndex.get(ex.id)?.get(w);
      return exerciseMatches(wp, baselineEffective, ex.exercise_id);
    });

    setSwap(null);
    setConfirmPayload({
      kind: 'swap',
      sessionExerciseId: ex.id,
      fromWeek,
      fromName: data.libById[baselineEffective]?.name || '?',
      toName:   newExercise.name,
      newExerciseId: newExercise.id,
      weeks: eligible,
    });
  };

  const applyConfirmed = async () => {
    if (!confirmPayload) return;
    let changes;
    if (confirmPayload.kind === 'prescription') {
      changes = [{
        kind:                'prescription_update',
        session_exercise_id: confirmPayload.sessionExerciseId,
        week_numbers:        confirmPayload.weeks,
        ...confirmPayload.newVals,
      }];
    } else {
      changes = [{
        kind:                  'exercise_swap',
        session_exercise_id:   confirmPayload.sessionExerciseId,
        week_numbers:          confirmPayload.weeks,
        override_exercise_id:  confirmPayload.newExerciseId,
      }];
    }
    setConfirmPayload(null);
    await submitChanges(changes);
  };

  // Compute the "skipped" weeks list for the confirm modal — weeks the
  // user might have expected to update but were dropped by the smart-
  // overwrite filter.
  const skippedWeeks = (() => {
    if (!confirmPayload) return [];
    const targetSet = new Set(confirmPayload.weeks);
    const out = [];
    const lo = confirmPayload.fromWeek || firstEdit;
    for (let w = lo; w <= N; w++) {
      if (w < firstEdit) continue;
      if (!targetSet.has(w)) out.push(w);
    }
    return out;
  })();

  // ── Render ───────────────────────────────────────────────────────
  return (
    <Overlay onClose={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(96vw, 1400px)', height: 'min(92vh, 900px)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#9ca3af' }}>
              Block-grid editor
            </p>
            <h2 className="text-base font-bold" style={{ color: '#1C1C1C' }}>
              {data.blockSession?.session_name || 'Session'}
              <span className="ml-2 text-xs font-normal" style={{ color: '#6b7280' }}>
                · {block.block_name} · {N} week{N === 1 ? '' : 's'}
                {currentWk != null && currentWk >= 1 && currentWk <= N
                  ? ` · currently Wk ${currentWk}`
                  : currentWk === 0
                    ? ' · block has not started yet'
                    : ' · block finished'}
              </span>
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" aria-label="Close">
            <X size={18} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Hint strip */}
        <div className="px-5 py-2 flex items-center gap-2 text-[11px]"
             style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
          <Info size={12} style={{ color: '#9ca3af' }} />
          <span>
            Click an <strong>exercise name</strong> to swap the row.
            Click a <strong>cell</strong> to edit one week, or apply forward across the block.
            Past weeks are read-only.
          </span>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto">
          <table
            className="text-[11px]"
            style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: '100%' }}
          >
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#fff' }}>
              <tr>
                <th
                  className="text-left px-3 py-2 font-semibold sticky left-0 z-20"
                  style={{
                    minWidth: 240, backgroundColor: '#fff',
                    borderBottom: '1px solid #e5e7eb',
                    borderRight:  '1px solid #f3f4f6',
                    color: '#6b7280',
                  }}
                >
                  Exercise
                </th>
                {weeks.map(w => {
                  const isCur  = w === currentWk;
                  const isPast = w < firstEdit;
                  return (
                    <th
                      key={w}
                      className="px-3 py-2 font-semibold whitespace-nowrap text-left"
                      style={{
                        minWidth: 150,
                        borderBottom: '1px solid #e5e7eb',
                        borderRight:  '1px solid #f3f4f6',
                        color: isCur ? GOLD : isPast ? '#9ca3af' : '#1C1C1C',
                        backgroundColor: isCur ? 'rgba(165,141,105,0.10)' : '#fff',
                        boxShadow: isCur ? `inset 0 -2px 0 ${GOLD}` : 'none',
                      }}
                    >
                      Week {w}{isCur ? ' · now' : ''}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ ex, letter }) => {
                const baseLib = data.libById[ex.exercise_id];
                return (
                  <tr key={ex.id}>
                    {/* Exercise name (sticky left) */}
                    <td
                      className="sticky left-0 px-2 py-1.5 align-top"
                      style={{
                        backgroundColor: '#fff',
                        borderBottom: '1px solid #f3f4f6',
                        borderRight:  '1px solid #f3f4f6',
                      }}
                    >
                      <button
                        onClick={() => onRowExerciseClick(ex)}
                        className="text-left w-full hover:bg-gray-50 rounded px-1.5 py-1 group"
                        title="Change exercise (whole row)"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-flex items-center justify-center text-[9px] font-bold rounded shrink-0"
                            style={{ width: 16, height: 16, backgroundColor: 'rgba(8,87,119,0.12)', color: NAVY }}
                          >
                            {letter}
                          </span>
                          <span className="font-semibold truncate" style={{ color: '#1C1C1C' }}>
                            {baseLib?.name || '(missing exercise)'}
                          </span>
                          <Edit2 size={10} className="text-gray-300 ml-auto shrink-0 opacity-0 group-hover:opacity-100" />
                        </div>
                        {ex.prescription_type && (
                          <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: '#9ca3af' }}>
                            {ex.prescription_type}
                          </div>
                        )}
                      </button>
                    </td>
                    {/* Week cells */}
                    {weeks.map(w => {
                      const wp        = wpIndex.get(ex.id)?.get(w);
                      const overrideId = wp?.override_exercise_id || null;
                      const cellLib   = overrideId ? data.libById[overrideId] : null;
                      const editable  = isEditable(w);
                      const past      = w < firstEdit;
                      const cellKey   = `${ex.id}_${w}`;
                      const flashing  = highlight.has(cellKey);

                      return (
                        <td
                          key={w}
                          className="px-1 py-1 align-top"
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            borderRight:  '1px solid #f3f4f6',
                            backgroundColor: flashing
                              ? 'rgba(165,141,105,0.20)'
                              : past ? '#fafafa' : '#fff',
                            transition: 'background-color 0.7s ease',
                          }}
                        >
                          <button
                            onClick={() => editable && setEdit({ ex, week: w })}
                            disabled={!editable}
                            className="w-full text-left rounded px-1.5 py-1 hover:bg-gray-50 disabled:cursor-default"
                            style={{ opacity: editable ? 1 : 0.7 }}
                          >
                            {overrideId && (
                              <div
                                className="text-[9px] uppercase tracking-wider font-bold mb-0.5 truncate"
                                style={{ color: GOLD }}
                                title={`Swapped to ${cellLib?.name || '?'}`}
                              >
                                ↔ {cellLib?.name || '?'}
                              </div>
                            )}
                            <div className="tabular-nums" style={{ color: past ? '#9ca3af' : '#1C1C1C' }}>
                              {wp?.sets != null && wp?.reps != null
                                ? `${wp.sets} × ${wp.reps}`
                                : <span className="italic text-gray-400">—</span>}
                            </div>
                            {wp?.target_value && (
                              <div className="text-[10px] tabular-nums" style={{ color: '#6b7280' }}>
                                {formatTarget(wp.target_value, ex.prescription_type)}
                              </div>
                            )}
                            {wp?.rest_seconds != null && (
                              <div className="text-[9px]" style={{ color: '#9ca3af' }}>
                                {wp.rest_seconds}s rest
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={N + 1} className="px-4 py-12 text-center text-xs italic text-gray-400">
                    This session has no exercises yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-2 flex items-center justify-between border-t border-gray-100 text-[11px]"
             style={{ color: '#9ca3af' }}>
          <span>
            {rows.length} exercise{rows.length === 1 ? '' : 's'} · {N} week{N === 1 ? '' : 's'}
          </span>
          <span>Edits land immediately and are atomic.</span>
        </div>
      </div>

      {/* Cell prescription edit dialog */}
      {edit && (
        <CellEditDialog
          ex={edit.ex}
          week={edit.week}
          baseline={wpIndex.get(edit.ex.id)?.get(edit.week) || {}}
          libById={data.libById}
          isLastWeek={edit.week === N}
          onCancel={() => setEdit(null)}
          onSaveSingle={saveSingleCell}
          onApplyForward={beginPropagateForward}
        />
      )}

      {/* Library picker for whole-row swap */}
      {pickerFor && (
        <ExercisePicker
          sessionLabel={`Swap "${data.libById[pickerFor.ex.exercise_id]?.name || '?'}" from Wk ${pickerFor.fromWeek}`}
          onAdd={onPickerConfirm}
          onClose={() => setPickerFor(null)}
        />
      )}

      {/* Scope chooser for swap */}
      {swap && (
        <SwapScopeDialog
          fromName={data.libById[effectiveExerciseId(wpIndex, swap.ex, swap.fromWeek)]?.name || '?'}
          toName={swap.newExercise.name}
          fromWeek={swap.fromWeek}
          firstEdit={firstEdit}
          currentWk={currentWk}
          totalWeeks={N}
          onCancel={() => setSwap(null)}
          onConfirm={finaliseSwap}
        />
      )}

      {/* Final confirm modal */}
      {confirmPayload && (
        <ConfirmModal
          payload={confirmPayload}
          skipped={skippedWeeks}
          currentWk={currentWk}
          onCancel={() => setConfirmPayload(null)}
          onConfirm={applyConfirmed}
          busy={busy}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[120]"
          style={{ backgroundColor: toast.kind === 'error' ? '#dc2626' : '#1C1C1C' }}
        >
          {toast.msg}
        </div>
      )}
    </Overlay>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

function CellEditDialog({ ex, week, baseline, libById, isLastWeek, onCancel, onSaveSingle, onApplyForward }) {
  const [sets,   setSets]   = useState(baseline.sets ?? '');
  const [reps,   setReps]   = useState(baseline.reps ?? '');
  const [target, setTarget] = useState(baseline.target_value ?? '');
  const [rest,   setRest]   = useState(baseline.rest_seconds ?? '');

  const exName = libById[baseline.override_exercise_id || ex.exercise_id]?.name || '?';

  const buildForm = () => ({
    sets:         sets   === '' ? null : Number(sets),
    reps:         reps   === '' ? null : String(reps),
    target_value: target === '' ? null : String(target),
    rest_seconds: rest   === '' ? null : Number(rest),
  });

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl w-[460px] max-w-[92vw] p-5">
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#9ca3af' }}>
          Edit prescription · Week {week}
        </p>
        <h3 className="text-sm font-bold mb-3" style={{ color: '#1C1C1C' }}>{exName}</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Sets"        value={sets}   onChange={setSets} type="number" />
          <Field label="Reps"        value={reps}   onChange={setReps} placeholder="e.g. 8 or 6-8" />
          <Field label={`Target${ex.prescription_type ? ` (${ex.prescription_type})` : ''}`}
                 value={target} onChange={setTarget} placeholder="e.g. 80 or RPE 8" />
          <Field label="Rest (sec)"  value={rest}   onChange={setRest} type="number" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="text-xs font-semibold px-3 py-1.5" style={{ color: '#6b7280' }}>
            Cancel
          </button>
          <button
            onClick={() => onSaveSingle(buildForm())}
            className="text-xs font-semibold px-3 py-1.5 rounded border"
            style={{ borderColor: '#e5e7eb', color: '#1C1C1C' }}
          >
            Save (this week only)
          </button>
          {!isLastWeek && (
            <button
              onClick={() => onApplyForward(buildForm())}
              className="text-xs font-semibold px-3 py-1.5 rounded text-white inline-flex items-center gap-1"
              style={{ backgroundColor: GOLD }}
            >
              <ArrowRightCircle size={12} /> Save and apply forward
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#6b7280' }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs px-2 py-1.5 rounded border outline-none focus:border-[#A58D69]"
        style={{ borderColor: '#e5e7eb' }}
      />
    </label>
  );
}

function SwapScopeDialog({ fromName, toName, fromWeek, firstEdit, currentWk, totalWeeks, onCancel, onConfirm }) {
  const justCurrentValid = currentWk != null && currentWk >= firstEdit && currentWk <= totalWeeks;
  const [scope, setScope] = useState('editable_forward');
  const [fromW, setFromW] = useState(Math.max(fromWeek, firstEdit));
  const [toW,   setToW]   = useState(totalWeeks);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl w-[460px] max-w-[92vw] p-5">
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#9ca3af' }}>
          Swap exercise · which weeks?
        </p>
        <h3 className="text-sm font-bold mb-3" style={{ color: '#1C1C1C' }}>
          {fromName} → {toName}
        </h3>
        <div className="space-y-2 mb-4">
          <Radio
            label={`Just the editable weeks (Week ${firstEdit}–${totalWeeks})`}
            value="editable_forward"
            current={scope}
            onChange={setScope}
          />
          <Radio
            label={`Just the current week${justCurrentValid ? ` (Week ${currentWk})` : ''}`}
            value="just_current"
            current={scope}
            onChange={setScope}
            disabled={!justCurrentValid}
          />
          <Radio label="Specific range" value="range" current={scope} onChange={setScope} />
          {scope === 'range' && (
            <div className="flex items-center gap-2 pl-6 text-xs" style={{ color: '#6b7280' }}>
              Week
              <input type="number" min={firstEdit} max={totalWeeks} value={fromW}
                     onChange={(e) => setFromW(Number(e.target.value))}
                     className="w-16 text-xs px-2 py-1 rounded border" style={{ borderColor: '#e5e7eb' }} />
              to
              <input type="number" min={firstEdit} max={totalWeeks} value={toW}
                     onChange={(e) => setToW(Number(e.target.value))}
                     className="w-16 text-xs px-2 py-1 rounded border" style={{ borderColor: '#e5e7eb' }} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="text-xs font-semibold px-3 py-1.5" style={{ color: '#6b7280' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(scope, [fromW, toW])}
            className="text-xs font-semibold px-3 py-1.5 rounded text-white"
            style={{ backgroundColor: GOLD }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function Radio({ label, value, current, onChange, disabled = false }) {
  return (
    <label className={`flex items-center gap-2 text-xs ${disabled ? 'opacity-40' : ''}`} style={{ color: '#1C1C1C' }}>
      <input
        type="radio"
        disabled={disabled}
        checked={current === value}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );
}

function ConfirmModal({ payload, skipped, currentWk, onCancel, onConfirm, busy }) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl w-[540px] max-w-[92vw] p-5 max-h-[80vh] flex flex-col">
        <h3 className="text-sm font-bold mb-3" style={{ color: '#1C1C1C' }}>Apply changes?</h3>

        <div className="overflow-y-auto flex-1 mb-4 pr-1">
          {payload.weeks.length === 0 && (
            <p className="text-xs italic" style={{ color: '#6b7280' }}>
              No weeks to update — every downstream week has been individually customised.
              Cancel and edit those weeks one by one if you want them changed.
            </p>
          )}

          {payload.kind === 'prescription' && payload.weeks.length > 0 && (
            <ul className="space-y-1.5">
              {payload.weeks.map(w => {
                const isCur = w === currentWk;
                const v = payload.newVals;
                return (
                  <li key={w} className="text-xs">
                    <span className="font-semibold" style={{ color: '#1C1C1C' }}>
                      Week {w}{isCur ? ' (current)' : ''}:
                    </span>{' '}
                    <span style={{ color: '#6b7280' }}>
                      {payload.exerciseName} · {v.sets ?? '?'} × {v.reps ?? '?'}
                      {v.target_value ? ` @ ${v.target_value}` : ''}
                      {v.rest_seconds != null ? ` · ${v.rest_seconds}s rest` : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {payload.kind === 'swap' && payload.weeks.length > 0 && (
            <ul className="space-y-1.5">
              {payload.weeks.map(w => {
                const isCur = w === currentWk;
                return (
                  <li key={w} className="text-xs">
                    <span className="font-semibold" style={{ color: '#1C1C1C' }}>
                      Week {w}{isCur ? ' (current)' : ''}:
                    </span>{' '}
                    <span style={{ color: '#6b7280' }}>
                      {payload.fromName} → {payload.toName}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {skipped.length > 0 && (
            <p className="text-[11px] italic mt-3" style={{ color: '#9ca3af' }}>
              Note: Week{skipped.length === 1 ? '' : 's'} {skipped.join(', ')} unchanged
              {' '}— already individually customised.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className="text-xs font-semibold px-3 py-1.5"
                  style={{ color: '#6b7280' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy || payload.weeks.length === 0}
            className="text-xs font-semibold px-4 py-1.5 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {busy
              ? 'Applying…'
              : payload.weeks.length === 0
                ? 'Nothing to apply'
                : `Apply to ${payload.weeks.length} week${payload.weeks.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
