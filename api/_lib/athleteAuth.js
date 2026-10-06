// Shared helpers for the athlete-auth endpoints (api/athlete-auth/*).
// Athletes authenticate via real Supabase Auth now (same mechanism as
// staff) — a synthetic email nobody ever emails to, real password
// (their PIN). See athlete-real-auth-2026-09-01.sql for why the
// earlier custom session/PIN table approach was replaced.

import { createClient } from '@supabase/supabase-js';
import { randomInt, randomBytes, createHash, timingSafeEqual } from 'node:crypto';

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

/** A long random password nobody ever sees. New athlete accounts start with
 *  one of these so they can't be signed into until the athlete sets their own
 *  password through the code-approval flow (see request-setup.js). */
export function unknownPassword() {
  return randomBytes(32).toString('base64url');
}

/** 6-digit code shown on the athlete's screen and read out to a coach. */
export function generateSetupCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashClaim(token) {
  return createHash('sha256').update(String(token || '')).digest('hex');
}

export function claimMatches(token, expectedHash) {
  const a = Buffer.from(hashClaim(token), 'hex');
  const b = Buffer.from(String(expectedHash || ''), 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Finds the auth user for an athlete username (the synthetic email), or
 *  null. supabase-js has no get-by-email, so page through the user list. */
export async function findAthleteAuthUser(admin, username) {
  const email = `${sanitizeUsername(username)}@${ATHLETE_EMAIL_DOMAIN}`;
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const hit = (data?.users || []).find(u => (u.email || '').toLowerCase() === email);
    if (hit) return hit;
    if (!data?.users || data.users.length < 200) return null;
  }
  return null;
}

/** "Zach Pitman" → "zach.pitman" (falls back to "athlete"). */
export function usernameFromName(name) {
  const parts = String(name || '').toLowerCase().split(/\s+/).map(p => p.replace(/[^a-z0-9]/g, '')).filter(Boolean);
  return sanitizeUsername(parts.join('.')) || 'athlete';
}

/** Verifies the caller is a coach (admin / co_admin) — a valid JWT alone
 *  isn't enough because athletes are real Supabase Auth users too. */
export async function isStaffUser(admin, userId) {
  const { data } = await admin.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
  return !!data && (data.role === 'admin' || data.role === 'co_admin');
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
