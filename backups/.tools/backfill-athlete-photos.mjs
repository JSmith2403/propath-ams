#!/usr/bin/env node
/**
 * Backfill athlete photos: upscale existing 400px JPEGs to 1024px
 * using Lanczos resampling + a touch of sharpen, then re-encode at
 * JPEG quality 92.
 *
 *   PGPASSWORD=… node backups/.tools/backfill-athlete-photos.mjs
 *
 * Honest caveat: this CANNOT restore detail that was never captured —
 * the original photos were crushed to 400×400 before we ever stored
 * them. What it does do is replace the browser's default upscale
 * (bilinear, which looks blocky on retina screens) with a high-quality
 * Lanczos3 upscale baked into the file. Combined with a mild sharpen,
 * the visible result is meaningfully smoother. For truly sharp photos,
 * re-upload the originals via the Camera button on the Overview tab.
 *
 * Idempotent: a 1024px photo is detected by file size > 100 KB and
 * skipped, so it's safe to re-run.
 */

import pg from 'pg';
import sharp from 'sharp';

const TARGET_PX     = 1024;
const QUALITY       = 92;
const SKIP_IF_BYTES = 100 * 1024; // ≥100 KB → already upscaled

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com', port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop', password: process.env.PGPASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});

function parseDataUrl(s) {
  const m = /^data:image\/(jpeg|jpg|png|webp);base64,(.*)$/i.exec(s || '');
  if (!m) return null;
  return { mime: m[1].toLowerCase(), buf: Buffer.from(m[2], 'base64') };
}

await c.connect();
const rows = await c.query(
  "SELECT id, data->>'name' AS name, data->>'photo' AS photo FROM athletes WHERE data->>'photo' IS NOT NULL ORDER BY data->>'name'"
);
console.log(`Found ${rows.rows.length} athletes with photos.\n`);

let upgraded = 0, skipped = 0, errors = 0;

for (const r of rows.rows) {
  const parsed = parseDataUrl(r.photo);
  if (!parsed) {
    console.log(`  ⏭  ${r.name?.padEnd(25)} unrecognised photo format`);
    skipped++;
    continue;
  }
  if (parsed.buf.length >= SKIP_IF_BYTES) {
    console.log(`  ⏭  ${r.name?.padEnd(25)} already large (${Math.round(parsed.buf.length/1024)} KB)`);
    skipped++;
    continue;
  }

  try {
    const out = await sharp(parsed.buf)
      .resize(TARGET_PX, TARGET_PX, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.6 })       // gentle re-sharpen after upscale
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();

    const newDataUrl = `data:image/jpeg;base64,${out.toString('base64')}`;

    await c.query(
      `UPDATE athletes
         SET data = jsonb_set(data, '{photo}', to_jsonb($1::text)),
             updated_at = now()
       WHERE id = $2`,
      [newDataUrl, r.id],
    );

    console.log(`  ✓  ${r.name?.padEnd(25)} ${Math.round(parsed.buf.length/1024)} KB → ${Math.round(out.length/1024)} KB`);
    upgraded++;
  } catch (e) {
    console.log(`  ✗  ${r.name?.padEnd(25)} ${e.message}`);
    errors++;
  }
}

console.log(`\nUpgraded: ${upgraded} · Skipped: ${skipped} · Errors: ${errors}`);
await c.end();
