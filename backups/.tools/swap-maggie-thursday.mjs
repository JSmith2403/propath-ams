#!/usr/bin/env node
/**
 * Swap Maggie Urda's Thursday session for the new "Full Body Power
 * (Power + Unilateral Bias)" template.
 *
 *   PGPASSWORD=… node backups/.tools/swap-maggie-thursday.mjs
 *
 * Plan:
 *   1. Build a new block_session under Maggie's existing
 *      "Lower Strength + Posterior Chain — 6 weeks" block.
 *   2. Re-point her two remaining Thursday planned_sessions (W5 Jun 18,
 *      W6 Jun 25) to the new block_session. The OLD block_session row
 *      stays in the catalogue but no longer has any planned dates —
 *      preserves historical session_logs if any reference it.
 */

import pg from 'pg';
import crypto from 'node:crypto';

const ATHLETE_ID = 'ef5';

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com', port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop', password: process.env.PGPASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});

const exerciseDefs = [
  { name: 'Foot Bridge',                                   cat: 'mobility',   pat: ['hinge'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Bridge from feet only, focus on intrinsic foot tension. 30s holds.' },
  { name: 'Tibialis Posterior Squeeze (Heel Raise)',       cat: 'mobility',   pat: ['cyclical'],       bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Heel raise + active arch contraction. Builds tib posterior.' },
  { name: 'Single Leg Accel Hold Balance',                 cat: 'warm_up',    pat: ['cyclical'],       bil: 'unilateral', eq: ['bodyweight'],  notes: 'Acceleration position, hold balance 25s. Tall posture.' },
  { name: 'Banded Ankle Inversion',                        cat: 'mobility',   pat: ['cyclical'],       bil: 'unilateral', eq: ['band'],        notes: 'Seated, band around foot, draw inward.' },
  { name: 'Banded Ankle Eversion',                         cat: 'mobility',   pat: ['cyclical'],       bil: 'unilateral', eq: ['band'],        notes: 'Seated, band around foot, draw outward.' },
  { name: 'Explosive Step-Up (Drive Up · Step Down)',      cat: 'jumps_plyos',pat: ['lunge'],          bil: 'unilateral', eq: ['plyo_box','dumbbell'], notes: 'Drive up explosively, step down controlled. 4/side, 2 min rest.' },
  { name: 'Single Leg Seated Calf Raise (DB on knee)',     cat: 'strength',   pat: ['cyclical'],       bil: 'unilateral', eq: ['dumbbell','bench'], notes: 'DB on bent knee. Full range, controlled. 12/side.' },
  { name: 'Landmine Press',                                cat: 'strength',   pat: ['vertical_push'],  bil: 'unilateral', eq: ['barbell'],     notes: 'Single arm landmine, ribs down, full lockout.' },
  { name: 'Chin Up',                                       cat: 'strength',   pat: ['vertical_pull'],  bil: 'bilateral',  eq: ['pull_up_bar'], notes: 'Supinated grip, full range. Add load when bodyweight is clean.' },
  { name: 'Pallof Press',                                  cat: 'accessory',  pat: ['core_anti_rotation'], bil: 'unilateral', eq: ['cable'],   notes: 'Resist rotation, slow and braced. 10/side.' },
];

await c.connect();
await c.query('BEGIN');

try {
  // ── 1. Locate Maggie's block ──────────────────────────────────────
  const tbq = await c.query(
    "SELECT id, block_name FROM training_blocks WHERE athlete_id = $1 AND block_name ILIKE '%Lower Strength + Posterior Chain%' LIMIT 1",
    [ATHLETE_ID],
  );
  if (!tbq.rows.length) throw new Error('Block not found for Maggie');
  const blockId = tbq.rows[0].id;
  console.log(`  block ${blockId} — ${tbq.rows[0].block_name}`);

  // ── 2. Resolve exercises (ILIKE match → insert if missing) ────────
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
  // Existing favourite — Hang Clean
  for (const lookup of ['Hang Clean']) {
    const r = await c.query(
      'SELECT id FROM exercise_library WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [lookup],
    );
    if (r.rows.length) { exId[lookup] = r.rows[0].id; continue; }
    const fb = await c.query(
      `INSERT INTO exercise_library (name, category, movement_patterns, bilateral_unilateral, equipment, is_active)
       VALUES ($1,'power','{}','bilateral','{}',true)
       RETURNING id`,
      [lookup],
    );
    exId[lookup] = fb.rows[0].id;
    console.log(`  ➕ ${lookup} (fallback)`);
  }
  console.log(`  resolved ${Object.keys(exId).length} exercises`);

  // ── 3. Create the new block_session ───────────────────────────────
  const ordRow = await c.query(
    'SELECT COALESCE(MAX(session_order), -1) + 1 AS next_order FROM block_sessions WHERE block_id = $1',
    [blockId],
  );
  const newOrder = ordRow.rows[0].next_order;
  const newBs = await c.query(
    `INSERT INTO block_sessions (block_id, session_name, session_order, coach_notes)
     VALUES ($1, 'Thursday · Full Body Power (Power + Unilateral Bias)', $2,
       'Power-biased Thursday. Correctives → Hang Clean / Explosive Step-Up → Landmine Press / Chin Up → Pallof finisher.')
     RETURNING id`,
    [blockId, newOrder],
  );
  const newBsId = newBs.rows[0].id;
  console.log(`  new block_session ${newBsId}`);

  // ── 4. Sections + exercises + week prescriptions ──────────────────
  // Both remaining Thursdays (W5 + W6) get the same prescription.
  const SECTIONS = [
    { name: 'Correctives / Activation', is_warm_up: true, exercises: [
      { lib: 'Foot Bridge',                              ptype: 'time',      sets: 2, reps: '30s' },
      { lib: 'Tibialis Posterior Squeeze (Heel Raise)',  ptype: 'reps_only', sets: 2, reps: '12' },
      { lib: 'Single Leg Accel Hold Balance',            ptype: 'time',      sets: 3, reps: '25s/side' },
      { lib: 'Banded Ankle Inversion',                   ptype: 'reps_only', sets: 2, reps: '15' },
      { lib: 'Banded Ankle Eversion',                    ptype: 'reps_only', sets: 2, reps: '15' },
    ]},
    { name: 'Main', is_warm_up: false, exercises: [
      { lib: 'Hang Clean',                                ptype: 'rpe',       sets: 4, reps: '2',     target: 'RPE 8.5',          rest: 180,
        notes: 'F · Explosive, full reset between reps.' },
      { lib: 'Explosive Step-Up (Drive Up · Step Down)',  ptype: 'rpe',       sets: 4, reps: '4/side', target: 'RPE 8 · 2 min rest', rest: 120,
        notes: 'G · Drive up fast, control the way down.' },
      { lib: 'Single Leg Seated Calf Raise (DB on knee)', ptype: 'reps_only', sets: 3, reps: '12/side' },
      { lib: 'Landmine Press',                            ptype: 'rpe',       sets: 3, reps: '6/side', target: 'RPE 9',            rest: 120,
        notes: 'I · Single arm landmine, ribs down.' },
      { lib: 'Chin Up',                                   ptype: 'reps_only', sets: 3, reps: '6',                                  rest: 90,
        notes: 'J · Full range. Add load if bodyweight is clean.' },
    ]},
    { name: 'Finisher', is_warm_up: false, exercises: [
      { lib: 'Pallof Press', ptype: 'reps_only', sets: 3, reps: '10/side' },
    ]},
  ];

  let displayOrder = 0;
  for (let secIdx = 0; secIdx < SECTIONS.length; secIdx++) {
    const sec = SECTIONS[secIdx];
    const insSec = await c.query(
      `INSERT INTO session_sections (block_session_id, name, display_order, is_warm_up)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [newBsId, sec.name, secIdx, !!sec.is_warm_up],
    );
    const sectionId = insSec.rows[0].id;
    for (const ex of sec.exercises) {
      if (!exId[ex.lib]) throw new Error(`Missing exercise key: ${ex.lib}`);
      const insEx = await c.query(
        `INSERT INTO session_exercises
           (block_session_id, section_id, exercise_id, display_order,
            prescription_type, notes, is_warm_up, superset_group_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NULL) RETURNING id`,
        [newBsId, sectionId, exId[ex.lib], displayOrder++, ex.ptype || 'reps_only',
         ex.notes || null, !!sec.is_warm_up],
      );
      const seId = insEx.rows[0].id;
      // Insert prescription for W5 + W6 (the remaining Thursdays in the block)
      for (const w of [5, 6]) {
        await c.query(
          `INSERT INTO exercise_week_prescriptions
             (session_exercise_id, week_number, sets, reps, target_value, rest_seconds)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [seId, w, ex.sets ?? 1, String(ex.reps ?? '1'), ex.target ?? null, ex.rest ?? null],
        );
      }
    }
  }
  console.log('  sections + exercises + prescriptions inserted');

  // ── 5. Repoint the two upcoming Thursday planned_sessions ─────────
  const upd = await c.query(
    `UPDATE planned_sessions
       SET block_session_id = $1, updated_at = now()
     WHERE athlete_id = $2
       AND block_id = $3
       AND EXTRACT(DOW FROM planned_date) = 4
       AND planned_date >= CURRENT_DATE
     RETURNING planned_date::text AS d, week_number`,
    [newBsId, ATHLETE_ID, blockId],
  );
  console.log(`  ${upd.rowCount} Thursday planned_sessions re-pointed:`);
  upd.rows.forEach(r => console.log(`     ${r.d} (W${r.week_number})`));

  await c.query('COMMIT');
  console.log(`\n✓ Maggie's Thursdays now run "Thursday · Full Body Power (Power + Unilateral Bias)".`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('Swap failed:', e);
  process.exit(1);
} finally {
  await c.end();
}
