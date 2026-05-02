#!/usr/bin/env node
/**
 * Generate the PWA / iOS / favicon icon sizes from the two source PNGs
 * in the repo root. Output goes to public/icons/.
 *
 * Run with:  node scripts/generate-pwa-icons.mjs
 *
 * Idempotent — overwrites existing outputs.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const out  = resolve(root, 'public', 'icons');
mkdirSync(out, { recursive: true });

const standardSrc  = resolve(root, 'propath-icon-1024.png');
const maskableSrc  = resolve(root, 'propath-icon-maskable-1024.png');

if (!existsSync(standardSrc) || !existsSync(maskableSrc)) {
  console.error('❌ Missing source PNGs. Expected:');
  console.error('   ' + standardSrc);
  console.error('   ' + maskableSrc);
  process.exit(1);
}

// [src, name, size]
const targets = [
  [standardSrc, 'icon-192.png',              192],
  [standardSrc, 'icon-512.png',              512],
  [standardSrc, 'apple-touch-icon-180.png',  180],
  [standardSrc, 'apple-touch-icon-167.png',  167],
  [standardSrc, 'apple-touch-icon-152.png',  152],
  [standardSrc, 'favicon-32.png',             32],
  [standardSrc, 'favicon-16.png',             16],
  [maskableSrc, 'icon-maskable-192.png',     192],
  [maskableSrc, 'icon-maskable-512.png',     512],
];

for (const [src, name, size] of targets) {
  const dst = resolve(out, name);
  await sharp(src)
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(dst);
  console.log(`✓ ${name}  (${size}×${size})`);
}

console.log(`\n✅ Wrote ${targets.length} icons to public/icons/`);
