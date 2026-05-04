// Vercel serverless function — return VALD's full result definitions
// catalogue. The client uses this to resolve resultId → name/unit/decimals
// for any raw_metrics rows that were imported before server-side enrichment
// existed (so coaches don't have to re-sync the whole roster to see real
// metric names in the KPI dropdown).
//
//   GET /api/vald/result-definitions
//   → { ok: true, definitions: { [resultId]: { name, unit, group, decimals, asymmetry } } }

const VALD_AUTH_URL =
  process.env.VALD_AUTH_URL || 'https://auth.prd.vald.com/oauth/token';
const VALD_AUDIENCE =
  process.env.VALD_AUDIENCE || 'vald-api-external';
const VALD_FD_BASE =
  process.env.VALD_FD_BASE || 'https://prd-aue-api-extforcedecks.valdperformance.com';

async function getAccessToken({ clientId, clientSecret }) {
  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     clientId,
    client_secret: clientSecret,
    audience:      VALD_AUDIENCE,
  });
  const r = await fetch(VALD_AUTH_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept':       'application/json',
    },
    body,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`VALD auth failed (${r.status})`, { cause: text });
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('VALD auth returned non-JSON'); }
  if (!json.access_token) throw new Error('VALD auth response missing access_token');
  return json.access_token;
}

export default async function handler(_req, res) {
  const clientId     = (process.env.VALD_CLIENT_ID     || '').trim();
  const clientSecret = (process.env.VALD_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) {
    res.status(500).json({ ok: false, error: 'VALD env vars missing on server' });
    return;
  }

  try {
    const token = await getAccessToken({ clientId, clientSecret });
    const r = await fetch(`${VALD_FD_BASE}/resultdefinitions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await r.text();
    if (!r.ok) throw new Error(`VALD resultdefinitions failed (${r.status})`, { cause: text });
    let json;
    try { json = JSON.parse(text); } catch { throw new Error('VALD resultdefinitions non-JSON'); }
    const list = json?.resultDefinitions || json || [];
    const definitions = {};
    for (const d of list) {
      definitions[d.resultId] = {
        name:     d.resultName,
        unit:     d.resultUnitName,
        group:    d.resultGroup,
        decimals: d.numberOfDecimalPlaces ?? 1,
        asymmetry: !!d.supportsAsymmetry,
      };
    }
    // Cache 1 day on the edge — the catalogue rarely changes.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).json({ ok: true, definitions });
  } catch (e) {
    const detail = e.cause ? String(e.cause).slice(0, 1000) : null;
    res.status(500).json({ ok: false, error: e.message || 'unknown', detail });
  }
}
