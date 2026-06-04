/**
 * Tiny canvas-based image compressor. Keeps the dependency footprint
 * minimal — browser-image-compression is a popular pick but it ships
 * a worker bundle we don't need for our scale (≤ 4 photos at a time).
 *
 *   compress(file, { maxEdge, quality }) → Promise<Blob>
 *
 * Resizes the image so the longest edge is at most `maxEdge` px and
 * encodes as JPEG at the requested quality. EXIF orientation is
 * honoured via createImageBitmap's `imageOrientation: 'from-image'`
 * so portrait phone photos don't end up sideways.
 */
export async function compressImage(file, { maxEdge = 1600, quality = 0.8 } = {}) {
  if (!(file instanceof Blob)) throw new Error('compressImage: expected a File/Blob');

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (_) {
    // Older Safari versions don't support the option — fall back to
    // a plain Image load, which won't auto-rotate but still resizes.
    bitmap = await loadAsImage(file);
  }

  const { width: w0, height: h0 } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * scale));
  const h = Math.max(1, Math.round(h0 * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (typeof bitmap.close === 'function') bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null')),
      'image/jpeg',
      quality,
    );
  });
}

function loadAsImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

// Get image dimensions without the resize step — used to record
// width/height alongside the storage path.
export async function imageSize(blob) {
  try {
    const bitmap = await createImageBitmap(blob);
    const out = { width: bitmap.width, height: bitmap.height };
    if (typeof bitmap.close === 'function') bitmap.close();
    return out;
  } catch (_) {
    const img = await loadAsImage(blob);
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
}
