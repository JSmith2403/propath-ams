/**
 * When was a photo taken? Used when an athlete picks photos from their library at the end of the day:
 * the time suggests which meal each one was, and the date says which day it belongs to.
 *
 * JPEG photos carry the capture time inside (EXIF "DateTimeOriginal"); we read it straight from the file's
 * first bytes. If there isn't one (a screenshot, a photo with the data stripped), the file's own modified
 * time is the next best thing.
 */

const EXIF_DATE = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/;
const TAG = { exifPointer: 0x8769, dateOriginal: 0x9003, dateDigitized: 0x9004, dateTime: 0x0132 };

function readTiff(b, t) {
  const le = b[t] === 0x49;                                    // 'II' little-endian, 'MM' big-endian
  const u16 = (o) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const u32 = (o) => (le
    ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 16777216
    : b[o] * 16777216 + ((b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]));
  if (u16(t + 2) !== 42) return null;

  const entries = (ifd) => {
    const out = {};
    const n = u16(t + ifd);
    for (let i = 0; i < n; i += 1) {
      const e = t + ifd + 2 + i * 12;
      if (e + 12 > b.length) break;
      out[u16(e)] = { count: u32(e + 4), valueAt: e + 8 };
    }
    return out;
  };
  const text = (entry) => {
    const off = entry.count > 4 ? t + u32(entry.valueAt) : entry.valueAt;
    if (off + entry.count > b.length) return null;
    return String.fromCharCode(...b.slice(off, off + entry.count - 1));
  };

  const ifd0 = entries(u32(t + 4));
  const exif = ifd0[TAG.exifPointer] ? entries(u32(ifd0[TAG.exifPointer].valueAt)) : {};
  const entry = exif[TAG.dateOriginal] || exif[TAG.dateDigitized] || ifd0[TAG.dateTime];
  const m = entry && text(entry) ? EXIF_DATE.exec(text(entry)) : null;
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number);
  return new Date(y, mo - 1, d, h, mi, s);                      // the camera's local time
}

/** EXIF capture time from the first bytes of a JPEG, or null. */
export function exifDate(bytes) {
  try {
    const b = bytes;
    if (b[0] !== 0xff || b[1] !== 0xd8) return null;
    let p = 2;
    while (p + 4 < b.length) {
      if (b[p] !== 0xff) return null;
      const marker = b[p + 1];
      if (marker === 0xda) return null;                         // start of image data: no EXIF before it
      const len = (b[p + 2] << 8) | b[p + 3];
      if (marker === 0xe1 && b[p + 4] === 0x45 && b[p + 5] === 0x78 && b[p + 6] === 0x69 && b[p + 7] === 0x66) {
        return readTiff(b, p + 10);
      }
      p += 2 + len;
    }
  } catch { /* malformed: fall through */ }
  return null;
}

/** When the photo was taken: EXIF if present, else the file's modified time, else null. */
export async function photoTakenAt(file) {
  try {
    const bytes = new Uint8Array(await file.slice(0, 131072).arrayBuffer());
    const d = exifDate(bytes);
    if (d && !Number.isNaN(d.getTime())) return d;
  } catch { /* unreadable: use the modified time */ }
  return file?.lastModified ? new Date(file.lastModified) : null;
}

/** A guess at which meal a photo is from its time of day: breakfast, lunch, snack or dinner. */
export function suggestMealType(date) {
  if (!date) return 'breakfast';
  const h = date.getHours() + date.getMinutes() / 60;
  if (h < 10.5) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 17.5) return 'snack';
  return 'dinner';
}

/** YYYY-MM-DD in local time. */
export const localISO = (d) => d.toLocaleDateString('en-CA');

/**
 * Which day should a photo be logged against? Its own day if that is today or the day before (the end-of-day and
 * next-morning cases), otherwise the day being viewed.
 */
export function defaultLogDate(taken, todayISO, fallbackISO) {
  if (!taken) return fallbackISO;
  const day = localISO(taken);
  const yesterday = new Date(`${todayISO}T12:00:00`); yesterday.setDate(yesterday.getDate() - 1);
  return day === todayISO || day === localISO(yesterday) ? day : fallbackISO;
}
