#!/usr/bin/env node
/**
 * Import high-quality athlete photos from temp/athlete-photos/.
 *
 *   PGPASSWORD=… node backups/.tools/import-athlete-photos.mjs
 *
 * For each .jpg/.jpeg/.png/.webp in the input directory:
 *   1. Parse "First-Last.ext" filename into name tokens
 *   2. Fuzzy-match against athletes.data->>'name' (token containment +
 *      Levenshtein tiebreak; ignores spelling diffs like Alsheshhi vs
 *      Alshehhi). Skip + warn if no good match.
 *   3. Run through sharp: top-center 1:1 crop, resize to 1024×1024
 *      (lanczos3), JPEG quality 92, mozjpeg.
 *   4. Base64-encode + write to athletes.data.photo on LIVE.
 *   5. Print a one-line summary per athlete + a final report.
 *
 * Safe to re-run — last write wins for any athlete already imported.
 */

import pg from 'pg';
import sharp from 'sharp';
import { readdir, readFile } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const INPUT_DIR = 'C:/Users/jonah/Desktop/propath-ams/temp/athlete-photos';
const TARGET_PX = 1024;
const QUALITY   = 92;

const c = new pg.Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com', port: 5432,
  user: 'postgres.xaawuxckpztxuyywebop', password: process.env.PGPASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});

// ── Fuzzy matching helpers ────────────────────────────────────────────
function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function tokens(s) { return normalize(s).split(/\s+/).filter(Boolean); }

// Cheap edit distance — fine at the lengths we deal with here.
function lev(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[a.length][b.length];
}
// Token-level fuzzy: each filename token must have at least one athlete
// token within Lev distance ≤ 2 (allows Alsheshhi ↔ Alshehhi). Return a
// score = sum of (1 - dist / maxLen) per matched token; the best athlete
// is the highest score.
function matchScore(athleteName, fileTokens) {
  const aTokens = tokens(athleteName);
  if (!aTokens.length || !fileTokens.length) return 0;
  let score = 0;
  let bestSingleTokenScore = 0;
  for (const ft of fileTokens) {
    let bestForToken = -1;
    for (const at of aTokens) {
      const maxLen = Math.max(ft.length, at.length);
      const d = lev(ft, at);
      if (d > 2) continue;
      const tokenScore = 1 - d / Math.max(maxLen, 1);
      if (tokenScore > bestForToken) bestForToken = tokenScore;
    }
    if (bestForToken >= 0) {
      score += bestForToken;
      if (bestForToken > bestSingleTokenScore) bestSingleTokenScore = bestForToken;
    }
  }
  // Require at least one near-exact token match (≥0.8) to accept —
  // weeds out coincidental partial matches. Doesn't require ALL file
  // tokens match (file "Yassin-Ayman" vs DB "Yassin" still wins).
  return bestSingleTokenScore >= 0.8 ? score : 0;
}

await c.connect();

const athletes = (await c.query(
  "SELECT id, data->>'name' AS name FROM athletes ORDER BY data->>'name'"
)).rows;

const files = (await readdir(INPUT_DIR))
  .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

console.log(`Found ${files.length} image files vs ${athletes.length} athletes in AMS.\n`);

const report = { imported: [], skipped: [] };

for (const file of files) {
  const name = basename(file, extname(file));
  const ft = tokens(name);

  // Score every athlete; pick the best
  let best = null;
  for (const a of athletes) {
    const s = matchScore(a.name, ft);
    if (s > 0 && (!best || s > best.score)) best = { athlete: a, score: s };
  }

  if (!best) {
    console.log(`  ⏭  ${file.padEnd(28)} no athlete match — will skip`);
    report.skipped.push({ file, reason: 'no athlete match' });
    continue;
  }

  try {
    const buf = await readFile(join(INPUT_DIR, file));
    // Top-center 1:1 crop: take the centred square that starts at the top
    // of the image. sharp does this with extract after computing dims.
    const meta = await sharp(buf).metadata();
    const W = meta.width, H = meta.height;
    const side = Math.min(W, H);
    const left = Math.round((W - side) / 2);
    const top  = 0; // top-anchored

    const out = await sharp(buf)
      .extract({ left, top, width: side, height: side })
      .resize(TARGET_PX, TARGET_PX, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();

    const dataUrl = `data:image/jpeg;base64,${out.toString('base64')}`;

    await c.query(
      `UPDATE athletes
         SET data = jsonb_set(data, '{photo}', to_jsonb($1::text)),
             updated_at = now()
       WHERE id = $2`,
      [dataUrl, best.athlete.id],
    );

    console.log(
      `  ✓  ${file.padEnd(28)} → ${best.athlete.name.padEnd(22)} `
      + `(${best.athlete.id}) · ${Math.round(buf.length/1024)} KB → ${Math.round(out.length/1024)} KB`
    );
    report.imported.push({ file, athlete: best.athlete.name, id: best.athlete.id });
  } catch (e) {
    console.log(`  ✗  ${file.padEnd(28)} ${e.message}`);
    report.skipped.push({ file, reason: e.message });
  }
}

console.log(`\nImported: ${report.imported.length} · Skipped: ${report.skipped.length}`);
if (report.skipped.length) {
  console.log('\nSkipped:');
  report.skipped.forEach(s => console.log(`  · ${s.file} — ${s.reason}`));
}

await c.end();
