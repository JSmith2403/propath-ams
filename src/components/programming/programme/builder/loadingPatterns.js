// Loading patterns — apply a progression shape across Wk2..Wk(weeks)
// based on Wk1's values. Each pattern returns a fresh week_prescriptions
// array. Wk1 is always preserved as-is (it's the coach's baseline).
//
// Numeric patterns try to parse target_value as a number; non-numeric
// targets (RPE, velocity zones, band colours) are left equal to Wk1
// for the load fields and only sets/reps adjust where applicable.

function num(s) {
  if (s == null || s === '') return null;
  const n = parseFloat(String(s).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatTargetLike(template, value) {
  // Preserve a trailing unit if the template carries one ("60kg", "70%")
  if (template == null) return String(value);
  const m = String(template).match(/^[\d.\-]+(.*)$/);
  const suffix = m ? m[1] : '';
  return `${Math.round(value * 10) / 10}${suffix}`;
}

function clone(p) { return { ...p }; }

export const LOADING_PATTERNS = [
  {
    id: 'static',
    label: 'Same every week',
    sub:   'Wk2-N follow Wk1',
    apply: (prescriptions) => {
      const wk1 = prescriptions.find(p => p.week_number === 1);
      if (!wk1) return prescriptions;
      return prescriptions.map(p => p.week_number === 1 ? p : ({
        ...p,
        sets: wk1.sets,
        reps: wk1.reps,
        target_value: wk1.target_value,
        rest_seconds: wk1.rest_seconds,
      }));
    },
  },
  {
    id: 'linear_load',
    label: 'Linear +5% load',
    sub:   'Each week +5% on target',
    apply: (prescriptions) => {
      const wk1 = prescriptions.find(p => p.week_number === 1);
      if (!wk1) return prescriptions;
      const base = num(wk1.target_value);
      return prescriptions.map(p => {
        if (p.week_number === 1) return p;
        const next = clone(p);
        next.sets = wk1.sets;
        next.reps = wk1.reps;
        next.rest_seconds = wk1.rest_seconds;
        if (base != null) {
          next.target_value = formatTargetLike(wk1.target_value, base * (1 + 0.05 * (p.week_number - 1)));
        } else {
          next.target_value = wk1.target_value;
        }
        return next;
      });
    },
  },
  {
    id: 'linear_reps',
    label: 'Linear +1 rep',
    sub:   'Reps climb each week',
    apply: (prescriptions) => {
      const wk1 = prescriptions.find(p => p.week_number === 1);
      if (!wk1) return prescriptions;
      const baseReps = num(wk1.reps);
      return prescriptions.map(p => {
        if (p.week_number === 1) return p;
        const next = clone(p);
        next.sets = wk1.sets;
        next.target_value = wk1.target_value;
        next.rest_seconds = wk1.rest_seconds;
        next.reps = baseReps != null ? String(baseReps + (p.week_number - 1)) : wk1.reps;
        return next;
      });
    },
  },
  {
    id: 'wave',
    label: 'Wave (3 + deload)',
    sub:   'Climb 3 wks, deload Wk4',
    apply: (prescriptions) => {
      const wk1 = prescriptions.find(p => p.week_number === 1);
      if (!wk1) return prescriptions;
      const base = num(wk1.target_value);
      // Pattern: Wk1 = 100%, Wk2 = +5%, Wk3 = +10%, Wk4 = -10% deload, repeats
      const pct = (n) => {
        const idx = ((n - 1) % 4); // 0..3
        return [1.00, 1.05, 1.10, 0.90][idx];
      };
      return prescriptions.map(p => {
        if (p.week_number === 1) return p;
        const next = clone(p);
        next.sets = wk1.sets;
        next.reps = wk1.reps;
        next.rest_seconds = wk1.rest_seconds;
        if (base != null) {
          next.target_value = formatTargetLike(wk1.target_value, base * pct(p.week_number));
        } else {
          next.target_value = wk1.target_value;
        }
        return next;
      });
    },
  },
  {
    id: 'step',
    label: 'Step (2 + 2)',
    sub:   '+5% every 2 weeks',
    apply: (prescriptions) => {
      const wk1 = prescriptions.find(p => p.week_number === 1);
      if (!wk1) return prescriptions;
      const base = num(wk1.target_value);
      return prescriptions.map(p => {
        if (p.week_number === 1) return p;
        const next = clone(p);
        next.sets = wk1.sets;
        next.reps = wk1.reps;
        next.rest_seconds = wk1.rest_seconds;
        if (base != null) {
          const stepIdx = Math.floor((p.week_number - 1) / 2); // 0,0,1,1,2,2…
          next.target_value = formatTargetLike(wk1.target_value, base * (1 + 0.05 * stepIdx));
        } else {
          next.target_value = wk1.target_value;
        }
        return next;
      });
    },
  },
];

/**
 * Compare a non-Wk1 cell to Wk1. Used to dim cells visually so that
 * coach can immediately tell "this week follows Wk1" from "this week
 * was set explicitly".
 */
export function isInheritedFromWk1(wp, wk1) {
  if (!wk1 || !wp || wp.week_number === 1) return false;
  const same = (a, b) => (a ?? '') === (b ?? '');
  return (
    same(wp.sets, wk1.sets) &&
    same(wp.reps, wk1.reps) &&
    same(wp.target_value, wk1.target_value) &&
    same(wp.rest_seconds, wk1.rest_seconds)
  );
}

/**
 * Per-field cascade from old Wk1 to subsequent weeks. For each field
 * (sets/reps/target_value/rest_seconds) where Wk1's value changed,
 * weeks that previously matched the OLD Wk1 value get bumped to the
 * NEW value. Weeks the coach explicitly overrode are left alone.
 */
export function cascadeWk1Edit(prescriptions, oldWk1, newWk1) {
  if (!oldWk1 || !newWk1) return prescriptions;
  const fields = ['sets', 'reps', 'target_value', 'rest_seconds'];
  return prescriptions.map(p => {
    if (p.week_number === 1) return p;
    const next = { ...p };
    for (const f of fields) {
      const oldV = oldWk1[f] ?? null;
      const newV = newWk1[f] ?? null;
      if (oldV !== newV && (next[f] ?? null) === oldV) {
        next[f] = newV;
      }
    }
    return next;
  });
}
