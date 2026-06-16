#!/usr/bin/env node
/**
 * Seed: Samhita Srijith — 6-week Table Tennis Athletic Development.
 *
 *   PGPASSWORD=… node backups/.tools/seed-samhita-tt-6wk.mjs
 *
 * Block:    Mon 15 Jun 2026 → Sun 26 Jul 2026 (6 weeks)
 * Sessions: A · Gym  (Tue each week)
 *           B · Home (Fri each week)
 *           → 12 planned_sessions total.
 *
 * Each session has Movement Prep, Power, Strength (paired), Finishers.
 * Loads / reps progress across three phases (W1-2 / W3-4 / W5-6) via
 * exercise_week_prescriptions — one block_session per type, 6 week
 * rows per exercise.
 */

import pg from 'pg';
import crypto from 'node:crypto';

const ATHLETE_ID = 'ef7';
const BLOCK_NAME = 'TT Athletic Development · 6 weeks';
const START_DATE = '2026-06-15'; // Mon (the week containing today, Tue 16 Jun)
const END_DATE   = '2026-07-26'; // Sun
const DURATION_W = 6;

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop',
  password: process.env.PGPASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

// ── New exercise definitions ──────────────────────────────────────────
// Each ILIKE-matched against exercise_library first; fall back to insert
// with these defaults. Valid categories per CHECK constraint:
//   warm_up | strength | power | ballistic | jumps_plyos | capacity |
//   speed   | mobility | accessory
const exerciseDefs = [
  // Movement prep
  { name: 'Hang & Catch',                  cat: 'warm_up',     pat: ['vertical_pull'],          bil: 'bilateral',  eq: ['pull_up_bar'], notes: 'Dead hang, catch on rebound. Builds grip + scap control.' },
  { name: 'Tennis Ball Switch Plank',      cat: 'warm_up',     pat: ['core_anti_extension'],    bil: 'bilateral',  eq: ['tennis_ball'], notes: 'Plank position, pass tennis ball under chest hand-to-hand. Hips still.' },
  { name: 'Bear Crawl Forward & Backward', cat: 'warm_up',     pat: ['core_anti_extension'],    bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Knees hover, opposite hand-foot, slow & controlled.' },
  { name: 'Wall Tap Hip Hinge',            cat: 'warm_up',     pat: ['hinge'],                  bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Heels to wall, hinge back to tap. Reinforces hip-dominant pattern.' },

  // Power
  { name: 'Broad Jump & Stick',            cat: 'jumps_plyos', pat: ['squat'],                  bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Maximal horizontal jump, stick the landing 2-3s.' },
  { name: 'High Skip for Height',          cat: 'jumps_plyos', pat: ['cyclical'],               bil: 'unilateral', eq: ['bodyweight'],  notes: 'Tall posture, drive opposite knee + arm up for hang time.' },

  // Strength (new)
  { name: 'Incline Push-Up',               cat: 'strength',    pat: ['horizontal_push'],        bil: 'bilateral',  eq: ['bench'],       notes: 'Hands elevated. Controlled tempo, full range.' },
  { name: 'Single Arm Cable Row',          cat: 'strength',    pat: ['horizontal_pull'],        bil: 'unilateral', eq: ['cable'],       notes: 'Brace trunk, drive elbow. 8/side.' },
  { name: 'Split Squat',                   cat: 'strength',    pat: ['lunge'],                  bil: 'unilateral', eq: ['bodyweight'],  notes: 'Front heel loaded, controlled depth. Bodyweight to start.' },
  { name: 'Push-Up',                       cat: 'strength',    pat: ['horizontal_push'],        bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Full range, ribs down. Regress to incline if needed.' },
  { name: 'Single Leg Sit to Stand',       cat: 'strength',    pat: ['squat'],                  bil: 'unilateral', eq: ['bench'],       notes: 'From a box, drive through heel. 6/side.' },
  { name: 'Band Row',                      cat: 'strength',    pat: ['horizontal_pull'],        bil: 'bilateral',  eq: ['band'],        notes: 'Seated or standing, full retraction.' },

  // Finishers
  { name: 'Sled Push',                     cat: 'capacity',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['sled'],        notes: 'Heavy push, low body angle. 15m efforts.' },
  { name: 'Bike Intervals',                cat: 'capacity',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['fixed_machine'], notes: '30s hard / 30s easy. Hard = ~85% effort.' },
  { name: 'Continuous Skipping',           cat: 'capacity',    pat: ['cyclical'],               bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Continuous rope skipping, steady tempo, no breaks.' },
];

await c.connect();
await c.query('BEGIN');

try {
  // ── Resolve / insert exercises ───────────────────────────────────
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

  // ── Pull existing favourites (Back Squat, RFE Split, Rotational Med Ball Throw) ─
  for (const lookup of ['Back Squat', 'Rear Foot Elevated Split Squat', 'Rotational Med Ball Throw']) {
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
       (athlete_id, block_name, start_date, end_date, duration_weeks, display_order)
     VALUES ($1,$2,$3,$4,$5,150)
     RETURNING id`,
    [ATHLETE_ID, BLOCK_NAME, START_DATE, END_DATE, DURATION_W],
  );
  const blockId = tb.rows[0].id;
  console.log(`  block ${blockId}`);

  // ── Phase mapping helper ──────────────────────────────────────────
  // p12 = weeks 1-2 prescription, p34 = weeks 3-4, p56 = weeks 5-6.
  // Expanded into the 6 actual week rows below.
  function phased(p12, p34, p56) {
    return [p12, p12, p34, p34, p56, p56];
  }

  // ── Session builder helper ────────────────────────────────────────
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
        // 6 week_prescriptions per exercise
        for (let w = 0; w < DURATION_W; w++) {
          const wp = ex.weeks[w];
          if (!wp) continue;
          await c.query(
            `INSERT INTO exercise_week_prescriptions
               (session_exercise_id, week_number, sets, reps, target_value, rest_seconds)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [seId, w + 1, wp.sets ?? 1, String(wp.reps ?? '1'), wp.target ?? null, wp.rest ?? null],
          );
        }
      }
    }
    return bsId;
  }

  // ── SESSION A — Gym ────────────────────────────────────────────────
  const sessA = await makeSession(
    'Session A · Gym',
    'Tuesdays. Movement prep → Power → Strength (paired) → Finishers. Loads progress every two weeks.',
    [
      { name: 'Movement Prep', is_warm_up: true, exercises: [
        { lib: 'Hang & Catch',                  ptype: 'reps_only',
          weeks: phased({ sets: 2, reps: '5' },     { sets: 2, reps: '6' },     { sets: 3, reps: '5' }) },
        { lib: 'Tennis Ball Switch Plank',      ptype: 'time',
          weeks: phased({ sets: 2, reps: '20s' },   { sets: 2, reps: '25s' },   { sets: 3, reps: '20s' }) },
        { lib: 'Bear Crawl Forward & Backward', ptype: 'reps_only',
          weeks: phased({ sets: 2, reps: '10m' },   { sets: 2, reps: '12m' },   { sets: 3, reps: '10m' }) },
        { lib: 'Wall Tap Hip Hinge',            ptype: 'reps_only',
          weeks: phased({ sets: 2, reps: '8' },     { sets: 2, reps: '10' },    { sets: 3, reps: '8' }) },
      ]},
      { name: 'Power', is_warm_up: false, exercises: [
        { lib: 'Rotational Med Ball Throw', ptype: 'reps_only', notes: 'B1 · Max intent each rep.',
          weeks: phased({ sets: 3, reps: '5/side' }, { sets: 4, reps: '5/side' }, { sets: 4, reps: '6/side' }) },
        { lib: 'Broad Jump & Stick',        ptype: 'reps_only', notes: 'B2 · Stick the landing 2-3s.',
          weeks: phased({ sets: 3, reps: '4' },      { sets: 4, reps: '4' },      { sets: 4, reps: '5' }) },
      ]},
      { name: 'Strength · C', is_warm_up: false, exercises: [
        { lib: 'Back Squat',     ptype: 'rpe', group: 'C', notes: 'C1 · Controlled tempo. Add 2.5-5% from W3 if technique allows.',
          weeks: phased({ sets: 3, reps: '8', target: 'RPE 7',   rest: 90 },
                        { sets: 3, reps: '8', target: 'RPE 7.5 · +2.5-5%', rest: 90 },
                        { sets: 4, reps: '6', target: 'RPE 8 · +2.5-5%',   rest: 120 }) },
        { lib: 'Incline Push-Up', ptype: 'reps_only', group: 'C', notes: 'C2 · Paired with Back Squat.',
          weeks: phased({ sets: 3, reps: '8' },  { sets: 3, reps: '10' }, { sets: 3, reps: '12' }) },
      ]},
      { name: 'Strength · D', is_warm_up: false, exercises: [
        { lib: 'Rear Foot Elevated Split Squat', ptype: 'reps_only', group: 'D', notes: 'D1 · Front heel loaded, stay tall.',
          weeks: phased({ sets: 3, reps: '6/side' }, { sets: 3, reps: '7/side' }, { sets: 4, reps: '6/side' }) },
        { lib: 'Single Arm Cable Row',           ptype: 'reps_only', group: 'D', notes: 'D2 · Brace trunk, drive elbow.',
          weeks: phased({ sets: 3, reps: '8/side' }, { sets: 3, reps: '10/side' }, { sets: 4, reps: '8/side' }) },
      ]},
      { name: 'Finishers', is_warm_up: false, exercises: [
        { lib: 'Sled Push',      ptype: 'reps_only', notes: 'E1 · 15m efforts, heavy load.',
          weeks: phased({ sets: 4, reps: '15m' }, { sets: 5, reps: '15m' }, { sets: 6, reps: '15m' }) },
        { lib: 'Bike Intervals', ptype: 'time',      notes: 'E2 · 30s hard / 30s easy.',
          weeks: phased({ sets: 6, reps: '30s', target: '30s easy · 1:1', rest: 30 },
                        { sets: 7, reps: '30s', target: '30s easy · 1:1', rest: 30 },
                        { sets: 8, reps: '30s', target: '30s easy · 1:1', rest: 30 }) },
      ]},
    ],
  );

  // ── SESSION B — Home ───────────────────────────────────────────────
  const sessB = await makeSession(
    'Session B · Home',
    'Fridays. Bodyweight + band variant of Session A — same skeleton, no gym kit required.',
    [
      { name: 'Movement Prep', is_warm_up: true, exercises: [
        { lib: 'Hang & Catch',                  ptype: 'reps_only',
          weeks: phased({ sets: 2, reps: '5' },     { sets: 2, reps: '6' },     { sets: 3, reps: '5' }) },
        { lib: 'Tennis Ball Switch Plank',      ptype: 'time',
          weeks: phased({ sets: 2, reps: '20s' },   { sets: 2, reps: '25s' },   { sets: 3, reps: '20s' }) },
        { lib: 'Bear Crawl Forward & Backward', ptype: 'reps_only',
          weeks: phased({ sets: 2, reps: '10m' },   { sets: 2, reps: '12m' },   { sets: 3, reps: '10m' }) },
        { lib: 'Wall Tap Hip Hinge',            ptype: 'reps_only',
          weeks: phased({ sets: 2, reps: '8' },     { sets: 2, reps: '10' },    { sets: 3, reps: '8' }) },
      ]},
      { name: 'Power', is_warm_up: false, exercises: [
        { lib: 'High Skip for Height', ptype: 'reps_only', notes: 'B1 · Drive knees high for hang time.',
          weeks: phased({ sets: 3, reps: '15m' }, { sets: 4, reps: '15m' }, { sets: 4, reps: '20m' }) },
        { lib: 'Broad Jump & Stick',   ptype: 'reps_only', notes: 'B2 · Stick the landing.',
          weeks: phased({ sets: 3, reps: '4' },   { sets: 4, reps: '4' },   { sets: 4, reps: '5' }) },
      ]},
      { name: 'Strength · C', is_warm_up: false, exercises: [
        { lib: 'Split Squat', ptype: 'reps_only', group: 'C', notes: 'C1 · Bodyweight, controlled depth.',
          weeks: phased({ sets: 3, reps: '8/side' }, { sets: 3, reps: '10/side' }, { sets: 4, reps: '8/side' }) },
        { lib: 'Push-Up',     ptype: 'reps_only', group: 'C', notes: 'C2 · Paired with Split Squat. Range 8-15 reps.',
          weeks: phased({ sets: 3, reps: '8-12' },   { sets: 3, reps: '10-15' },   { sets: 4, reps: '10-15' }) },
      ]},
      { name: 'Strength · D', is_warm_up: false, exercises: [
        { lib: 'Single Leg Sit to Stand', ptype: 'reps_only', group: 'D', notes: 'D1 · From a box, drive through heel.',
          weeks: phased({ sets: 3, reps: '6/side' }, { sets: 3, reps: '8/side' }, { sets: 4, reps: '6/side' }) },
        { lib: 'Band Row',                ptype: 'reps_only', group: 'D', notes: 'D2 · Full retraction.',
          weeks: phased({ sets: 3, reps: '12' },    { sets: 3, reps: '15' },     { sets: 4, reps: '12' }) },
      ]},
      { name: 'Finishers', is_warm_up: false, exercises: [
        { lib: 'Continuous Skipping', ptype: 'time', notes: 'E1 · Steady tempo, no breaks.',
          weeks: phased({ sets: 4, reps: '60s' }, { sets: 5, reps: '60s' }, { sets: 6, reps: '60s' }) },
      ]},
    ],
  );

  // ── Schedule (Tue → A, Fri → B, every week) ───────────────────────
  const schedule = [
    { week: 1, date: '2026-06-16', bs: sessA }, // Tue
    { week: 1, date: '2026-06-19', bs: sessB }, // Fri
    { week: 2, date: '2026-06-23', bs: sessA },
    { week: 2, date: '2026-06-26', bs: sessB },
    { week: 3, date: '2026-06-30', bs: sessA },
    { week: 3, date: '2026-07-03', bs: sessB },
    { week: 4, date: '2026-07-07', bs: sessA },
    { week: 4, date: '2026-07-10', bs: sessB },
    { week: 5, date: '2026-07-14', bs: sessA },
    { week: 5, date: '2026-07-17', bs: sessB },
    { week: 6, date: '2026-07-21', bs: sessA },
    { week: 6, date: '2026-07-24', bs: sessB },
  ];
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
  console.log(`\n✓ 6-week block seeded for Samhita: "${BLOCK_NAME}" (block=${blockId})`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('Seed failed:', e);
  process.exit(1);
} finally {
  await c.end();
}
