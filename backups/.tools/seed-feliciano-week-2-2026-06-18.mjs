#!/usr/bin/env node
/**
 * Seed: Feliciano — extend Return-to-Football block into a second week.
 *
 *   PGPASSWORD=… node backups/.tools/seed-feliciano-week-2-2026-06-18.mjs
 *
 * Plan:
 *   1. Extend the existing "Week of 16 Jun · Return to Football" block
 *      from 1 week → 2 weeks (end_date 2026-06-21 → 2026-06-28).
 *   2. Delete the old Thu 18 / Fri 19 planned_sessions (they're being
 *      replaced with the new, more detailed sessions below). Keep the
 *      Tue 16 / Wed 17 / Sat 20 sessions in place — the user explicitly
 *      flagged Sat 20 as staying.
 *   3. Add nine new block_sessions and schedule them:
 *        Thu 18  Lower Body Gym (Asymmetry Focus)
 *        Fri 19  Recovery + Pool + Optional Uppers
 *        Mon 22  Full Body Strength (AM)
 *        Mon 22  Easy Aerobic Run (PM)
 *        Tue 23  Speed & COD (Pitch)
 *        Wed 24  Recovery + Dissociation (AM Pool/Bike)
 *        Wed 24  Optional Uppers (PM)
 *        Thu 25  Football Integration + Retest
 *        Fri 26  Travel + Dissociation
 */

import pg from 'pg';
import crypto from 'node:crypto';

const ATHLETE_ID = 'em3';
const BLOCK_NAME = 'Week of 16 Jun · Return to Football';

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop',
  password: process.env.PGPASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

// ── Exercise definitions (only the new ones) ──────────────────────────
const exerciseDefs = [
  { name: 'Bear Crawl Hip Slides',                cat: 'mobility',  pat: ['hip_extension'],         bil: 'unilateral', eq: ['bodyweight'],  notes: 'Bear crawl position, slide hip to side. 6/side.' },
  { name: 'Step-Up March',                        cat: 'warm_up',   pat: ['lunge'],                 bil: 'unilateral', eq: ['plyo_box'],    notes: 'Tall posture, drive opposite knee up. 5/side.' },
  { name: 'Depth Drop to Stick',                  cat: 'jumps_plyos', pat: ['squat'],               bil: 'unilateral', eq: ['plyo_box'],    notes: 'Step off low box (30cm), absorb + stick. 4/side.' },
  { name: 'Single-Leg Hop to Stick',              cat: 'jumps_plyos', pat: ['squat'],               bil: 'unilateral', eq: ['bodyweight'],  notes: 'Hop forward, stick the landing 2-3s.' },
  { name: 'Split Squat Pushing Yielding Iso',     cat: 'strength',  pat: ['lunge'],                 bil: 'unilateral', eq: ['bodyweight'],  notes: '20s hold at depth, ~75% effort, push into floor.' },
  { name: 'Single-Leg RDL',                       cat: 'strength',  pat: ['hinge'],                 bil: 'unilateral', eq: ['dumbbell'],    notes: 'Hinge with one leg back, controlled. 6/side.' },
  { name: 'Pallof Press (one leg)',               cat: 'accessory', pat: ['core_anti_rotation'],    bil: 'unilateral', eq: ['cable'],       notes: 'Single-leg stance, resist rotation. 10/leg.' },
  { name: 'Easy Swim',                            cat: 'capacity',  pat: ['cyclical'],              bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Easy swim, steady pace, no intervals. 25-30 min.' },
  { name: 'Back Kick with Neutral Pelvis',        cat: 'mobility',  pat: ['cyclical'],              bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Back kick drill, keep pelvis neutral. 50m efforts.' },
  { name: 'Half-Kneeling Hip Flexor with Reach',  cat: 'mobility',  pat: ['hip_extension'],         bil: 'unilateral', eq: ['bodyweight'],  notes: 'Tuck pelvis, reach overhead opposite arm. 5/side.' },
  { name: 'Supine ASLR with Band',                cat: 'mobility',  pat: ['hinge'],                 bil: 'unilateral', eq: ['band'],        notes: 'Banded straight-leg raise, controlled. 6/leg.' },
  { name: 'Dead Bug into Hip Flexion Hold',       cat: 'accessory', pat: ['core_anti_extension'],   bil: 'unilateral', eq: ['bodyweight'],  notes: 'Dead bug + 3s hip-flexion hold. Low ribs pinned. 5/leg.' },
  { name: 'Easy Bike',                            cat: 'capacity',  pat: ['cyclical'],              bil: 'bilateral',  eq: ['fixed_machine'], notes: 'Easy bike, steady, 30 min.' },
  { name: 'CMJ ForceDecks Retest',                cat: 'warm_up',   pat: ['squat'],                 bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Pre-session ForceDecks CMJ: 3 max-effort jumps. Capture RFD + L/R asymmetry as pre-Spain baseline.' },
  { name: 'Football Drill — Warm-Up Block',       cat: 'warm_up',   pat: ['cyclical'],              bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Pitch-side warm-up: jog, dynamic, ball touches. Coach-specified content.' },
  { name: 'Football Drill — Technical Training',  cat: 'speed',     pat: ['cyclical'],              bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Technical block content varies by session focus — see session notes.' },
  { name: 'Football Drill — Conditioning Block',  cat: 'capacity',  pat: ['cyclical'],              bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Conditioning block content varies by session focus — see session notes.' },
];

await c.connect();
await c.query('BEGIN');

try {
  // ── Locate the block ──────────────────────────────────────────────
  const tbq = await c.query(
    'SELECT id, end_date, duration_weeks FROM training_blocks WHERE athlete_id = $1 AND block_name = $2',
    [ATHLETE_ID, BLOCK_NAME],
  );
  if (!tbq.rows.length) throw new Error(`Block not found: "${BLOCK_NAME}"`);
  const blockId = tbq.rows[0].id;
  console.log(`  block ${blockId}`);

  // ── Extend the block to 2 weeks ───────────────────────────────────
  await c.query(
    `UPDATE training_blocks
     SET end_date = '2026-06-28', duration_weeks = 2, updated_at = now()
     WHERE id = $1`,
    [blockId],
  );
  console.log('  block extended to Sun 28 Jun (2 weeks)');

  // ── Delete the old Thu 18 + Fri 19 planned_sessions ───────────────
  const del = await c.query(
    `DELETE FROM planned_sessions
     WHERE block_id = $1 AND planned_date IN ('2026-06-18','2026-06-19')
     RETURNING planned_date`,
    [blockId],
  );
  console.log(`  removed ${del.rowCount} stale Thu/Fri sessions`);

  // ── Resolve / insert exercises ───────────────────────────────────
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
  // Existing exercises — ILIKE lookup with fallback
  for (const lookup of [
    'Heavy Step-Up', 'Rear Foot Elevated Split Squat', 'Side Plank with Hip Abduction',
    'Adductor Rock Back', 'T-Spine Rotation', 'Gym Ball Squeeze into Wall',
    'Weighted Chin-Up', 'DB Bench Press', 'Chest Supported Row',
    'Single Arm Landmine Press', 'Decline Crunch', 'Hang Clean',
    'Trap Bar Deadlift', 'Half-Kneeling DB Shoulder Press', 'Easy Aerobic Run',
    'Mobility Circuit',
  ]) {
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

  // ── Session builder helper ────────────────────────────────────────
  // Bumps session_order off the existing max so the new sessions don't
  // collide with the ones already in the block (Tue/Wed/Sat).
  const orderRow = await c.query(
    'SELECT COALESCE(MAX(session_order), -1) + 1 AS next_order FROM block_sessions WHERE block_id = $1',
    [blockId],
  );
  let sessionOrderCounter = orderRow.rows[0].next_order;

  async function makeSession(name, notes, weekNumber, sections) {
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
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [seId, weekNumber, ex.sets ?? 1, String(ex.reps ?? '1'), ex.target ?? null, ex.rest ?? null],
        );
      }
    }
    return bsId;
  }

  // ── Thu 18 — Lower Body Gym (Asymmetry Focus) ─────────────────────
  const thu18 = await makeSession(
    'Lower Body Gym · Asymmetry Focus',
    'Asymmetry-biased lower session. Heavy step-ups (3s eccentric), split work + iso, single-leg RDL.',
    1,
    [
      { name: 'Activation', is_warm_up: true, exercises: [
        { lib: 'Bear Crawl Hip Slides', ptype: 'reps_only', sets: 2, reps: '6/side' },
        { lib: 'Step-Up March',         ptype: 'reps_only', sets: 2, reps: '5/side' },
      ]},
      { name: 'Power / SSC', is_warm_up: false, exercises: [
        { lib: 'Depth Drop to Stick',      ptype: 'reps_only', sets: 3, reps: '4/side', target: 'Low box 30cm · stick' },
        { lib: 'Single-Leg Hop to Stick',  ptype: 'reps_only', sets: 3, reps: '4/side', target: 'Stick landing' },
      ]},
      { name: 'Main', is_warm_up: false, exercises: [
        { lib: 'Heavy Step-Up',                     ptype: 'rpe',       sets: 4, reps: '5/side',  target: 'RPE 7 · 3s eccentric', rest: 120,
          notes: 'E · 3s eccentric on the way down each rep.' },
        { lib: 'Rear Foot Elevated Split Squat',    ptype: 'rpe',       sets: 3, reps: '5/side',  target: 'RPE 7',                 rest: 90,
          notes: 'F · Front heel loaded, stay tall.' },
        { lib: 'Split Squat Pushing Yielding Iso',  ptype: 'time',      sets: 3, reps: '20s/side', target: '~75% effort',           rest: 60,
          notes: 'G · Hold at depth, push into floor.' },
        { lib: 'Single-Leg RDL',                    ptype: 'rpe',       sets: 3, reps: '6/side',  target: 'RPE 7',                 rest: 90,
          notes: 'H · Square the hips, controlled.' },
      ]},
      { name: 'Finisher', is_warm_up: false, exercises: [
        { lib: 'Side Plank with Hip Abduction', ptype: 'reps_only', sets: 3, reps: '8/side' },
        { lib: 'Pallof Press (one leg)',        ptype: 'reps_only', sets: 3, reps: '10/leg' },
      ]},
    ],
  );

  // ── Fri 19 — Recovery + Pool + Optional Uppers ────────────────────
  const fri19 = await makeSession(
    'Recovery · Pool + Mobility + Optional Uppers',
    'AM pool, mobility/dissociation circuit (2 rounds), optional uppers RPE 6 (35 min cap).',
    1,
    [
      { name: 'Pool', is_warm_up: false, exercises: [
        { lib: 'Easy Swim',                    ptype: 'time',      sets: 1, reps: '25-30 min', target: 'Steady · no intervals' },
        { lib: 'Back Kick with Neutral Pelvis', ptype: 'reps_only', sets: 4, reps: '50m' },
      ]},
      { name: 'Mobility / Dissociation Circuit · 2 rounds', is_warm_up: false, exercises: [
        { lib: 'Bear Crawl Hip Slides',                ptype: 'reps_only', sets: 2, reps: '6/side' },
        { lib: 'Half-Kneeling Hip Flexor with Reach',  ptype: 'reps_only', sets: 2, reps: '5/side' },
        { lib: 'Supine ASLR with Band',                ptype: 'reps_only', sets: 2, reps: '6/leg' },
        { lib: 'Dead Bug into Hip Flexion Hold',       ptype: 'reps_only', sets: 2, reps: '5/leg', target: '3s hold' },
        { lib: 'Adductor Rock Back',                   ptype: 'reps_only', sets: 2, reps: '8/side' },
        { lib: 'T-Spine Rotation',                     ptype: 'reps_only', sets: 2, reps: '6/side' },
      ]},
      { name: 'Optional Uppers · RPE 6 · 35 min cap', is_warm_up: false, exercises: [
        { lib: 'Gym Ball Squeeze into Wall',  ptype: 'time',      sets: 2, reps: '30s' },
        { lib: 'Weighted Chin-Up',            ptype: 'reps_only', sets: 3, reps: '6', target: 'RPE 6' },
        { lib: 'DB Bench Press',              ptype: 'reps_only', sets: 3, reps: '8', target: 'RPE 6' },
        { lib: 'Chest Supported Row',         ptype: 'reps_only', sets: 3, reps: '10', target: 'RPE 6' },
        { lib: 'Single Arm Landmine Press',   ptype: 'reps_only', sets: 3, reps: '8/side', target: 'RPE 6' },
        { lib: 'Decline Crunch',              ptype: 'reps_only', sets: 2, reps: '10' },
      ]},
    ],
  );

  // ── Mon 22 AM — Full Body Strength ────────────────────────────────
  const mon22AM = await makeSession(
    'Full Body Strength · AM',
    'Activation → Hang Clean → Trap-Bar Deadlift → RFE Split Squat → SL RDL → Chin-Up → Half-Kneel Press → Finisher.',
    2,
    [
      { name: 'Activation', is_warm_up: true, exercises: [
        { lib: 'Bear Crawl Hip Slides', ptype: 'reps_only', sets: 2, reps: '6/side' },
        { lib: 'Step-Up March',         ptype: 'reps_only', sets: 2, reps: '5/side' },
      ]},
      { name: 'Power / SSC', is_warm_up: false, exercises: [
        { lib: 'Hang Clean', ptype: 'reps_only', sets: 4, reps: '3', target: 'Explosive · full reset', rest: 150 },
      ]},
      { name: 'Main', is_warm_up: false, exercises: [
        { lib: 'Trap Bar Deadlift',                ptype: 'rpe', sets: 4, reps: '4',     target: 'RPE 8',   rest: 150 },
        { lib: 'Rear Foot Elevated Split Squat',   ptype: 'rpe', sets: 3, reps: '5/side', target: 'RPE 8',   rest: 120 },
        { lib: 'Single-Leg RDL',                   ptype: 'rpe', sets: 3, reps: '6/side', target: 'RPE 7',   rest: 90  },
        { lib: 'Weighted Chin-Up',                 ptype: 'reps_only', sets: 3, reps: '6' },
        { lib: 'Half-Kneeling DB Shoulder Press',  ptype: 'rpe', sets: 3, reps: '6/arm',  target: 'RPE 7',   rest: 90  },
      ]},
      { name: 'Finisher', is_warm_up: false, exercises: [
        { lib: 'Side Plank with Hip Abduction', ptype: 'reps_only', sets: 3, reps: '8/side' },
        { lib: 'Pallof Press (one leg)',        ptype: 'reps_only', sets: 3, reps: '10/leg' },
      ]},
    ],
  );

  // ── Mon 22 PM — Aerobic Run ────────────────────────────────────────
  const mon22PM = await makeSession(
    'Aerobic Run · PM',
    'Easy 20 min continuous, conversational pace.',
    2,
    [
      { name: 'Run', is_warm_up: false, exercises: [
        { lib: 'Easy Aerobic Run', ptype: 'time', sets: 1, reps: '20 min', target: 'Conversational' },
      ]},
    ],
  );

  // ── Tue 23 — Speed & COD (Pitch) ───────────────────────────────────
  const tue23 = await makeSession(
    'Speed & COD · Pitch',
    'Warm-up → Technical (max velocity, COD, repeat sprints) → Conditioning. Specifics set pitch-side.',
    2,
    [
      { name: 'Warm-Up Block',  is_warm_up: false, exercises: [
        { lib: 'Football Drill — Warm-Up Block', ptype: 'time', sets: 1, reps: 'Block' },
      ]},
      { name: 'Technical Training · Max velocity · COD · Repeat sprints', is_warm_up: false, exercises: [
        { lib: 'Football Drill — Technical Training', ptype: 'time', sets: 1, reps: 'Block', target: 'Max velocity · COD · Repeat sprints' },
      ]},
      { name: 'Conditioning Block', is_warm_up: false, exercises: [
        { lib: 'Football Drill — Conditioning Block', ptype: 'time', sets: 1, reps: 'Block' },
      ]},
    ],
  );

  // ── Wed 24 AM — Recovery + Dissociation ──────────────────────────
  const wed24AM = await makeSession(
    'Recovery + Dissociation · AM',
    'Easy swim or bike 30 min + dissociation circuit (Friday\'s C–H) 10 min.',
    2,
    [
      { name: 'Pool / Bike', is_warm_up: false, exercises: [
        { lib: 'Easy Swim', ptype: 'time', sets: 1, reps: '30 min', target: 'Steady' },
        { lib: 'Easy Bike', ptype: 'time', sets: 1, reps: '30 min', target: 'Steady', notes: 'Pick swim OR bike.' },
      ]},
      { name: 'Dissociation Circuit · 10 min', is_warm_up: false, exercises: [
        { lib: 'Bear Crawl Hip Slides',                ptype: 'reps_only', sets: 2, reps: '6/side' },
        { lib: 'Half-Kneeling Hip Flexor with Reach',  ptype: 'reps_only', sets: 2, reps: '5/side' },
        { lib: 'Supine ASLR with Band',                ptype: 'reps_only', sets: 2, reps: '6/leg' },
        { lib: 'Dead Bug into Hip Flexion Hold',       ptype: 'reps_only', sets: 2, reps: '5/leg', target: '3s hold' },
        { lib: 'Adductor Rock Back',                   ptype: 'reps_only', sets: 2, reps: '8/side' },
        { lib: 'T-Spine Rotation',                     ptype: 'reps_only', sets: 2, reps: '6/side' },
      ]},
    ],
  );

  // ── Wed 24 PM — Optional Uppers (40 min cap) ─────────────────────
  const wed24PM = await makeSession(
    'Optional Uppers · PM',
    'RPE 6, 40 min cap. Same skeleton as Friday\'s optional uppers.',
    2,
    [
      { name: 'Uppers · RPE 6 · 40 min cap', is_warm_up: false, exercises: [
        { lib: 'Gym Ball Squeeze into Wall',  ptype: 'time',      sets: 2, reps: '30s' },
        { lib: 'Weighted Chin-Up',            ptype: 'reps_only', sets: 3, reps: '6', target: 'RPE 6' },
        { lib: 'DB Bench Press',              ptype: 'reps_only', sets: 3, reps: '8', target: 'RPE 6' },
        { lib: 'Chest Supported Row',         ptype: 'reps_only', sets: 3, reps: '10', target: 'RPE 6' },
        { lib: 'Single Arm Landmine Press',   ptype: 'reps_only', sets: 3, reps: '8/side', target: 'RPE 6' },
        { lib: 'Decline Crunch',              ptype: 'reps_only', sets: 2, reps: '10' },
      ]},
    ],
  );

  // ── Thu 25 — Football Integration + Retest ────────────────────────
  const thu25 = await makeSession(
    'Football Integration + Retest',
    'Pre-session: CMJ retest on ForceDecks → capture pre-Spain RFD asymmetry baseline. Then warm-up → technical (football integration, controlled kicking) → conditioning.',
    2,
    [
      { name: 'Pre-Session · ForceDecks', is_warm_up: true, exercises: [
        { lib: 'CMJ ForceDecks Retest', ptype: 'reps_only', sets: 1, reps: '3 max jumps', target: 'Pre-Spain baseline' },
      ]},
      { name: 'Warm-Up Block', is_warm_up: false, exercises: [
        { lib: 'Football Drill — Warm-Up Block', ptype: 'time', sets: 1, reps: 'Block' },
      ]},
      { name: 'Technical Training · Football integration · Controlled kicking', is_warm_up: false, exercises: [
        { lib: 'Football Drill — Technical Training', ptype: 'time', sets: 1, reps: 'Block', target: 'Football integration · Controlled kicking' },
      ]},
      { name: 'Conditioning Block', is_warm_up: false, exercises: [
        { lib: 'Football Drill — Conditioning Block', ptype: 'time', sets: 1, reps: 'Block' },
      ]},
    ],
  );

  // ── Fri 26 — Travel + Dissociation ────────────────────────────────
  const fri26 = await makeSession(
    'Travel · Dissociation Circuit',
    'Travel day. Dissociation circuit (Friday\'s C–H) in the hotel evening, 10 min.',
    2,
    [
      { name: 'Hotel Dissociation Circuit · 10 min', is_warm_up: false, exercises: [
        { lib: 'Bear Crawl Hip Slides',                ptype: 'reps_only', sets: 2, reps: '6/side' },
        { lib: 'Half-Kneeling Hip Flexor with Reach',  ptype: 'reps_only', sets: 2, reps: '5/side' },
        { lib: 'Supine ASLR with Band',                ptype: 'reps_only', sets: 2, reps: '6/leg' },
        { lib: 'Dead Bug into Hip Flexion Hold',       ptype: 'reps_only', sets: 2, reps: '5/leg', target: '3s hold' },
        { lib: 'Adductor Rock Back',                   ptype: 'reps_only', sets: 2, reps: '8/side' },
        { lib: 'T-Spine Rotation',                     ptype: 'reps_only', sets: 2, reps: '6/side' },
      ]},
    ],
  );

  // ── Schedule ───────────────────────────────────────────────────────
  const schedule = [
    { week: 1, date: '2026-06-18', bs: thu18    },
    { week: 1, date: '2026-06-19', bs: fri19    },
    { week: 2, date: '2026-06-22', bs: mon22AM  },
    { week: 2, date: '2026-06-22', bs: mon22PM  },
    { week: 2, date: '2026-06-23', bs: tue23    },
    { week: 2, date: '2026-06-24', bs: wed24AM  },
    { week: 2, date: '2026-06-24', bs: wed24PM  },
    { week: 2, date: '2026-06-25', bs: thu25    },
    { week: 2, date: '2026-06-26', bs: fri26    },
  ];
  for (const slot of schedule) {
    await c.query(
      `INSERT INTO planned_sessions
         (athlete_id, block_id, block_session_id, week_number, planned_date, status)
       VALUES ($1,$2,$3,$4,$5,'planned')`,
      [ATHLETE_ID, blockId, slot.bs, slot.week, slot.date],
    );
  }
  console.log(`  ${schedule.length} new planned_sessions scheduled`);

  await c.query('COMMIT');
  console.log(`\n✓ Feliciano: extended ${BLOCK_NAME} to 2 weeks + added 9 sessions across Thu 18 → Fri 26.`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('Seed failed:', e);
  process.exit(1);
} finally {
  await c.end();
}
