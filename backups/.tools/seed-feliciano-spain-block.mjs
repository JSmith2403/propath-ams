#!/usr/bin/env node
/**
 * Seed: Feliciano — Spain Off-Season 2-week block (Mon 29 Jun → Sun 12 Jul 2026).
 *
 *   PGPASSWORD=… node backups/.tools/seed-feliciano-spain-block.mjs
 *
 * Coach adjustments to the PDF version:
 *   • Technical sessions land on Mon / Tue / Thu / Fri (not Sun/Tue/Thu/Sat
 *     as the PDF assumed).
 *   • Friday is SOLELY technical — no gym, no physical focus block.
 *   • Physical focus rotation (A Accel · B Max V · C Decel+COD) runs on
 *     the three non-Friday technical days: Mon=A, Tue=B, Thu=C.
 *   • Gym sessions stack on Tue (Strength PM, after technical AM) and
 *     Thu (Power AM, before technical PM).
 *   • Low days: Wed, Sat, Sun.
 *   • Daily Dissociation Circuit runs every morning of the block — 14
 *     planned sessions across the 2 weeks.
 *
 * Block session templates:
 *   1. Daily Dissociation Circuit · AM  (every day)
 *   2. Technical Day A · Accel        (Mon)
 *   3. Technical Day B · Max V        (Tue AM)
 *   4. Technical Day C · Decel + COD  (Thu PM)
 *   5. Technical Friday · Coach-Led   (Fri, no focus block)
 *   6. Gym 1 · Full Body Strength      (Tue PM)
 *   7. Gym 2 · Full Body Power         (Thu AM)
 *
 * Each technical day session opens with the 8-min RAMP section, then
 * the 12-min focus block, then a coach-led technical placeholder.
 */

import pg from 'pg';
import crypto from 'node:crypto';

const ATHLETE_ID = 'em3';
const BLOCK_NAME = 'Spain Off-Season · 2 weeks';
const START_DATE = '2026-06-29';
const END_DATE   = '2026-07-12';
const DURATION_W = 2;

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com', port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop', password: process.env.PGPASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});

// ── New exercise definitions ──────────────────────────────────────────
// Valid categories per CHECK constraint:
//   warm_up, strength, power, ballistic, jumps_plyos, capacity,
//   speed, mobility, accessory
const exerciseDefs = [
  // RAMP (8-min warm-up before every physical block)
  { name: 'Jog (Easy)',                  cat: 'warm_up',  pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '30s easy jog. Just turn the legs over.' },
  { name: 'Skip (Tall)',                 cat: 'warm_up',  pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '30s. Tall posture, rhythmic.' },
  { name: 'Backwards Skip',              cat: 'warm_up',  pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '30s. Open the hips.' },
  { name: 'Lateral Skip',                cat: 'warm_up',  pat: ['cyclical'],          bil: 'unilateral', eq: ['bodyweight'],  notes: '30s/side. Light feet.' },
  { name: 'Wall March',                  cat: 'warm_up',  pat: ['hip_extension'],     bil: 'unilateral', eq: ['bodyweight'],  notes: 'Hands on wall, march. Pelvis pinned, drive femur to 90°. 5/side.' },
  { name: 'Lunge with Calf Raise',       cat: 'warm_up',  pat: ['lunge'],             bil: 'unilateral', eq: ['bodyweight'],  notes: 'Long stride, finish with calf raise on back foot. 4/side.' },
  { name: 'Bear Crawl Kickback',         cat: 'warm_up',  pat: ['hip_extension'],     bil: 'unilateral', eq: ['bodyweight'],  notes: 'Bear position, kick leg back into hip extension. Pelvis square. 5/side.' },
  { name: 'Low Amplitude Plyos',         cat: 'jumps_plyos', pat: ['cyclical'],       bil: 'bilateral',  eq: ['bodyweight'],  notes: '10 reps. Stiff ankle, minimal ground contact.' },
  { name: 'Broad Jump',                  cat: 'jumps_plyos', pat: ['squat'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '3 reps. Build into them, full intent on the third.' },

  // Day A — Acceleration
  { name: 'Triple Hops',                 cat: 'jumps_plyos', pat: ['cyclical'],       bil: 'unilateral', eq: ['bodyweight'],  notes: '3/side. Stick the third landing.' },
  { name: '10m Accel',                   cat: 'speed',    pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '10m max acceleration. Walk-back recovery.' },
  { name: 'Varied Position Accel',       cat: 'speed',    pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '4 reps total — 2 side-on, 2 spin-and-accel. Walk-back recovery.' },

  // Day B — Max Velocity
  { name: 'A-Switches',                  cat: 'speed',    pat: ['cyclical'],          bil: 'unilateral', eq: ['bodyweight'],  notes: '8/side. Sharp switch, tall posture.' },
  { name: 'Single-Leg A-Skip',           cat: 'speed',    pat: ['cyclical'],          bil: 'unilateral', eq: ['bodyweight'],  notes: '15m/side. Drive knee up, opposite arm.' },
  { name: 'Boom Boom (Straight-Leg Run)', cat: 'speed',   pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '20m straight-leg running. Drives the gait cycle.' },
  { name: 'Sprint 40m',                  cat: 'speed',    pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Max effort. Full walk-back so every rep is genuinely fast.' },

  // Day C — Decel + COD
  { name: 'Jump Out & Back',             cat: 'jumps_plyos', pat: ['squat'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '5 reps. Jump forward + back, stick each landing.' },
  { name: 'Decel to Base',               cat: 'speed',    pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '10m approach into athletic base. Walk-back recovery.' },
  { name: 'Decel to Split',              cat: 'speed',    pat: ['cyclical'],          bil: 'unilateral', eq: ['bodyweight'],  notes: '10m approach into split stance. Walk-back recovery.' },
  { name: 'Max Decel to Pushback',       cat: 'speed',    pat: ['cyclical'],          bil: 'bilateral',  eq: ['bodyweight'],  notes: '20m max decel into push-back. Walk-back recovery.' },

  // Dissociation circuit additions
  { name: 'Glute Bridge with March',     cat: 'mobility', pat: ['hip_extension'],     bil: 'unilateral', eq: ['bodyweight'],  notes: 'Hips locked at top, march without dropping. 6/side.' },

  // Gym session additions
  { name: 'Barbell Forward Lunge',       cat: 'strength', pat: ['lunge'],             bil: 'unilateral', eq: ['barbell'],     notes: 'Decelerative emphasis on the front leg. Controlled descent. 5/side.' },
  { name: 'Trap-Bar Jump',               cat: 'jumps_plyos', pat: ['squat'],          bil: 'bilateral',  eq: ['trap_bar'],    notes: 'Explosive triple-extension. Same pattern as a clean, lower technical risk. Full reset between reps.' },

  // Coach-led placeholders
  { name: 'Technical Session (Coach-Led, Spain)', cat: 'speed', pat: ['cyclical'],    bil: 'bilateral',  eq: ['bodyweight'],  notes: 'Solo / small-group technical session with the Spain coach. Content varies by day — log RPE + duration after.' },
];

await c.connect();
await c.query('BEGIN');

try {
  // ── Resolve exercises (ILIKE match → insert if missing) ──────────
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
  // Existing favourites (re-used from prior seeds)
  for (const lookup of [
    'Bear Crawl Hip Slides', 'Step-Up March', 'Half-Kneeling Hip Flexor with Reach',
    'Supine ASLR with Band', 'Dead Bug into Hip Flexion Hold', 'Adductor Rock Back',
    'T-Spine Rotation', 'Side Plank with Hip Abduction',
    'Trap Bar Deadlift', 'Single-Leg RDL', 'Weighted Chin-Up',
    'Half-Kneeling DB Shoulder Press', 'Pallof Press (one leg)',
    'Front Squat', 'Single-Leg Hip Thrust', 'DB Bench Press', 'Single-Arm DB Row',
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

  // ── Block ─────────────────────────────────────────────────────────
  const tb = await c.query(
    `INSERT INTO training_blocks
       (athlete_id, block_name, start_date, end_date, duration_weeks, display_order, notes)
     VALUES ($1,$2,$3,$4,$5,300,$6)
     RETURNING id`,
    [
      ATHLETE_ID, BLOCK_NAME, START_DATE, END_DATE, DURATION_W,
      'Spain off-season. Technical days Mon/Tue/Thu/Fri (Fri solely technical). Two gym sessions stack on Tue + Thu. Daily dissociation circuit every morning. Three low days: Wed/Sat/Sun. After heavy striking days, the next day drops to RAMP only.',
    ],
  );
  const blockId = tb.rows[0].id;
  console.log(`  block ${blockId}`);

  // ── Builder helper ────────────────────────────────────────────────
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

  // Re-used RAMP section (8-min warm-up before every physical block)
  const RAMP_SECTION = {
    name: 'RAMP · 8 min',
    is_warm_up: true,
    exercises: [
      { lib: 'Jog (Easy)',                  ptype: 'time',      sets: 1, reps: '30s' },
      { lib: 'Skip (Tall)',                 ptype: 'time',      sets: 1, reps: '30s' },
      { lib: 'Backwards Skip',              ptype: 'time',      sets: 1, reps: '30s' },
      { lib: 'Lateral Skip',                ptype: 'time',      sets: 1, reps: '30s/side' },
      { lib: 'Wall March',                  ptype: 'reps_only', sets: 1, reps: '5/side',  target: 'Pelvis level' },
      { lib: 'Lunge with Calf Raise',       ptype: 'reps_only', sets: 1, reps: '4/side' },
      { lib: 'Side Plank with Hip Abduction', ptype: 'time',    sets: 1, reps: '20s/side' },
      { lib: 'Bear Crawl Kickback',         ptype: 'reps_only', sets: 1, reps: '5/side' },
      { lib: 'Low Amplitude Plyos',         ptype: 'reps_only', sets: 1, reps: '10',      target: 'Stiff ankle' },
      { lib: 'Broad Jump',                  ptype: 'reps_only', sets: 1, reps: '3',       target: 'Full intent on the third' },
    ],
  };

  const TECHNICAL_PLACEHOLDER = {
    name: 'Technical (Coach-Led)',
    is_warm_up: false,
    exercises: [
      { lib: 'Technical Session (Coach-Led, Spain)', ptype: 'time', sets: 1, reps: 'Block',
        target: 'Content set by Spain coach · log RPE + duration after' },
    ],
  };

  // ── 1. Daily Dissociation Circuit ─────────────────────────────────
  const dissociation = await makeSession(
    'Daily Dissociation · AM',
    '10 min every morning, two rounds. Most important piece of the block — pattern consolidation needs frequency.',
    [
      { name: 'Pelvis–Femur Dissociation · 2 rounds', is_warm_up: false, exercises: [
        { lib: 'Bear Crawl Hip Slides',                ptype: 'reps_only', sets: 2, reps: '6/side',  target: 'Pelvis square' },
        { lib: 'Wall March',                           ptype: 'reps_only', sets: 2, reps: '5/side',  target: 'Drive femur to 90°' },
        { lib: 'Glute Bridge with March',              ptype: 'reps_only', sets: 2, reps: '6/side' },
        { lib: 'Half-Kneeling Hip Flexor with Reach',  ptype: 'reps_only', sets: 2, reps: '5/side' },
        { lib: 'Supine ASLR with Band',                ptype: 'reps_only', sets: 2, reps: '6/leg' },
        { lib: 'Dead Bug into Hip Flexion Hold',       ptype: 'reps_only', sets: 2, reps: '5/leg',   target: '3s hold' },
        { lib: 'Adductor Rock Back',                   ptype: 'reps_only', sets: 2, reps: '8/side' },
        { lib: 'T-Spine Rotation',                     ptype: 'reps_only', sets: 2, reps: '6/side' },
      ]},
    ],
  );

  // ── 2. Technical Day A · Acceleration ─────────────────────────────
  const technicalA = await makeSession(
    'Technical Day A · Acceleration',
    'Monday. RAMP (8 min) + Acceleration focus block (12 min) + technical with coach. Walk-back recovery throughout.',
    [
      RAMP_SECTION,
      { name: 'Acceleration Focus · 12 min', is_warm_up: false, exercises: [
        { lib: 'Triple Hops',           ptype: 'reps_only', sets: 2, reps: '3/side', target: 'Stick landings' },
        { lib: '10m Accel',             ptype: 'reps_only', sets: 1, reps: '4',      target: 'Walk-back', rest: 60 },
        { lib: 'Varied Position Accel', ptype: 'reps_only', sets: 1, reps: '4',      target: '2 side-on + 2 spin-and-accel', rest: 60 },
      ]},
      TECHNICAL_PLACEHOLDER,
    ],
  );

  // ── 3. Technical Day B · Max Velocity ─────────────────────────────
  const technicalB = await makeSession(
    'Technical Day B · Max Velocity · AM',
    'Tuesday morning. RAMP + Max V focus + technical with coach. Gym 1 (Strength) follows in the evening — separate by 4-6h+.',
    [
      RAMP_SECTION,
      { name: 'Max Velocity Focus · 12 min', is_warm_up: false, exercises: [
        { lib: 'A-Switches',                  ptype: 'reps_only', sets: 2, reps: '8/side' },
        { lib: 'Single-Leg A-Skip',           ptype: 'reps_only', sets: 2, reps: '15m/side' },
        { lib: 'Boom Boom (Straight-Leg Run)', ptype: 'reps_only', sets: 2, reps: '20m' },
        { lib: 'Sprint 40m',                  ptype: 'reps_only', sets: 3, reps: '40m', target: 'Max · walk-back', rest: 180 },
      ]},
      TECHNICAL_PLACEHOLDER,
    ],
  );

  // ── 4. Technical Day C · Decel + COD ──────────────────────────────
  const technicalC = await makeSession(
    'Technical Day C · Decel + COD · PM',
    'Thursday evening (Gym 2 Power runs AM). RAMP + Decel/COD focus + technical with coach.',
    [
      RAMP_SECTION,
      { name: 'Decel + COD Focus · 12 min', is_warm_up: false, exercises: [
        { lib: 'Jump Out & Back',        ptype: 'reps_only', sets: 2, reps: '5',    target: 'Stick landings' },
        { lib: 'Decel to Base',          ptype: 'reps_only', sets: 3, reps: '10m',  target: 'Walk-back', rest: 60 },
        { lib: 'Decel to Split',         ptype: 'reps_only', sets: 3, reps: '10m',  target: 'Walk-back', rest: 60 },
        { lib: 'Max Decel to Pushback',  ptype: 'reps_only', sets: 3, reps: '20m',  target: 'Walk-back', rest: 90 },
      ]},
      TECHNICAL_PLACEHOLDER,
    ],
  );

  // ── 5. Technical Friday · Coach-Led (no focus block) ──────────────
  const technicalFri = await makeSession(
    'Technical Friday · Coach-Led',
    'Friday. Solely technical — no physical focus block, no gym. Content set by Spain coach. Log RPE + duration after.',
    [
      { name: 'Technical Session', is_warm_up: false, exercises: [
        { lib: 'Technical Session (Coach-Led, Spain)', ptype: 'time', sets: 1, reps: 'Block',
          target: 'Friday is solely technical' },
      ]},
    ],
  );

  // ── 6. Gym 1 · Full Body Strength (Tue PM) ────────────────────────
  const gym1 = await makeSession(
    'Gym 1 · Full Body Strength · PM',
    'Tuesday PM (after technical AM). ~60 min. RPE 7 throughout — maintenance, not progression. Hits bilateral deceleration deficit (forward lunge) + bilateral Fmax (trap-bar).',
    [
      { name: 'Activation · 5 min · Dissociation focus', is_warm_up: true, exercises: [
        { lib: 'Bear Crawl Hip Slides', ptype: 'reps_only', sets: 2, reps: '6/side', target: 'Pelvis square · slide knee' },
        { lib: 'Wall March',            ptype: 'reps_only', sets: 2, reps: '5/side', target: 'Pelvis level' },
        { lib: 'Step-Up March',         ptype: 'reps_only', sets: 2, reps: '5/side', target: 'Slow, full hip flexion' },
      ]},
      { name: 'Main · 45 min', is_warm_up: false, exercises: [
        { lib: 'Trap Bar Deadlift',                ptype: 'rpe', sets: 4, reps: '4',     target: 'RPE 7 · drive the floor away', rest: 150 },
        { lib: 'Barbell Forward Lunge',            ptype: 'rpe', sets: 3, reps: '5/side', target: 'RPE 7 · decel into front leg', rest: 120 },
        { lib: 'Single-Leg RDL',                   ptype: 'rpe', sets: 3, reps: '6/side', target: 'RPE 7 · pelvis square',         rest: 90 },
        { lib: 'Weighted Chin-Up',                 ptype: 'reps_only', sets: 3, reps: '6', target: 'Full range, controlled' },
        { lib: 'Half-Kneeling DB Shoulder Press',  ptype: 'rpe', sets: 3, reps: '6/arm',  target: 'RPE 7 · ribs down',             rest: 90 },
      ]},
      { name: 'Finisher · 8 min', is_warm_up: false, exercises: [
        { lib: 'Side Plank with Hip Abduction', ptype: 'reps_only', sets: 3, reps: '8/side', target: 'Hips high' },
        { lib: 'Pallof Press (one leg)',        ptype: 'reps_only', sets: 3, reps: '10/leg' },
      ]},
    ],
  );

  // ── 7. Gym 2 · Full Body Power (Thu AM) ───────────────────────────
  const gym2 = await makeSession(
    'Gym 2 · Full Body Power · AM',
    'Thursday AM (before technical PM). ~60 min. Trap-bar jump as headline power piece — explosive triple-extension, lower technical risk than a clean. Lands on fresh CNS.',
    [
      { name: 'Activation · 5 min · Dissociation focus', is_warm_up: true, exercises: [
        { lib: 'Bear Crawl Hip Slides',  ptype: 'reps_only', sets: 2, reps: '6/side' },
        { lib: 'Wall March',             ptype: 'reps_only', sets: 2, reps: '5/side' },
        { lib: 'Glute Bridge with March', ptype: 'reps_only', sets: 2, reps: '6/side', target: 'Hips locked, march without dropping' },
      ]},
      { name: 'Power / SSC · 8 min · Fresh', is_warm_up: false, exercises: [
        { lib: 'Trap-Bar Jump', ptype: 'reps_only', sets: 4, reps: '3', target: 'Explosive · full reset between reps', rest: 150 },
      ]},
      { name: 'Main · 38 min', is_warm_up: false, exercises: [
        { lib: 'Front Squat',          ptype: 'rpe', sets: 3, reps: '5',     target: 'RPE 7 · controlled descent',  rest: 150 },
        { lib: 'Single-Leg Hip Thrust', ptype: 'reps_only', sets: 3, reps: '8/side', target: 'Pelvis level, drive the heel' },
        { lib: 'DB Bench Press',       ptype: 'rpe', sets: 3, reps: '8',     target: 'RPE 7 · controlled tempo',     rest: 90 },
        { lib: 'Single-Arm DB Row',    ptype: 'rpe', sets: 3, reps: '8/side', target: 'RPE 7 · brace the trunk',      rest: 90 },
      ]},
      { name: 'Finisher · 8 min', is_warm_up: false, exercises: [
        { lib: 'Side Plank with Hip Abduction', ptype: 'reps_only', sets: 3, reps: '8/side' },
        { lib: 'Pallof Press (one leg)',        ptype: 'reps_only', sets: 3, reps: '10/leg' },
      ]},
    ],
  );

  // ── Schedule ──────────────────────────────────────────────────────
  // Week 1: Mon 29 Jun → Sun 5 Jul
  // Week 2: Mon 6 Jul → Sun 12 Jul
  const addDays = (iso, n) => {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const weeks = [
    { wk: 1, mon: '2026-06-29' },
    { wk: 2, mon: '2026-07-06' },
  ];

  const schedule = [];
  for (const w of weeks) {
    const day = (offset) => addDays(w.mon, offset);
    // Mon · technical A + dissociation
    schedule.push({ wk: w.wk, date: day(0), bs: dissociation });
    schedule.push({ wk: w.wk, date: day(0), bs: technicalA   });
    // Tue · technical B AM + dissociation + Gym 1 PM
    schedule.push({ wk: w.wk, date: day(1), bs: dissociation });
    schedule.push({ wk: w.wk, date: day(1), bs: technicalB   });
    schedule.push({ wk: w.wk, date: day(1), bs: gym1         });
    // Wed · low day, just dissociation
    schedule.push({ wk: w.wk, date: day(2), bs: dissociation });
    // Thu · Gym 2 AM + dissociation + technical C PM
    schedule.push({ wk: w.wk, date: day(3), bs: dissociation });
    schedule.push({ wk: w.wk, date: day(3), bs: gym2         });
    schedule.push({ wk: w.wk, date: day(3), bs: technicalC   });
    // Fri · technical only + dissociation (user: leave Friday solely technical)
    schedule.push({ wk: w.wk, date: day(4), bs: dissociation });
    schedule.push({ wk: w.wk, date: day(4), bs: technicalFri });
    // Sat · low day, just dissociation
    schedule.push({ wk: w.wk, date: day(5), bs: dissociation });
    // Sun · low day, just dissociation
    schedule.push({ wk: w.wk, date: day(6), bs: dissociation });
  }

  for (const slot of schedule) {
    await c.query(
      `INSERT INTO planned_sessions
         (athlete_id, block_id, block_session_id, week_number, planned_date, status)
       VALUES ($1,$2,$3,$4,$5,'planned')`,
      [ATHLETE_ID, blockId, slot.bs, slot.wk, slot.date],
    );
  }
  console.log(`  ${schedule.length} planned_sessions scheduled`);

  await c.query('COMMIT');
  console.log(`\n✓ Block seeded for Feliciano: "${BLOCK_NAME}" (id=${blockId})`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('Seed failed:', e);
  process.exit(1);
} finally {
  await c.end();
}
