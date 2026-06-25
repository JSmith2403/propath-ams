#!/usr/bin/env node
/**
 * Seed: Sara Ali — Rolling Strength · 6 weeks.
 *
 *   PGPASSWORD=… node backups/.tools/seed-sara-rolling-strength.mjs
 *
 * Block: Mon 15 Jun 2026 → Sun 26 Jul 2026 (6 weeks)
 * Sessions per week:
 *   Mon  Session A — Squat bias + vertical pull
 *   Thu  Session B — Hinge bias + horizontal pull + rotation
 *   Sat  Session C — Optional athletic day
 *
 * Approach: rolling template. Same prescriptions every week, progression
 * is autoregulated — coach notes on each session say "add a small load
 * or +1 rep once a set feels like two in reserve". This matches the
 * "stable template, autoregulated progression" call the coach asked for.
 * Each session opens with the generic ~7 min warm-up (same six moves)
 * as its own section, then power → main strength → wrist finisher.
 */

import pg from 'pg';
import crypto from 'node:crypto';

const ATHLETE_ID = 'ef6';
const BLOCK_NAME = 'Rolling Strength · 6 weeks';
const START_DATE = '2026-06-15';
const END_DATE   = '2026-07-26';
const DURATION_W = 6;

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com', port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop', password: process.env.PGPASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});

const exerciseDefs = [
  // Warm-up
  { name: 'Wall Open Book',         cat: 'mobility', pat: ['core_rotation'],        bil: 'unilateral', eq: ['bodyweight'], notes: 'Side-lying, reach top arm overhead and open the chest to the ceiling. 6/side.' },
  { name: 'Banded Pull-Aparts',     cat: 'warm_up',  pat: ['horizontal_pull'],      bil: 'bilateral',  eq: ['band'],       notes: 'Light band, arms straight, pull to a wide T. 15 reps.' },
  { name: '90/90 Hip Switches',     cat: 'mobility', pat: ['core_rotation'],        bil: 'unilateral', eq: ['bodyweight'], notes: 'Seated 90/90, switch sides under control. 8/side.' },
  { name: 'Ankle Rocks',            cat: 'mobility', pat: ['squat'],                bil: 'unilateral', eq: ['bodyweight'], notes: 'Half-kneel, drive knee forward over toes. 8/side.' },
  { name: 'Dead Bug',               cat: 'warm_up',  pat: ['core_anti_extension'],  bil: 'unilateral', eq: ['bodyweight'], notes: 'Press lower back flat, slow opposite arm + leg. 8/side.' },
  { name: 'Bodyweight Squat',       cat: 'warm_up',  pat: ['squat'],                bil: 'bilateral',  eq: ['bodyweight'], notes: 'Controlled tempo, full range. 10 reps.' },

  // Session A — Power + Main
  { name: 'Goblet Squat',                  cat: 'strength',    pat: ['squat'], bil: 'bilateral',  eq: ['dumbbell'],     notes: 'Tempo: 3s lower, 1s pause at bottom. Start 10-12kg.' },
  { name: 'Barbell Glute Bridge',          cat: 'strength',    pat: ['hip_extension'], bil: 'bilateral', eq: ['barbell'], notes: 'Squeeze + 1s pause at top. Hip strength.' },
  { name: 'Assisted Pull-Up (Neutral Grip)', cat: 'strength',  pat: ['vertical_pull'], bil: 'bilateral', eq: ['pull_up_bar'], notes: 'Use band / assist machine. Controlled descent.' },
  { name: 'Reverse Lunge',                 cat: 'strength',    pat: ['lunge'], bil: 'unilateral', eq: ['dumbbell'],     notes: 'Step back into deep lunge. Supported if balance limits.' },

  // Wrist finishers
  { name: 'Wrist Extension Rotation',      cat: 'mobility',    pat: ['cyclical'], bil: 'bilateral', eq: ['dumbbell'],   notes: 'Full ROM wrist extension + rotation. 3 sets working both wrists.' },
  { name: 'Isometric Bar Hold',            cat: 'accessory',   pat: ['vertical_pull'], bil: 'bilateral', eq: ['pull_up_bar'], notes: 'Dead hang. 20s holds.' },

  // Session B — Power + Main
  { name: 'Med Ball Rotational Toss',      cat: 'jumps_plyos', pat: ['core_rotation'], bil: 'unilateral', eq: ['med_ball'], notes: 'Light ball into wall. Stays in the PALMS — off the wrist. 3/side.' },
  { name: 'Single-Leg Glute Bridge',       cat: 'strength',    pat: ['hip_extension'], bil: 'unilateral', eq: ['bodyweight'], notes: 'Drive heel, squeeze top. 10/side.' },
  { name: 'Chest-Supported DB Row',        cat: 'strength',    pat: ['horizontal_pull'], bil: 'bilateral', eq: ['dumbbell','bench'], notes: 'Pin chest to bench, drive elbows back. Spares wrist + low back.' },
  { name: 'Tempo Split Squat',             cat: 'strength',    pat: ['lunge'], bil: 'unilateral', eq: ['dumbbell'], notes: 'Goblet OR tempo split squat (3s down). Supported if needed.' },
  { name: 'Reverse Grip Row',              cat: 'strength',    pat: ['horizontal_pull'], bil: 'bilateral', eq: ['cable'], notes: 'Light, controlled. Wrist work.' },

  // Session C — Optional
  { name: 'Goblet Squat to Box',           cat: 'strength',    pat: ['squat'], bil: 'bilateral', eq: ['dumbbell','plyo_box'], notes: 'Lighter, grooving the pattern. Sit fully on box.' },
  { name: 'Hip Thrust',                    cat: 'strength',    pat: ['hip_extension'], bil: 'bilateral', eq: ['barbell','bench'], notes: 'Repeat exposure to hip work.' },
  { name: 'Cable or Seal Row',             cat: 'strength',    pat: ['horizontal_pull'], bil: 'bilateral', eq: ['cable','bench'], notes: 'Pick cable row OR seal row. High quality reps.' },
];

await c.connect();
await c.query('BEGIN');

try {
  // ── Resolve exercises ────────────────────────────────────────────
  const exId = {};
  for (const def of exerciseDefs) {
    const r = await c.query(
      'SELECT id FROM exercise_library WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [def.name],
    );
    if (r.rows.length) { exId[def.name] = r.rows[0].id; continue; }
    const ins = await c.query(
      `INSERT INTO exercise_library
         (name, category, movement_patterns, bilateral_unilateral, equipment, is_active, notes, demo_video_url)
       VALUES ($1,$2,$3,$4,$5,true,$6,NULL)
       RETURNING id`,
      [def.name, def.cat, def.pat, def.bil, def.eq, def.notes],
    );
    exId[def.name] = ins.rows[0].id;
    console.log(`  ➕ ${def.name}`);
  }
  // Existing favourites
  for (const lookup of ['Box Jump', 'Trap Bar Deadlift', 'Lateral Bound & Stick', 'Split Squat']) {
    const r = await c.query(
      'SELECT id FROM exercise_library WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [lookup],
    );
    if (r.rows.length) { exId[lookup] = r.rows[0].id; continue; }
    const fb = await c.query(
      `INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, equipment, is_active)
       VALUES ($1,'strength','{}','bilateral','{}',true)
       RETURNING id`,
      [lookup],
    );
    exId[lookup] = fb.rows[0].id;
    console.log(`  ➕ ${lookup} (fallback)`);
  }
  console.log(`  resolved ${Object.keys(exId).length} exercises`);

  // ── Block ─────────────────────────────────────────────────────────
  const tb = await c.query(
    `INSERT INTO training_blocks
       (athlete_id, block_name, start_date, end_date, duration_weeks, display_order, notes)
     VALUES ($1,$2,$3,$4,$5,250,$6)
     RETURNING id`,
    [
      ATHLETE_ID, BLOCK_NAME, START_DATE, END_DATE, DURATION_W,
      'Rolling template — same prescriptions every week. Progression is autoregulated: add a small load OR +1 rep once a set feels like two in reserve. Daily isometric wrist hold runs OUTSIDE these sessions.',
    ],
  );
  const blockId = tb.rows[0].id;
  console.log(`  block ${blockId}`);

  // ── Builder helper. Loads SAME prescription across all 6 weeks. ──
  let sessionOrderCounter = 0;
  async function makeSession(name, notes, sections) {
    const bs = await c.query(
      `INSERT INTO block_sessions (block_id, session_name, session_order, coach_notes)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [blockId, name, sessionOrderCounter++, notes || null],
    );
    const bsId = bs.rows[0].id;
    let displayOrder = 0;
    const supersetByGroup = {};
    for (let secIdx = 0; secIdx < sections.length; secIdx++) {
      const sec = sections[secIdx];
      const insSec = await c.query(
        `INSERT INTO session_sections (block_session_id, name, display_order, is_warm_up)
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [bsId, sec.name, secIdx, !!sec.is_warm_up],
      );
      const sectionId = insSec.rows[0].id;
      for (const ex of sec.exercises) {
        if (!exId[ex.lib]) throw new Error(`Missing exercise key: ${ex.lib}`);
        let supersetId = null;
        if (ex.group) {
          const k = `${sectionId}::${ex.group}`;
          if (!supersetByGroup[k]) supersetByGroup[k] = crypto.randomUUID();
          supersetId = supersetByGroup[k];
        }
        const insEx = await c.query(
          `INSERT INTO session_exercises
             (block_session_id, section_id, exercise_id, display_order,
              prescription_type, notes, is_warm_up, superset_group_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [bsId, sectionId, exId[ex.lib], displayOrder++, ex.ptype || 'reps_only',
           ex.notes || null, !!sec.is_warm_up, supersetId],
        );
        const seId = insEx.rows[0].id;
        // Same prescription every week (rolling template)
        for (let w = 1; w <= DURATION_W; w++) {
          await c.query(
            `INSERT INTO exercise_week_prescriptions
               (session_exercise_id, week_number, sets, reps, target_value, rest_seconds)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [seId, w, ex.sets ?? 1, String(ex.reps ?? '1'), ex.target ?? null, ex.rest ?? null],
          );
        }
      }
    }
    return bsId;
  }

  const WARM_UP = {
    name: 'Generic Warm-Up · ~7 min',
    is_warm_up: true,
    exercises: [
      { lib: 'Wall Open Book',     ptype: 'reps_only', sets: 1, reps: '6/side' },
      { lib: 'Banded Pull-Aparts', ptype: 'reps_only', sets: 1, reps: '15' },
      { lib: '90/90 Hip Switches', ptype: 'reps_only', sets: 1, reps: '8/side' },
      { lib: 'Ankle Rocks',        ptype: 'reps_only', sets: 1, reps: '8/side' },
      { lib: 'Dead Bug',           ptype: 'reps_only', sets: 1, reps: '8/side' },
      { lib: 'Bodyweight Squat',   ptype: 'reps_only', sets: 1, reps: '10' },
    ],
  };

  // ── SESSION A — Squat bias + vertical pull ────────────────────────
  const sessA = await makeSession(
    'Session A · Squat + Vertical Pull',
    'Mondays. Same prescription every week — add a small load or +1 rep once a set feels like two in reserve. Daily isometric wrist hold runs OUTSIDE this session.',
    [
      WARM_UP,
      { name: 'Power', is_warm_up: false, exercises: [
        { lib: 'Box Jump', ptype: 'reps_only', sets: 4, reps: '3', target: 'Full recovery · step down', rest: 120,
          notes: 'Linear power while fresh.' },
      ]},
      { name: 'Main', is_warm_up: false, exercises: [
        { lib: 'Goblet Squat',                  ptype: 'reps_only', sets: 4, reps: '6',     target: 'Tempo 3s + 1s pause',  rest: 120,
          notes: 'Full-range driver. Start 10-12kg.' },
        { lib: 'Barbell Glute Bridge',          ptype: 'reps_only', sets: 3, reps: '10',    target: '1s pause at top',      rest: 90 },
        { lib: 'Assisted Pull-Up (Neutral Grip)', ptype: 'reps_only', sets: 3, reps: '6-8', target: 'Controlled descent',   rest: 90 },
        { lib: 'Reverse Lunge',                 ptype: 'reps_only', sets: 3, reps: '8/side', target: 'Supported if needed', rest: 90 },
      ]},
      { name: 'Wrist Finisher', is_warm_up: false, exercises: [
        { lib: 'Wrist Extension Rotation', ptype: 'reps_only', sets: 3, reps: 'Full range' },
        { lib: 'Isometric Bar Hold',       ptype: 'time',      sets: 3, reps: '20s' },
      ]},
    ],
  );

  // ── SESSION B — Hinge bias + horizontal pull + rotation ───────────
  const sessB = await makeSession(
    'Session B · Hinge + Horizontal Pull + Rotation',
    'Thursdays. Same prescription every week — autoregulate as in Session A. Med Ball rotational toss is LIGHT (ball stays in the palms, off the wrist) — regress to no-catch chop or cable rotation if any wrist niggle.',
    [
      WARM_UP,
      { name: 'Power', is_warm_up: false, exercises: [
        { lib: 'Med Ball Rotational Toss', ptype: 'reps_only', sets: 4, reps: '3/side', target: 'Light · palms not wrist', rest: 90,
          notes: 'Swing-specific. Regress to no-catch chop or cable rotation on a wrist niggle.' },
      ]},
      { name: 'Main', is_warm_up: false, exercises: [
        { lib: 'Trap Bar Deadlift',         ptype: 'reps_only', sets: 4, reps: '5',     target: 'Neutral grip · straps if grip limits', rest: 150,
          notes: 'Plays to her mid-thigh-pull strength.' },
        { lib: 'Single-Leg Glute Bridge',   ptype: 'reps_only', sets: 3, reps: '10/side', target: 'Hip stability',                    rest: 60 },
        { lib: 'Chest-Supported DB Row',    ptype: 'reps_only', sets: 3, reps: '10',    target: 'Drive elbows · spare the wrist',     rest: 90 },
        { lib: 'Tempo Split Squat',         ptype: 'reps_only', sets: 3, reps: '6/side', target: 'Goblet OR tempo · supported',        rest: 90 },
      ]},
      { name: 'Wrist Finisher', is_warm_up: false, exercises: [
        { lib: 'Reverse Grip Row',         ptype: 'reps_only', sets: 3, reps: '12', target: 'Light, controlled' },
        { lib: 'Wrist Extension Rotation', ptype: 'reps_only', sets: 3, reps: 'Full range' },
      ]},
    ],
  );

  // ── SESSION C — Optional athletic day ─────────────────────────────
  const sessC = await makeSession(
    'Session C · Optional Athletic Day',
    'Saturdays — nice-to-have. Skip without guilt on busy weeks. Lateral power + repetition of the squat and hip patterns + horizontal pull.',
    [
      WARM_UP,
      { name: 'Power', is_warm_up: false, exercises: [
        { lib: 'Lateral Bound & Stick', ptype: 'reps_only', sets: 3, reps: '3/side', target: 'Stick landing', rest: 90 },
      ]},
      { name: 'Main', is_warm_up: false, exercises: [
        { lib: 'Goblet Squat to Box', ptype: 'reps_only', sets: 3, reps: '8',     target: 'Lighter · groove pattern', rest: 90 },
        { lib: 'Hip Thrust',          ptype: 'reps_only', sets: 3, reps: '10',                                       rest: 90 },
        { lib: 'Cable or Seal Row',   ptype: 'reps_only', sets: 3, reps: '12',    target: 'Pick one',                  rest: 60 },
        { lib: 'Split Squat',         ptype: 'reps_only', sets: 3, reps: '8/side', target: 'Supported',                rest: 90 },
      ]},
      { name: 'Wrist Finisher', is_warm_up: false, exercises: [
        { lib: 'Isometric Bar Hold',       ptype: 'time',      sets: 3, reps: '20s' },
        { lib: 'Wrist Extension Rotation', ptype: 'reps_only', sets: 3, reps: 'Full range' },
      ]},
    ],
  );

  // ── Schedule: Mon A, Thu B, Sat C — 6 weeks ───────────────────────
  const weekStarts = [
    { wk: 1, mon: '2026-06-15' },
    { wk: 2, mon: '2026-06-22' },
    { wk: 3, mon: '2026-06-29' },
    { wk: 4, mon: '2026-07-06' },
    { wk: 5, mon: '2026-07-13' },
    { wk: 6, mon: '2026-07-20' },
  ];
  const addDays = (iso, n) => {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const schedule = [];
  for (const w of weekStarts) {
    schedule.push({ week: w.wk, date: w.mon,             bs: sessA });
    schedule.push({ week: w.wk, date: addDays(w.mon, 3), bs: sessB });
    schedule.push({ week: w.wk, date: addDays(w.mon, 5), bs: sessC });
  }
  for (const slot of schedule) {
    await c.query(
      `INSERT INTO planned_sessions
         (athlete_id, block_id, block_session_id, week_number, planned_date, status)
       VALUES ($1,$2,$3,$4,$5,'planned')`,
      [ATHLETE_ID, blockId, slot.bs, slot.week, slot.date],
    );
  }
  console.log(`  ${schedule.length} planned_sessions scheduled`);

  await c.query('COMMIT');
  console.log(`\n✓ Block seeded for Sara Ali: "${BLOCK_NAME}" (id=${blockId})`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('Seed failed:', e);
  process.exit(1);
} finally {
  await c.end();
}
