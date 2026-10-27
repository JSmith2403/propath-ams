// Garmin Connect "Personal API" client (https://developer.garmin.com/gc-developer-program/personal/).
//   1. POST  {base}/personalapitoken-service/personal-api/personal-api-key/token
//            Authorization: ApiKey <key>      → plain-text JWT, valid 24h (no refresh tokens)
//   2. GET   {base}/<service path>             Authorization: Bearer <jwt>
// Read-only. Paths mirror Garmin's own Python client (garmin/connect-personal-api-python).

const BASE = (process.env.GARMIN_PERSONAL_API_BASE_URL || 'https://personal.connectapi.garmin.com').replace(/\/+$/, '');
const TOKEN_PATH = '/personalapitoken-service/personal-api/personal-api-key/token';

export class GarminError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

/** Trade the long-lived key for a 24h bearer token. 401/403 here = key wrong, expired or revoked. */
export async function getBearer(apiKey) {
  const r = await fetch(BASE + TOKEN_PATH, {
    method: 'POST',
    headers: { Accept: '*/*', Authorization: `ApiKey ${apiKey}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) {
    throw new GarminError(
      r.status === 401 || r.status === 403
        ? 'Garmin did not accept that key — it may be wrong, expired or deleted.'
        : `Garmin token request failed (${r.status}).`,
      r.status,
    );
  }
  const token = (await r.text()).trim();
  if (!token) throw new GarminError('Garmin returned an empty token.', 502);
  return token;
}

export async function garminGet(token, path) {
  const r = await fetch(BASE + path, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20000),
  });
  if (r.status === 204) return null;
  if (!r.ok) throw new GarminError(`Garmin ${r.status} for ${path.split('?')[0]}`, r.status);
  const text = await r.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}
