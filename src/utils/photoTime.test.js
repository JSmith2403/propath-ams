import { describe, it, expect } from 'vitest';
import { exifDate, suggestMealType, defaultLogDate, photoTakenAt } from './photoTime';

// A tiny JPEG header carrying one EXIF DateTimeOriginal, big- or little-endian.
function jpegWithDate(str, { little = false } = {}) {
  const u16 = (n) => (little ? [n & 255, n >> 8] : [n >> 8, n & 255]);
  const u32 = (n) => (little ? [n & 255, (n >> 8) & 255, (n >> 16) & 255, n >>> 24] : [n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255]);
  const ascii = [...str].map(c => c.charCodeAt(0)).concat(0);
  // TIFF layout: header(8) | IFD0 (2 + 12 + 4) | Exif IFD (2 + 12 + 4) | string
  const ifd0At = 8, exifAt = 8 + 18, strAt = exifAt + 18;
  const tiff = [
    ...(little ? [0x49, 0x49] : [0x4d, 0x4d]), ...u16(42), ...u32(ifd0At),
    ...u16(1), ...u16(0x8769), ...u16(4), ...u32(1), ...u32(exifAt), ...u32(0),
    ...u16(1), ...u16(0x9003), ...u16(2), ...u32(ascii.length), ...u32(strAt), ...u32(0),
    ...ascii,
  ];
  const app1 = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const len = app1.length + 2;
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe1, len >> 8, len & 255, ...app1, 0xff, 0xda, 0, 0]);
}

describe('exifDate', () => {
  it('reads the capture time, big-endian and little-endian', () => {
    for (const little of [false, true]) {
      const d = exifDate(jpegWithDate('2026:11:10 08:15:30', { little }));
      expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([2026, 10, 10, 8, 15, 30]);
    }
  });
  it('returns null for non-JPEGs, junk and truncated files', () => {
    expect(exifDate(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    expect(exifDate(new Uint8Array([]))).toBeNull();
    expect(exifDate(jpegWithDate('2026:11:10 08:15:30').slice(0, 12))).toBeNull();
    expect(exifDate(jpegWithDate('not a date at all!!'))).toBeNull();
  });
});

describe('photoTakenAt', () => {
  it('prefers EXIF over the modified time, and falls back to the modified time', async () => {
    const withExif = new File([jpegWithDate('2026:11:10 12:40:00')], 'a.jpg', { lastModified: new Date(2026, 10, 11, 20, 0).getTime() });
    expect((await photoTakenAt(withExif)).getHours()).toBe(12);
    const plain = new File([new Uint8Array([1, 2, 3])], 'b.png', { lastModified: new Date(2026, 10, 11, 20, 0).getTime() });
    expect((await photoTakenAt(plain)).getHours()).toBe(20);
  });
});

describe('suggestMealType', () => {
  it('guesses from the time of day', () => {
    const at = (h, m = 0) => new Date(2026, 10, 10, h, m);
    expect([at(7, 30), at(10, 29), at(10, 30), at(13), at(16), at(17, 30), at(20)].map(suggestMealType))
      .toEqual(['breakfast', 'breakfast', 'lunch', 'lunch', 'snack', 'dinner', 'dinner']);
    expect(suggestMealType(null)).toBe('breakfast');
  });
});

describe('defaultLogDate', () => {
  it('uses the photo day if it is today or yesterday, else the day being viewed', () => {
    const today = '2026-11-10';
    expect(defaultLogDate(new Date(2026, 10, 10, 8), today, today)).toBe('2026-11-10');
    expect(defaultLogDate(new Date(2026, 10, 9, 21), today, today)).toBe('2026-11-09');
    expect(defaultLogDate(new Date(2026, 9, 1, 8), today, today)).toBe('2026-11-10');
    expect(defaultLogDate(null, today, today)).toBe('2026-11-10');
  });
});
