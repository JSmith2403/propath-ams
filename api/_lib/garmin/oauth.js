// Garmin Connect Developer Program — OAuth 2.0 with PKCE (spec: developerportal.garmin.com/sites/default/files/OAuth2PKCE.pdf).
//
//   1. The athlete is sent to connect.garmin.com/oauth2Confirm, signs in and approves.
//   2. Garmin redirects back to our redirect URI with ?code=…&state=…
//   3. We POST the code (+ the PKCE verifier and our client secret) to the token endpoint.
//   4. Access tokens last ~24h (refreshed with the refresh token); the refresh token lasts ~90 days and
//      Garmin issues a new one on every refresh.
// The athlete's Garmin password never reaches us.

import { createHash, randomBytes } from 'node:crypto';

const AUTHORIZE_URL = 'https://connect.garmin.com/oauth2Confirm';
const TOKEN_URL     = 'https://connectapi.garmin.com/di-oauth2-service/oauth/token';
const API_BASE      = 'https://apis.garmin.com/wellness-api/rest';
const TIMEOUT_MS    = 8000;

export class GarminError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

const clientId     = () => (process.env.GARMIN_CLIENT_ID || '').trim();
const clientSecret = () => (process.env.GARMIN_CLIENT_SECRET || '').trim();
export const oauthConfigured = () => !!(clientId() && clientSecret());

/** Must match the "OAuth redirect URL" saved on the Garmin app exactly. */
export const redirectUri = () =>
  (process.env.GARMIN_REDIRECT_URI || 'https://propath-ams.vercel.app/api/garmin/callback').trim();

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** code_verifier: 43–128 chars of [A-Za-z0-9-._~]; challenge = base64url(sha256(verifier)). */
export function makePkce() {
  const verifier = b64url(randomBytes(48));                       // 64 chars
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

export const newState = () => b64url(randomBytes(24));

export function authorizeUrl({ state, challenge }) {
  const q = new URLSearchParams({
    response_type: 'code',
    client_id: clientId(),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    redirect_uri: redirectUri(),
    state,
  });
  return `${AUTHORIZE_URL}?${q.toString()}`;
}

async function tokenRequest(params) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(), ...params }).toString(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  let json = null;
  try { json = await res.json(); } catch { /* not JSON */ }
  if (!res.ok || !json?.access_token) {
    throw new GarminError(json?.error_description || json?.error || `Garmin sign-in failed (${res.status}).`, res.status);
  }
  return json;
}

/** → { access, refresh, accessExpiresAt, refreshExpiresAt } (ISO strings; access expiry has a 10-minute safety margin). */
function shapeTokens(t) {
  const now = Date.now();
  const accessMs = Math.max(60, Number(t.expires_in || 86400) - 600) * 1000;
  const refreshMs = Number(t.refresh_token_expires_in || 0) * 1000;
  return {
    access: t.access_token,
    refresh: t.refresh_token,
    accessExpiresAt: new Date(now + accessMs).toISOString(),
    refreshExpiresAt: refreshMs ? new Date(now + refreshMs).toISOString() : null,
  };
}

export async function exchangeCode({ code, verifier }) {
  return shapeTokens(await tokenRequest({
    grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirectUri(),
  }));
}

export async function refreshTokens(refreshToken) {
  return shapeTokens(await tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken }));
}

async function api(path, accessToken, method = 'GET') {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new GarminError(`Garmin said ${res.status}.`, res.status);
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

/** Garmin's stable id for this person — arrives on every pushed record so we can match it to an athlete. */
export async function fetchUserId(accessToken) {
  const j = await api('/user/id', accessToken);
  return j?.userId ? String(j.userId) : null;
}

/** What the athlete agreed to share, e.g. ["ACTIVITY_EXPORT", "HEALTH_EXPORT"]. */
export async function fetchPermissions(accessToken) {
  const j = await api('/user/permissions', accessToken);
  return Array.isArray(j) ? j.map(String) : [];
}

/** Required by Garmin whenever the user removes consent inside OUR app ("Disconnect"). */
export const deleteRegistration = (accessToken) => api('/user/registration', accessToken, 'DELETE');
