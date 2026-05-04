// Vercel serverless function — pull ForceDecks tests for one VALD profile
// and return them in a normalised shape. The client persists into
// vald_test_results using the user's authenticated Supabase session, so
// no service-role key needs to live on the server.
//
//   GET /api/vald/sync?profileId=<vald-profile-id>&fromIso=<yyyy-mm-dd>
//
// Response shape (success):
//   {
//     ok: true,
//     trials: [{
//       vald_test_id, vald_trial_id, vald_profile_id,
//       test_type, recorded_at,
//       jump_height_cm, cmj_depth_cm, peak_force_n, peak_impulse_ns,
//       rsi_modified, lr_asymmetry_pct,
//       raw_metrics       // full result list, opaque to client
//     }, ...]
//   }
//
// Response shape (failure):
//   { ok: false, error: 'human message', detail?: '…' }

const VALD_AUTH_URL =
  process.env.VALD_AUTH_URL || 'https://security.valdperformance.com/connect/token';

// VALD's public ForceDecks API base. Override via env if a tenant lives
// in a different region (eu-, us-).
const VALD_FD_BASE =
  process.env.VALD_FD_BASE || 'https://prd-aue-api-extforcedecks.valdperformance.com';

// ─── OAuth2 client-credentials token exchange ──────────────────────────────
// Per VALD's official integration guide:
//   • Credentials go in the form body, not HTTP Basic.
//   • scope=api.external is REQUIRED. Their old api.dashboard /
//     api.forcedecks scopes were retired in Feb 2024 and the server
//     responds with 400 invalid_client when no scope is sent.
async function getAccessToken({ clientId, clientSecret }) {
  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     clientId,
    client_secret: clientSecret,
    scope:         'api.external',
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
  if (!r.ok) {
    throw new Error(`VALD auth failed (${r.status})`, { cause: text });
  }
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('VALD auth returned non-JSON'); }
  if (!json.access_token) throw new Error('VALD auth response missing access_token');
  return json.access_token;
}

// ─── ForceDecks: list tests for a profile + fetch trial detail ─────────────
// Per VALD's External ForceDecks guide the current shape is flat:
//   GET /tests?tenantId=…&modifiedFromUtc=…&profileId=…
// modifiedFromUtc is required — pass the unix epoch to mean "all time".
async function fetchTestsForProfile({ token, tenantId, profileId, fromIso }) {
  const params = new URLSearchParams({
    tenantId,
    modifiedFromUtc: fromIso || '1970-01-01T00:00:00Z',
  });
  if (profileId) params.set('profileId', profileId);
  const url = `${VALD_FD_BASE}/tests?${params}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await r.text();
  if (!r.ok) throw new Error(`VALD list-tests failed (${r.status})`, { cause: text });
  try { return JSON.parse(text); } catch { throw new Error('VALD list-tests returned non-JSON'); }
}

async function fetchTestDetail({ token, tenantId, testId }) {
  // Trial-level detail still lives under the older path.
  const url = `${VALD_FD_BASE}/v2019q3/teams/${encodeURIComponent(tenantId)}/tests/${encodeURIComponent(testId)}/trials`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await r.text();
  if (!r.ok) throw new Error(`VALD test-detail (${testId}) failed (${r.status})`, { cause: text });
  try { return JSON.parse(text); } catch { throw new Error('VALD test-detail returned non-JSON'); }
}

// ─── Metric extraction ─────────────────────────────────────────────────────
// VALD trial.results is an array of { definition: { id, name, unit }, value }.
// We match by case-insensitive substring on `definition.name` because exact
// names occasionally drift between firmware versions; the matcher list is
// ordered by specificity so the more precise pattern wins.
const METRIC_MATCHERS = {
  jump_height_cm:   [/jump height.*imp.?mom/i, /jump height/i],
  cmj_depth_cm:     [/countermovement depth/i, /cm depth/i],
  peak_force_n:     [/concentric peak force/i, /peak.*force/i],
  peak_impulse_ns:  [/concentric impulse/i, /peak.*impulse/i],
  rsi_modified:     [/rsi[-_ ]?modified/i, /rsi.?mod/i],
  lr_asymmetry_pct: [/asymmetry/i],
};

function extractMetric(results, patterns) {
  for (const pattern of patterns) {
    const hit = results.find(r => pattern.test(r?.definition?.name || ''));
    if (hit && hit.value != null && isFinite(Number(hit.value))) return Number(hit.value);
  }
  return null;
}

function trialToRow({ test, trial, profileId }) {
  const results = Array.isArray(trial.results) ? trial.results : [];
  const surfaced = {};
  for (const [key, patterns] of Object.entries(METRIC_MATCHERS)) {
    surfaced[key] = extractMetric(results, patterns);
  }
  return {
    vald_test_id:    test.testId || test.id,
    vald_trial_id:   trial.trialId || trial.id,
    vald_profile_id: profileId,
    test_type:       test.testType?.name || test.testTypeName || test.testType || null,
    recorded_at:     test.recordedDateUtc || test.recordedDateTimeUtc || test.recordedDate || null,
    ...surfaced,
    raw_metrics:     results,
  };
}

// ─── Handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const profileId = (req.query.profileId || '').trim();
  const fromIso   = (req.query.fromIso   || '').trim() || null;

  if (!profileId) {
    res.status(400).json({ ok: false, error: 'profileId query param required' });
    return;
  }

  // Trim defensively — env vars copy-pasted into Vercel often pick up
  // a stray trailing newline, which IdentityServer rejects as
  // invalid_client without explanation.
  const tenantId     = (process.env.VALD_TENANT_ID     || '').trim();
  const clientId     = (process.env.VALD_CLIENT_ID     || '').trim();
  const clientSecret = (process.env.VALD_CLIENT_SECRET || '').trim();
  if (!tenantId || !clientId || !clientSecret) {
    res.status(500).json({ ok: false, error: 'VALD env vars missing on server' });
    return;
  }

  try {
    const token = await getAccessToken({ clientId, clientSecret });
    const tests = await fetchTestsForProfile({ token, tenantId, profileId, fromIso });
    const list  = Array.isArray(tests) ? tests : (tests?.tests || tests?.items || []);

    const trials = [];
    for (const test of list) {
      const detail = await fetchTestDetail({ token, tenantId, testId: test.testId || test.id });
      const trialList = Array.isArray(detail?.trials) ? detail.trials : [];
      for (const trial of trialList) {
        trials.push(trialToRow({ test: { ...test, ...detail }, trial, profileId }));
      }
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, trials });
  } catch (e) {
    const detail = e.cause ? String(e.cause).slice(0, 1000) : null;
    res.status(500).json({ ok: false, error: e.message || 'unknown error', detail });
  }
}
