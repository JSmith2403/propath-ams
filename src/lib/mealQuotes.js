import { supabase } from './supabase';
import { mealDayLabel, mealLabel } from '../utils/mealLabels';

// Label helpers live in utils/mealLabels.js (no database import, so they can be unit tested).
export { mealLabel, mealDayLabel };

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
