#!/usr/bin/env node
/**
 * Seed: Feliciano single-week programme — Tue 16 Jun → Sat 20 Jun 2026.
 *
 *   PGPASSWORD=… node backups/.tools/seed-feliciano-week-2026-06-16.mjs
 *
 * Why a one-week block:
 *   Rehab / return-to-play weeks change frequently. Rather than build
 *   another multi-week block, we wrap a single week in its own block
 *   so the existing planned_sessions plumbing still works (the schema
 *   requires every planned_session to live under a block). Next week
 *   the coach builds another single-week block. This script doubles
 *   as a template — copy + edit dates and contents for the next week.
 *
 * Sessions:
 *   Tue 16 Jun  Upper Body Power & Strength
 *   Wed 17 Jun  Speed & HSR Day
 *   Thu 18 Jun  Lower Body Power & Strength
 *   Fri 19 Jun  Recovery Day
 *   Sat 20 Jun  Return to Football Session
 *   Sun off (no session)
 */

import pg from 'pg';
import crypto from 'node:crypto';

const ATHLETE_ID = 'em3';
const BLOCK_NAME = 'Week of 16 Jun · Return to Football';
const START_DATE = '2026-06-15'; // Monday (block windows are Mon→Sun)
const END_DATE   = '2026-06-21'; // Sunday
const DURATION_W = 1;

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop',
  password: process.env.PGPASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

// ── Exercise resolver ──────────────────────────────────────────────────
// Each canonical name we'll write into block_sessions. For each:
//   1. ILIKE-match an existing exercise_library row (case-insensitive,
//      whole-name) so we don't duplicate the standards already curated.
//   2. Fall back to inserting with the supplied defaults.
const exerciseDefs = [
  // Mobility / activation
  { name: '90/90 Hip Lift with Ball Squeeze',           cat: 'mobility',  pat: ['hip_extension'],         bil: 'bilateral',  eq: ['bodyweight'],   notes: '5 breaths per round. Drive heels down, exhale low ribs.' },
  { name: 'Gym Ball Squeeze into Wall',                 cat: 'mobility',  pat: ['core_anti_extension'],   bil: 'bilateral',  eq: ['bodyweight'],   notes: '30s holds. Drive ball into wall through bent knee.' },
  { name: 'Half-Kneeling Hip Flexor Mobilisation',      cat: 'mobility',  pat: ['hip_extension'],         bil: 'unilateral', eq: ['bodyweight'],   notes: '30s/side. Tuck pelvis, squeeze back glute.' },
  { name: 'Adductor Rock Back',                         cat: 'mobility',  pat: ['squat'],                 bil: 'unilateral', eq: ['bodyweight'],   notes: 'Slow rocks, full range. 8/side.' },
  { name: 'T-Spine Rotation',                           cat: 'mobility',  pat: ['core_rotation'],         bil: 'unilateral', eq: ['bodyweight'],   notes: '6/side. Reach long, breathe out at end range.' },
  { name: 'Walking Spiderman with Rotation',            cat: 'mobility',  pat: ['hip_extension'],         bil: 'bilateral',  eq: ['bodyweight'],   notes: '10m. Step long, reach up.' },

  // Power
  { name: 'Rotational Med Ball Throw',                  cat: 'jumps_plyos', pat: ['core_rotation'],        bil: 'unilateral', eq: ['med_ball'],     notes: 'Hip-driven, intent each rep. 4/side.' },
  { name: 'Lateral Bound & Stick',                      cat: 'jumps_plyos', pat: ['lunge'],                bil: 'unilateral', eq: ['bodyweight'],   notes: 'Stick the landing 2-3s. Quality > quantity.' },
  { name: 'Box Jump',                                   cat: 'jumps_plyos', pat: ['squat'],                bil: 'bilateral',  eq: ['plyo_box'],     notes: 'Soft landing, step down between reps.' },

  // Upper strength
  { name: 'Single Arm Landmine Press',                  cat: 'strength', pat: ['vertical_push'],          bil: 'unilateral', eq: ['barbell'],      notes: 'Ribs down, full lockout. 8/side.' },
  { name: 'Chest Supported Row',                        cat: 'strength', pat: ['horizontal_pull'],        bil: 'bilateral',  eq: ['dumbbell','bench'], notes: 'Pin chest, drive elbows.' },
  { name: 'Decline Crunch',                             cat: 'accessory', pat: ['core_anti_extension'],   bil: 'bilateral',  eq: ['bench'],        notes: 'Controlled tempo, no hip flexion.' },
  { name: 'Marching Suitcase Carry',                    cat: 'strength', pat: ['core_anti_lateral_flexion'], bil: 'unilateral', eq: ['dumbbell'],  notes: 'Tall ribs, slow march. 20m/side.' },

  // Lower strength
  { name: 'Heavy Step-Up',                              cat: 'strength', pat: ['lunge'],                  bil: 'unilateral', eq: ['plyo_box','dumbbell'], notes: 'Drive through front heel. 5/side.' },
  { name: 'Skater Lunge',                               cat: 'strength', pat: ['lunge'],                  bil: 'unilateral', eq: ['bodyweight'],   notes: 'Cross-behind lunge, balance the landing. 6/side.' },
  { name: 'Lateral Lunge with Plate Drag',              cat: 'strength', pat: ['lunge'],                  bil: 'unilateral', eq: ['plate'],        notes: 'Slide plate, deep lateral lunge. 6/side.' },
  { name: 'Romanian Deadlift',                          cat: 'strength', pat: ['hinge'],                  bil: 'bilateral',  eq: ['barbell'],      notes: 'Hinge, long hamstrings, 3s eccentric.' },
  { name: 'Nordic Hamstring',                           cat: 'strength', pat: ['hinge'],                  bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Eccentric focus, control the way down.' },
  { name: 'Copenhagen Plank',                           cat: 'accessory', pat: ['core_anti_lateral_flexion'], bil: 'unilateral', eq: ['bench'],    notes: 'Inner-thigh on bench. 20s/side.' },
  { name: 'Single Leg RDL Reach',                       cat: 'strength', pat: ['hinge'],                  bil: 'unilateral', eq: ['bodyweight'],   notes: 'Reach long, square the hips. 6/side.' },

  // Conditioning
  { name: 'Ski Erg Intervals',                          cat: 'capacity', pat: ['cyclical'],               bil: 'bilateral',  eq: ['fixed_machine'], notes: '30s hard / 30s rest. Sit tall, hinge from hips.' },
  { name: 'Battle Ropes Alternating Waves',             cat: 'capacity', pat: ['cyclical'],               bil: 'bilateral',  eq: ['ropes'],        notes: '30s max effort, alternating waves.' },
  { name: 'Med Ball Slam',                              cat: 'capacity', pat: ['core_anti_extension'],    bil: 'bilateral',  eq: ['med_ball'],     notes: 'Full overhead, slam with intent.' },

  // Speed / HSR (Wed + Sat)
  { name: 'Sprint Build-Ups',                           cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Progressive accel to ~90%, full recovery.' },
  { name: 'Sprint 20m',                                 cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Full walk-back recovery between reps.' },
  { name: 'Sprint 30m',                                 cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Full walk-back recovery between reps.' },
  { name: 'Sprint 10m',                                 cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Acceleration focus, full recovery.' },
  { name: 'HSR Progressive Effort',                     cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Build through 4-6 progressive efforts (30-50m).' },

  // Football technical
  { name: 'Finishing (Football)',                       cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Receive → strike at goal under movement.' },
  { name: 'Receiving at Speed',                         cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'First touch into space at pace.' },
  { name: 'Passing at Speed',                           cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Sharp passes, weight under movement.' },
  { name: 'Curved Runs',                                cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Angled runs at speed, finish or receive.' },
  { name: 'Pitch-Based Conditioning',                   cat: 'capacity', pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Aerobic power, HSR exposure, technical actions under fatigue.' },
  { name: '1v1 (Football)',                             cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Beat the defender, change of pace and direction.' },
  { name: 'Position-Specific Actions',                  cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Game actions tailored to playing position.' },
  { name: 'Receiving Under Pressure',                   cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'First touch with a defender close.' },
  { name: 'Passing Under Fatigue',                      cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Sharp passes after intensity blocks.' },
  { name: 'Planned Deceleration',                       cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Decelerate to controlled stop, multi-angle.' },
  { name: 'Multi-Angle Braking',                        cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Brake from varied entry angles.' },
  { name: 'Repeat Sprint 20m',                          cat: 'speed',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Series of 20m, short recovery.' },

  // Recovery
  { name: 'Easy Aerobic 20-30 min',                     cat: 'capacity', pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: '20-30 min easy bike / swim / walk. Conversational.' },
  { name: 'Mobility Circuit',                           cat: 'mobility', pat: ['hip_extension'],          bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Full circuit, gentle, both sides.' },
  { name: 'Tissue Work',                                cat: 'mobility', pat: ['hip_extension'],          bil: 'bilateral',  eq: ['foam_roller'],  notes: 'Foam roll / massage as required.' },
  { name: 'Contrast Shower',                            cat: 'mobility', pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Optional. 30s hot / 30s cold, 4-6 rounds.' },
  { name: 'Ice Bath',                                   cat: 'mobility', pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],   notes: 'Optional. 5-10 min, 10-15°C.' },
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
    if (r.rows.length) {
      exId[def.name] = r.rows[0].id;
      continue;
    }
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
  console.log(`  resolved ${Object.keys(exId).length} exercises`);

  // ── Pull existing favourites (Front Squat, DB Bench, Weighted Chin-Up) ─
  // These almost certainly exist already from the Off-Season seed.
  for (const lookup of ['Front Squat', 'DB Bench Press', 'Weighted Chin-Up']) {
    const r = await c.query(
      'SELECT id FROM exercise_library WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [lookup],
    );
    if (r.rows.length) exId[lookup] = r.rows[0].id;
    else {
      // Fallback: create
      const fb = await c.query(
        `INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, equipment, is_active)
         VALUES ($1,'strength','{}','bilateral','{}',true)
         RETURNING id`,
        [lookup],
      );
      exId[lookup] = fb.rows[0].id;
      console.log(`  ➕ ${lookup} (fallback)`);
    }
  }

  // ── Block ─────────────────────────────────────────────────────────
  const tb = await c.query(
    `INSERT INTO training_blocks
       (athlete_id, block_name, start_date, end_date, duration_weeks, display_order)
     VALUES ($1,$2,$3,$4,$5,200)
     RETURNING id`,
    [ATHLETE_ID, BLOCK_NAME, START_DATE, END_DATE, DURATION_W],
  );
  const blockId = tb.rows[0].id;
  console.log(`  block ${blockId}`);

  // ── Session builder helpers ───────────────────────────────────────
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
         VALUES ($1,$2,$3,$4)
         RETURNING id`,
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
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           RETURNING id`,
          [bsId, sectionId, exId[ex.lib], displayOrder++, ex.ptype || 'reps_only',
           ex.notes || null, !!sec.is_warm_up, supersetId],
        );
        const seId = insEx.rows[0].id;
        await c.query(
          `INSERT INTO exercise_week_prescriptions
             (session_exercise_id, week_number, sets, reps, target_value, rest_seconds)
           VALUES ($1,1,$2,$3,$4,$5)`,
          [seId, ex.sets ?? 1, String(ex.reps ?? '1'), ex.target ?? null, ex.rest ?? null],
        );
      }
    }
    return bsId;
  }

  // ── Tuesday — Upper Body Power & Strength ─────────────────────────
  const upperPS = await makeSession(
    'Upper Body Power & Strength',
    'Mobility prime, rotational power, upper strength, finish with conditioning.',
    [
      { name: 'Mobility & Activation', is_warm_up: true, exercises: [
        { lib: '90/90 Hip Lift with Ball Squeeze',      ptype: 'time',      sets: 2, reps: '5 breaths' },
        { lib: 'Gym Ball Squeeze into Wall',            ptype: 'time',      sets: 2, reps: '30s' },
        { lib: 'Half-Kneeling Hip Flexor Mobilisation', ptype: 'time',      sets: 2, reps: '30s/side' },
        { lib: 'Adductor Rock Back',                    ptype: 'reps_only', sets: 2, reps: '8/side' },
        { lib: 'T-Spine Rotation',                      ptype: 'reps_only', sets: 2, reps: '6/side' },
      ]},
      { name: 'Power', is_warm_up: false, exercises: [
        { lib: 'Rotational Med Ball Throw',             ptype: 'reps_only', sets: 4, reps: '4/side',  target: 'Max intent' },
        { lib: 'Lateral Bound & Stick',                 ptype: 'reps_only', sets: 3, reps: '4/side',  target: 'Stick landing' },
      ]},
      { name: 'Upper Body Strength', is_warm_up: false, exercises: [
        { lib: 'Weighted Chin-Up',          ptype: 'rpe',       sets: 4, reps: '5',     target: 'RPE 8',  rest: 120 },
        { lib: 'DB Bench Press',            ptype: 'rpe',       sets: 4, reps: '6',     target: 'RPE 8',  rest: 120 },
        { lib: 'Single Arm Landmine Press', ptype: 'rpe',       sets: 3, reps: '8/side', target: 'RPE 7.5', rest: 90 },
        { lib: 'Chest Supported Row',       ptype: 'rpe',       sets: 3, reps: '8',     target: 'RPE 7.5', rest: 90 },
        { lib: 'Decline Crunch',            ptype: 'reps_only', sets: 2, reps: '10' },
        { lib: 'Marching Suitcase Carry',   ptype: 'reps_only', sets: 2, reps: '20m/side' },
      ]},
      { name: 'Conditioning', is_warm_up: false, exercises: [
        { lib: 'Ski Erg Intervals',               ptype: 'time',      sets: 10, reps: '30s', target: '30s rest · 1:1', rest: 30,  notes: '10 × 30s hard / 30s rest.' },
        { lib: 'Battle Ropes Alternating Waves',  ptype: 'time',      sets: 6,  reps: '30s', target: 'Max effort', rest: 60,
          notes: 'After Ski Erg block + 3 min easy rope taps / walking. Then 6 rounds: 30s ropes max → 30s med ball slams max → 60s rest. Pair with Med Ball Slam (same round).' },
        { lib: 'Med Ball Slam',                   ptype: 'time',      sets: 6,  reps: '30s', target: 'Max intent', rest: 60,
          notes: 'Pair with Battle Ropes — 30s ropes then straight into 30s slams, 60s rest = one round. 6 rounds.' },
      ]},
    ],
  );

  // ── Wednesday — Speed & HSR Day ────────────────────────────────────
  const speedHSR = await makeSession(
    'Speed & HSR Day',
    'Speed primer, sprints, HSR exposure, technical football work.',
    [
      { name: 'Speed', is_warm_up: false, exercises: [
        { lib: 'Sprint Build-Ups', ptype: 'reps_only', sets: 1, reps: '3',  target: 'Progressive', rest: 90, notes: '3 build-ups, rising effort.' },
        { lib: 'Sprint 20m',       ptype: 'reps_only', sets: 4, reps: '20m', target: '80%', rest: 120 },
        { lib: 'Sprint 20m',       ptype: 'reps_only', sets: 4, reps: '20m', target: '85%', rest: 120, notes: 'Second block at higher intensity.' },
        { lib: 'Sprint 30m',       ptype: 'reps_only', sets: 2, reps: '30m', target: '90%', rest: 180 },
      ]},
      { name: 'HSR Exposure', is_warm_up: false, exercises: [
        { lib: 'HSR Progressive Effort', ptype: 'reps_only', sets: 5, reps: '30-50m', target: 'Progressive', rest: 120, notes: '4-6 progressive efforts.' },
      ]},
      { name: 'Football Technical', is_warm_up: false, exercises: [
        { lib: 'Finishing (Football)',  ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Receiving at Speed',    ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Passing at Speed',      ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Curved Runs',           ptype: 'reps_only', sets: 1, reps: 'Block' },
      ]},
      { name: 'Pitch-Based Conditioning', is_warm_up: false, exercises: [
        { lib: 'Pitch-Based Conditioning', ptype: 'time', sets: 1, reps: 'Block', target: 'Aerobic power · HSR · technical under fatigue' },
      ]},
    ],
  );

  // ── Thursday — Lower Body Power & Strength ────────────────────────
  const lowerPS = await makeSession(
    'Lower Body Power & Strength',
    'Mobility prime, jumps & bounds, lower compound work, finish with single-leg control.',
    [
      { name: 'Mobility & Activation', is_warm_up: true, exercises: [
        { lib: '90/90 Hip Lift with Ball Squeeze',      ptype: 'time',      sets: 2, reps: '5 breaths' },
        { lib: 'Gym Ball Squeeze into Wall',            ptype: 'time',      sets: 2, reps: '30s' },
        { lib: 'Adductor Rock Back',                    ptype: 'reps_only', sets: 2, reps: '8/side' },
        { lib: 'Half-Kneeling Hip Flexor Mobilisation', ptype: 'time',      sets: 2, reps: '30s/side' },
        { lib: 'Walking Spiderman with Rotation',       ptype: 'reps_only', sets: 1, reps: '10m' },
      ]},
      { name: 'Power', is_warm_up: false, exercises: [
        { lib: 'Lateral Bound & Stick', ptype: 'reps_only', sets: 4, reps: '3/side', target: 'Stick landing' },
        { lib: 'Box Jump',              ptype: 'reps_only', sets: 4, reps: '3',      target: 'Step down' },
      ]},
      { name: 'Lower Body Strength', is_warm_up: false, exercises: [
        { lib: 'Front Squat',                   ptype: 'rpe',       sets: 4, reps: '4',      target: 'RPE 8',   rest: 150 },
        { lib: 'Heavy Step-Up',                 ptype: 'rpe',       sets: 4, reps: '5/side', target: 'RPE 7.5', rest: 120 },
        { lib: 'Skater Lunge',                  ptype: 'reps_only', sets: 3, reps: '6/side' },
        { lib: 'Lateral Lunge with Plate Drag', ptype: 'reps_only', sets: 3, reps: '6/side' },
        { lib: 'Romanian Deadlift',             ptype: 'rpe',       sets: 3, reps: '5',      target: 'RPE 7.5', rest: 120 },
        { lib: 'Nordic Hamstring',              ptype: 'reps_only', sets: 3, reps: '4',      target: 'Slow lower' },
        { lib: 'Copenhagen Plank',              ptype: 'time',      sets: 3, reps: '20s/side' },
        { lib: 'Single Leg RDL Reach',          ptype: 'reps_only', sets: 2, reps: '6/side' },
      ]},
    ],
  );

  // ── Friday — Recovery Day ──────────────────────────────────────────
  const recovery = await makeSession(
    'Recovery Day',
    'Easy aerobic + mobility. Tissue work if needed. Optional contrast.',
    [
      { name: 'Recovery', is_warm_up: false, exercises: [
        { lib: 'Easy Aerobic 20-30 min', ptype: 'time', sets: 1, reps: '20-30 min', target: 'Easy / conversational' },
        { lib: 'Mobility Circuit',       ptype: 'time', sets: 1, reps: 'Full circuit' },
        { lib: 'Tissue Work',            ptype: 'time', sets: 1, reps: 'As required' },
      ]},
      { name: 'Optional', is_warm_up: false, exercises: [
        { lib: 'Contrast Shower', ptype: 'time', sets: 1, reps: '4-6 rounds' },
        { lib: 'Ice Bath',        ptype: 'time', sets: 1, reps: '5-10 min' },
      ]},
    ],
  );

  // ── Saturday — Return to Football Session ─────────────────────────
  const footballSat = await makeSession(
    'Return to Football Session',
    'Sprints across distances, HSR, decel + multi-angle braking, technical actions, finish with repeat sprint block.',
    [
      { name: 'Speed', is_warm_up: false, exercises: [
        { lib: 'Sprint 10m', ptype: 'reps_only', sets: 4, reps: '10m', target: 'Max',  rest: 90  },
        { lib: 'Sprint 20m', ptype: 'reps_only', sets: 4, reps: '20m', target: 'Max',  rest: 120 },
        { lib: 'Sprint 30m', ptype: 'reps_only', sets: 2, reps: '30m', target: 'Max',  rest: 180 },
      ]},
      { name: 'HSR Exposure', is_warm_up: false, exercises: [
        { lib: 'HSR Progressive Effort', ptype: 'reps_only', sets: 5, reps: '30-50m', target: 'Progressive', rest: 120, notes: '4-6 efforts.' },
      ]},
      { name: 'Deceleration', is_warm_up: false, exercises: [
        { lib: 'Planned Deceleration', ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Multi-Angle Braking',  ptype: 'reps_only', sets: 1, reps: 'Block' },
      ]},
      { name: 'Football Technical', is_warm_up: false, exercises: [
        { lib: 'Finishing (Football)',     ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: '1v1 (Football)',           ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Position-Specific Actions', ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Curved Runs',              ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Receiving Under Pressure', ptype: 'reps_only', sets: 1, reps: 'Block' },
        { lib: 'Passing Under Fatigue',    ptype: 'reps_only', sets: 1, reps: 'Block' },
      ]},
      { name: 'Pitch-Based Conditioning', is_warm_up: false, exercises: [
        { lib: 'Pitch-Based Conditioning', ptype: 'time', sets: 1, reps: 'Block',
          target: 'Repeat sprint · decel tolerance · technical under fatigue · positional running' },
      ]},
      { name: 'Repeat Sprint Block', is_warm_up: false, exercises: [
        { lib: 'Repeat Sprint 20m', ptype: 'reps_only', sets: 2, reps: '5 × 20m', target: '20s rec · 3 min between sets', rest: 180,
          notes: '2 sets of 5 × 20m, 20s recovery between reps, 3 min between sets.' },
      ]},
    ],
  );

  // ── Schedule ───────────────────────────────────────────────────────
  const schedule = [
    { date: '2026-06-16', bs: upperPS    },
    { date: '2026-06-17', bs: speedHSR   },
    { date: '2026-06-18', bs: lowerPS    },
    { date: '2026-06-19', bs: recovery   },
    { date: '2026-06-20', bs: footballSat },
  ];
  for (const slot of schedule) {
    await c.query(
      `INSERT INTO planned_sessions
         (athlete_id, block_id, block_session_id, week_number, planned_date, status)
       VALUES ($1,$2,$3,1,$4,'planned')`,
      [ATHLETE_ID, blockId, slot.bs, slot.date],
    );
  }
  console.log(`  ${schedule.length} planned_sessions scheduled`);

  await c.query('COMMIT');
  console.log(`\n✓ Week seeded for Feliciano: "${BLOCK_NAME}" (block=${blockId})`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('Seed failed:', e);
  process.exit(1);
} finally {
  await c.end();
}
