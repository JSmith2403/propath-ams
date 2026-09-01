// Shared helpers for the athlete-auth endpoints (api/athlete-auth/*).
// Athletes authenticate via real Supabase Auth now (same mechanism as
// staff) — a synthetic email nobody ever emails to, real password
// (their PIN). See athlete-real-auth-2026-09-01.sql for why the
// earlier custom session/PIN table approach was replaced.

import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey);
}

export const ATHLETE_EMAIL_DOMAIN = 'athletes.propath.internal';

export function sanitizeUsername(raw) {
  return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);
}

/** Name + DOB (DDMM) — e.g. "Pro Pathius" born 24 March → "ProPathius2403".
 *  A starting suggestion the athlete can still edit before saving. */
export function suggestUsername(name, dob) {
  const clean = String(name || '').replace(/[^a-zA-Z]/g, '');
  let suffix = '';
  if (dob) {
    const d = new Date(`${dob}T00:00:00`);
    if (!isNaN(d.getTime())) {
      suffix = String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0');
    }
  }
  return clean + suffix || null;
}

/**
 * Athlete display fields, matching the shape validate_athlete_token
 * (the original token-route RPC) already returns, so both entry
 * points feed AthleteAppShell identically.
 */
export async function loadAthleteDisplay(supabaseAdmin, athleteId) {
  const { data: athlete, error: aErr } = await supabaseAdmin
    .from('athletes')
    .select('data')
    .eq('id', athleteId)
    .maybeSingle();
  if (aErr || !athlete) return { ok: false, error: aErr?.message || 'Athlete not found.' };

  const { data: tokenRow } = await supabaseAdmin
    .from('athlete_app_tokens')
    .select('athlete_id')
    .eq('athlete_id', athleteId)
    .maybeSingle();

  let wellnessToken = null;
  if (tokenRow) {
    const { data: w } = await supabaseAdmin
      .from('wellness_tokens')
      .select('token')
      .eq('athlete_id', athleteId)
      .eq('is_active', true)
      .maybeSingle();
    wellnessToken = w?.token || null;
  }

  const d = athlete.data || {};
  return {
    ok: true,
    athlete: {
      athlete_id: athleteId,
      name: d.name || null,
      photo: d.photo || null,
      sport: d.sport || null,
      wellness_token: wellnessToken,
    },
  };
}
