#!/usr/bin/env node
/**
 * Tighten Sara's wrist toolkit to the four exercises the coach asked
 * for, and remove the "skip without guilt" line from Session C notes.
 *
 *   PGPASSWORD=… node backups/.tools/update-sara-wrist-toolkit.mjs
 *
 * Wrist toolkit (per coach):
 *   1. Kettlebell Arm Wrestle           — NEW
 *   2. Barbell Wrist Extension Rotation — rename of "Wrist Extension Rotation"
 *   3. Reverse Grip Barbell Row         — rename of "Reverse Grip Row"
 *   4. Isometric Barbell Bar Hold       — rename of "Isometric Bar Hold"
 *
 * Sessions rotate through them so she hits every exercise in a week:
 *   A  Barbell Wrist Extension Rotation + Isometric Barbell Bar Hold
 *   B  Reverse Grip Barbell Row         + Kettlebell Arm Wrestle
 *   C  Isometric Barbell Bar Hold       + Barbell Wrist Extension Rotation
 *
 * The previous wrist-extension and bar-hold rows on Sara's blocks
 * already point at the renamed library entries, so renaming the library
 * row also updates how they appear on her calendar — zero re-seeding
 * needed for those. The only structural change is adding Kettlebell
 * Arm Wrestle as a new session_exercise on Session B's wrist finisher
 * (replacing the existing Wrist Extension Rotation slot there).
 */

import pg from 'pg';

const ATHLETE_ID = 'ef6';

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com', port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop', password: process.env.PGPASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});

await c.connect();
await c.query('BEGIN');

try {
  // ── 1. Rename existing wrist exercises + correct equipment ────────
  const RENAMES = [
    {
      from: 'Wrist Extension Rotation',
      to:   'Barbell Wrist Extension Rotation',
      eq:   ['barbell'],
      notes: 'Loaded bar in both hands, roll a loaded bar through full wrist extension + supination. 3 working sets.',
    },
    {
      from: 'Reverse Grip Row',
      to:   'Reverse Grip Barbell Row',
      eq:   ['barbell'],
      notes: 'Underhand barbell row. Light to moderate, controlled, full ROM. Targets the wrist/forearm in the pulling pattern.',
    },
    {
      from: 'Isometric Bar Hold',
      to:   'Isometric Barbell Bar Hold',
      eq:   ['barbell'],
      notes: 'Hold a loaded barbell at lockout / partial position. 20s holds. Builds grip + wrist iso strength.',
    },
  ];
  for (const r of RENAMES) {
    const upd = await c.query(
      `UPDATE exercise_library
         SET name = $1, equipment = $2::text[], notes = $3, updated_at = now()
       WHERE LOWER(name) = LOWER($4)
       RETURNING id, name`,
      [r.to, r.eq, r.notes, r.from],
    );
    if (upd.rowCount) console.log(`  ✏  ${r.from}  →  ${r.to}`);
    else              console.log(`  ⏭  ${r.from} not found — already renamed?`);
  }

  // ── 2. Kettlebell Arm Wrestle (new) ───────────────────────────────
  let kbId;
  const probe = await c.query(
    "SELECT id FROM exercise_library WHERE LOWER(name) = LOWER('Kettlebell Arm Wrestle') LIMIT 1",
  );
  if (probe.rows.length) {
    kbId = probe.rows[0].id;
    console.log('  ⏭  Kettlebell Arm Wrestle already exists');
  } else {
    const ins = await c.query(
      `INSERT INTO exercise_library
         (name, category, movement_patterns, bilateral_unilateral, equipment, is_active, notes)
       VALUES ('Kettlebell Arm Wrestle',
               'strength',
               ARRAY['core_rotation'],
               'unilateral',
               ARRAY['kettlebell'],
               true,
               'Lying or kneeling, kettlebell held in the arm-wrestle position, lower under control and drive back to vertical. Wrist + forearm specific.')
       RETURNING id`,
    );
    kbId = ins.rows[0].id;
    console.log(`  ➕ Kettlebell Arm Wrestle (${kbId})`);
  }

  // ── 3. Sara's block + Session B wrist finisher swap ───────────────
  const blk = await c.query(
    "SELECT id FROM training_blocks WHERE athlete_id = $1 AND block_name ILIKE '%Rolling Strength%' LIMIT 1",
    [ATHLETE_ID],
  );
  if (!blk.rows.length) throw new Error('Sara\'s Rolling Strength block not found');
  const blockId = blk.rows[0].id;

  // Find Session B
  const bs = await c.query(
    "SELECT id FROM block_sessions WHERE block_id = $1 AND session_name ILIKE 'Session B%' LIMIT 1",
    [blockId],
  );
  if (!bs.rows.length) throw new Error('Session B not found');
  const sessBId = bs.rows[0].id;

  // Find the wrist-finisher section on Session B
  const sec = await c.query(
    "SELECT id FROM session_sections WHERE block_session_id = $1 AND name ILIKE '%Wrist%' LIMIT 1",
    [sessBId],
  );
  if (!sec.rows.length) throw new Error('Wrist finisher section not found on Session B');
  const sectionId = sec.rows[0].id;

  // On Session B, replace the second wrist exercise (Barbell Wrist
  // Extension Rotation appears in both A and B) with Kettlebell Arm
  // Wrestle so Sara still cycles through all four across the week
  // without doubling up rotation in a single session.
  const extRotId = (await c.query(
    "SELECT id FROM exercise_library WHERE LOWER(name) = LOWER('Barbell Wrist Extension Rotation') LIMIT 1",
  )).rows[0].id;

  const swap = await c.query(
    `UPDATE session_exercises
       SET exercise_id = $1, notes = $2, updated_at = now()
     WHERE section_id = $3 AND exercise_id = $4
     RETURNING id`,
    [
      kbId,
      'Lying or kneeling KB arm-wrestle. Wrist + forearm specific. 3 × 8/side.',
      sectionId,
      extRotId,
    ],
  );
  if (swap.rowCount) {
    console.log(`  🔁 Session B wrist finisher: Barbell Wrist Extension Rotation → Kettlebell Arm Wrestle`);
    // Update the prescription reps for the swapped row across all 6 weeks
    await c.query(
      `UPDATE exercise_week_prescriptions
         SET sets = 3, reps = '8/side', updated_at = now()
       WHERE session_exercise_id = $1`,
      [swap.rows[0].id],
    );
  } else {
    console.log('  ⚠  Session B wrist finisher already has Kettlebell Arm Wrestle');
  }

  // ── 4. Remove "skip without guilt" from Session C coach notes ─────
  const newC = `Saturdays — nice-to-have. Lateral power + repetition of the squat and hip patterns + horizontal pull.`;
  const updC = await c.query(
    `UPDATE block_sessions
       SET coach_notes = $1, updated_at = now()
     WHERE block_id = $2 AND session_name ILIKE 'Session C%'
     RETURNING id`,
    [newC, blockId],
  );
  if (updC.rowCount) console.log(`  ✏  Session C notes updated (removed "skip without guilt")`);
  else               console.log('  ⏭  Session C not found');

  await c.query('COMMIT');
  console.log('\n✓ Done — Sara\'s wrist toolkit is the four named exercises; Session C copy tightened.');
} catch (e) {
  await c.query('ROLLBACK');
  console.error('Update failed:', e);
  process.exit(1);
} finally {
  await c.end();
}
