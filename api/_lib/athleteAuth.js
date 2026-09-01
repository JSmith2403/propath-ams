// Shared helpers for the athlete PIN-login endpoints (api/athlete-auth/*).
//
// PINs are hashed with Node's built-in crypto.scrypt (no new dependency
// for a 4-digit PIN) — a random salt per credential, timing-safe compare.
// Session tokens are opaque crypto.randomUUID() bearer values stored in
// athlete_sessions; there's no expiry yet (matches the existing "permanent
// link" trust model), only explicit coach-triggered revocation.

import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey);
}

const LOGIN_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L

export function generateLoginCode(length = 6) {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += LOGIN_CODE_ALPHABET[bytes[i] % LOGIN_CODE_ALPHABET.length];
  }
  return code;
}

export function hashPin(pin) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(pin, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPin(pin, hash, salt) {
  const candidate = scryptSync(pin, salt, 64);
  const stored = Buffer.from(hash, 'hex');
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export function newSessionToken() {
  return randomUUID();
}

/**
 * Resolve a bearer session token to its athlete, touching last_seen_at.
 * Returns { ok, athleteId? , error? }.
 */
export async function resolveSession(supabaseAdmin, sessionToken) {
  if (!sessionToken) return { ok: false, error: 'Missing session token.' };
  const { data, error } = await supabaseAdmin
    .from('athlete_sessions')
    .select('id, athlete_id, revoked_at')
    .eq('session_token', sessionToken)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data || data.revoked_at) return { ok: false, error: 'Session expired or revoked.' };

  await supabaseAdmin
    .from('athlete_sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', data.id);

  return { ok: true, athleteId: data.athlete_id };
}

/**
 * Athlete display fields, matching the shape validate_athlete_token
 * (the token-route RPC) already returns, so both entry points feed
 * AthleteAppShell identically.
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
    .select('wellness_token, use_custom_wellness')
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
