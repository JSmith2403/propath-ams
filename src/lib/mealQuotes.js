import { supabase } from './supabase';

const LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', drink: 'Drink', snack_1: 'Snack', snack_2: 'Snack', snack_3: 'Snack' };
export const mealLabel = (type) => LABELS[type] || 'Meal';

/** "Today", "Yesterday" or "Tue 4 Nov" for a YYYY-MM-DD log date. */
export function mealDayLabel(logDate, now = new Date()) {
  if (!logDate) return '';
  const today = now.toLocaleDateString('en-CA');
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (logDate === today) return 'Today';
  if (logDate === y.toLocaleDateString('en-CA')) return 'Yesterday';
  return new Date(`${logDate}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * For messages that reply to a meal: look the meals up so the chat can show them as a quote, WhatsApp style
 * (the meal's photo, what it was and when). Returns Map(entryId → { label, day, text, thumb, full }).
 * Anything that can't be read (deleted meal, no access) is simply left out, and the message shows without a quote.
 */
export async function loadMealQuotes(entryIds) {
  const ids = [...new Set((entryIds || []).filter(Boolean))];
  const out = new Map();
  if (!ids.length) return out;
  const { data, error } = await supabase.from('meal_entries')
    .select('id, meal_type, log_date, description, meal_photos ( storage_path, thumbnail_path )')
    .in('id', ids);
  if (error || !data) return out;

  const paths = [...new Set(data.flatMap(e => (e.meal_photos || []).slice(0, 1).flatMap(p => [p.thumbnail_path || p.storage_path, p.storage_path])).filter(Boolean))];
  const signed = {};
  if (paths.length) {
    const { data: urls } = await supabase.storage.from('meal-photos').createSignedUrls(paths, 3600);
    (urls || []).forEach((u, i) => { if (u?.signedUrl) signed[paths[i]] = u.signedUrl; });
  }
  data.forEach(e => {
    const photo = (e.meal_photos || [])[0];
    out.set(e.id, {
      label: mealLabel(e.meal_type),
      day: mealDayLabel(e.log_date),
      text: e.description || null,
      thumb: photo ? signed[photo.thumbnail_path || photo.storage_path] || null : null,
      full: photo ? signed[photo.storage_path] || null : null,
    });
  });
  return out;
}

/**
 * An athlete's recent meals (last `days` days, oldest first) with a photo link each, for showing them in the
 * conversation as the athlete's own photo messages. → [{ id, submittedAt, label, day, text, thumb, full }]
 */
export async function loadRecentMeals(athleteId, days = 14) {
  if (!athleteId) return [];
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await supabase.from('meal_entries')
    .select('id, meal_type, log_date, description, submitted_at, meal_photos ( storage_path, thumbnail_path )')
    .eq('athlete_id', athleteId).gte('submitted_at', since)
    .order('submitted_at', { ascending: true }).limit(120);
  if (error || !data) return [];
  const paths = [...new Set(data.flatMap(e => (e.meal_photos || []).slice(0, 1).flatMap(p => [p.thumbnail_path || p.storage_path, p.storage_path])).filter(Boolean))];
  const signed = {};
  if (paths.length) {
    const { data: urls } = await supabase.storage.from('meal-photos').createSignedUrls(paths, 3600);
    (urls || []).forEach((u, i) => { if (u?.signedUrl) signed[paths[i]] = u.signedUrl; });
  }
  return data.map(e => {
    const p = (e.meal_photos || [])[0];
    return {
      id: e.id, submittedAt: e.submitted_at, label: mealLabel(e.meal_type), day: mealDayLabel(e.log_date), text: e.description || null,
      thumb: p ? signed[p.thumbnail_path || p.storage_path] || null : null, full: p ? signed[p.storage_path] || null : null,
    };
  });
}
