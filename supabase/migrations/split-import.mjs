// One-shot script: split the 17K-line exercise library import into
// chunked SQL files small enough for the Supabase SQL editor to paste.
// Each row uses ON CONFLICT (name) DO UPDATE so the chunks are
// independently safe to apply in any order, and re-running is cheap.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC       = path.join(__dirname, 'exercise-library-import-2026-04-30.sql');
const OUT_DIR   = path.join(__dirname, 'exercise-library-import-chunks');
const NUM_CHUNKS = 5;

fs.mkdirSync(OUT_DIR, { recursive: true });

const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const beginIdx  = lines.findIndex(l => l.trim() === 'BEGIN;');
const commitIdx = lines.findIndex(l => l.trim() === 'COMMIT;');
if (beginIdx < 0 || commitIdx < 0) throw new Error('BEGIN/COMMIT not found');

const insertStarts = lines
  .map((l, i) => l.startsWith('INSERT INTO exercise_library') ? i : -1)
  .filter(i => i >= 0);

const total = insertStarts.length;
const perChunk = Math.ceil(total / NUM_CHUNKS);

console.log(`Source: ${SRC}`);
console.log(`${total} INSERT statements found.`);
console.log(`Splitting into ${NUM_CHUNKS} chunks of ~${perChunk}.`);

for (let c = 0; c < NUM_CHUNKS; c++) {
  const startInsert = c * perChunk;
  const endInsert   = Math.min(startInsert + perChunk, total);
  if (startInsert >= total) break;

  const startLine = insertStarts[startInsert];
  const endLine   = endInsert < total ? insertStarts[endInsert] : commitIdx;
  const body = lines.slice(startLine, endLine).join('\n');

  const header =
    `-- Brief 5c exercise library import — chunk ${c+1}/${NUM_CHUNKS}\n` +
    `-- Source: exercise-library-import-2026-04-30.sql\n` +
    `-- Inserts ${startInsert + 1}-${endInsert} of ${total}.\n` +
    `-- Idempotent: every row uses ON CONFLICT (name) DO UPDATE.\n\n` +
    `BEGIN;\n\n`;
  const footer = `\nCOMMIT;\n`;

  const outPath = path.join(OUT_DIR, `import-chunk-${String(c+1).padStart(2,'0')}.sql`);
  fs.writeFileSync(outPath, header + body + footer);
  console.log(`  ${outPath} — inserts ${startInsert+1}-${endInsert}, ${endLine-startLine} content lines`);
}
