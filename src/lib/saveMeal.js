import { supabase } from './supabase';

const SNACK_SLOTS = ['snack_1', 'snack_2', 'snack_3'];

/** Which meal types are already logged on each of these days? → Map(date → Set(meal_type)). */
export async function usedMealTypes(athleteId, dates) {
  const out = new Map(dates.map(d => [d, new Set()]));
  if (!dates.length) return out;
  const { data } = await supabase.from('meal_entries').select('log_date, meal_type').eq('athlete_id', athleteId).in('log_date', dates);
  (data || []).forEach(r => out.get(r.log_date)?.add(r.meal_type));
  return out;
}

/** The first snack slot not in `used` (a Set of meal types), or null when all three are taken. */
export const freeSnackSlot = (used) => SNACK_SLOTS.find(s => !used.has(s)) || null;

/**
 * Saves one meal: the entry (a database trigger records "submitted") then each photo into the meal-photos area.
 * photos: [{ blob, width, height }]. → { ok: true } or { ok: false, error }.
 */
export async function saveMeal({ athleteId, logDate, mealType, description, notes, photos = [] }) {
  const { data: entry, error: entryErr } = await supabase.from('meal_entries')
    .insert({
      athlete_id: athleteId, log_date: logDate, meal_type: mealType,
      description: description?.trim() || null, notes: notes?.trim() || null, source: 'mobile_app',
    })
    .select('id').single();
  if (entryErr) return { ok: false, error: entryErr.message || 'Submit failed.' };

  for (const p of photos) {
    const storagePath = `${athleteId}/${entry.id}/${crypto.randomUUID()}.jpg`;
    const { error: upErr } = await supabase.storage.from('meal-photos')
      .upload(storagePath, p.blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
    if (upErr) return { ok: false, error: `Upload failed: ${upErr.message}` };
    const { error: photoErr } = await supabase.from('meal_photos')
      .insert({ entry_id: entry.id, storage_path: storagePath, width: p.width, height: p.height });
    if (photoErr) return { ok: false, error: `Photo save failed: ${photoErr.message}` };
  }
  return { ok: true };
}
