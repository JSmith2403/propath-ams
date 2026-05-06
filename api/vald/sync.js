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
//       raw_metrics       // full result list with resultId+value, opaque to client
//     }, ...]
//   }
//
// Response shape (failure):
//   { ok: false, error: 'human message', detail?: '…' }

// VALD's actual API token endpoint (Auth0-backed). The `security.valdperformance.com`
// host is for Hub user logins, NOT the External API — using it returns
// invalid_client. The Swagger UI for ForceDecks confirms this URL plus the
// `audience=vald-api-external` body param requirement.
const VALD_AUTH_URL =
  process.env.VALD_AUTH_URL || 'https://auth.prd.vald.com/oauth/token';

const VALD_AUDIENCE =
  process.env.VALD_AUDIENCE || 'vald-api-external';

// Region-specific data API base. AU East default; override in env if your
// tenant lives in EU or US.
const VALD_FD_BASE =
  process.env.VALD_FD_BASE || 'https://prd-aue-api-extforcedecks.valdperformance.com';

// ─── OAuth2 client-credentials token exchange ──────────────────────────────
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
  if (!r.ok) {
    throw new Error(`VALD auth failed (${r.status})`, { cause: text });
  }
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('VALD auth returned non-JSON'); }
  if (!json.access_token) throw new Error('VALD auth response missing access_token');
  return json.access_token;
}

// ─── ForceDecks: list tests for a profile + fetch trial detail ─────────────
// Per Swagger v2019q3: GET /tests with PascalCase query params.
async function fetchTestsForProfile({ token, tenantId, profileId, fromIso }) {
  const params = new URLSearchParams({
    TenantId:        tenantId,
    ModifiedFromUtc: fromIso || '1970-01-01T00:00:00Z',
  });
  if (profileId) params.set('ProfileId', profileId);
  const url = `${VALD_FD_BASE}/tests?${params}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await r.text();
  if (!r.ok) throw new Error(`VALD list-tests failed (${r.status})`, { cause: text });
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('VALD list-tests returned non-JSON'); }
  // Swagger response shape: { tests: [...] }
  return Array.isArray(json) ? json : (json?.tests || []);
}

// Per-trial detail still lives under the legacy v2019q3 path. teamId in
// the legacy world == tenantId in the new External API.
async function fetchTrialsForTest({ token, tenantId, testId }) {
  const url = `${VALD_FD_BASE}/v2019q3/teams/${encodeURIComponent(tenantId)}/tests/${encodeURIComponent(testId)}/trials`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await r.text();
  if (!r.ok) throw new Error(`VALD trials (${testId}) failed (${r.status})`, { cause: text });
  try { return JSON.parse(text); } catch { throw new Error('VALD trials returned non-JSON'); }
}

// One-time fetch of the resultId → metric metadata table. Cached for the
// lifetime of this serverless invocation; first sync per cold-start pays
// the round-trip, subsequent syncs in the same instance reuse it.
let resultDefsCache = null;
async function getResultDefinitions({ token }) {
  if (resultDefsCache) return resultDefsCache;
  const r = await fetch(`${VALD_FD_BASE}/resultdefinitions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`VALD resultdefinitions failed (${r.status})`, { cause: text });
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('VALD resultdefinitions non-JSON'); }
  const list = json?.resultDefinitions || json || [];
  resultDefsCache = Object.fromEntries(list.map(d => [d.resultId, d]));
  return resultDefsCache;
}

// ─── Metric extraction ─────────────────────────────────────────────────────
// Match by case-insensitive substring on resultName from the resolved
// definition. More specific patterns win.
const METRIC_MATCHERS = {
  jump_height_cm:   [/jump height.*imp.?mom/i, /jump height/i],
  cmj_depth_cm:     [/countermovement depth/i, /cm depth/i],
  peak_force_n:     [/concentric peak force/i, /peak.*force/i],
  peak_impulse_ns:  [/concentric impulse/i, /peak.*impulse/i],
  rsi_modified:     [/rsi[-_ ]?modified/i, /rsi.?mod/i],
  lr_asymmetry_pct: [/asymmetry/i],
};

// Enrich each VALD trial result with its definition metadata so the
// client doesn't need its own /resultdefinitions fetch. Each row of
// raw_metrics ends up with everything needed to render a column in the
// data-storage table — name, unit, group, decimals.
function enrichResults(results, defs) {
  return results.map(r => {
    const def = defs[r.resultId] || {};
    return {
      resultId: r.resultId,
      value:    r.value,
      limb:     r.limb,
      repeat:   r.repeat,
      time:     r.time,
      name:     def.resultName || `Metric ${r.resultId}`,
      unit:     def.resultUnitName || '',
      group:    def.resultGroup || 'General',
      decimals: def.numberOfDecimalPlaces ?? 1,
      asymmetry:        !!def.supportsAsymmetry,
      isRepeatResult:   !!def.isRepeatResult,
      trendDirection:   def.trendDirection || 'None',
    };
  });
}

function trialToRow({ test, trial, profileId, defs }) {
  const results  = Array.isArray(trial.results) ? trial.results : [];
  const enriched = enrichResults(results, defs);

  // Surfaced columns kept for legacy/KPI integration. They use the
  // enriched name from the definition rather than the raw regex on
  // result text, so matches are stable. `Trial` limb preferred so
  // we get the bilateral value when both bilateral and limb-specific
  // versions of the same metric exist.
  const surfaced = {};
  for (const [key, patterns] of Object.entries(METRIC_MATCHERS)) {
    surfaced[key] = pickFromEnriched(enriched, patterns);
  }

  // Trial-level limb tag — for single-leg tests (SLHJ, SLDJ, single-leg
  // CMJ etc.) each trial is one leg, but VALD's per-metric limb field
  // is often null. The side lives on the trial object itself; field
  // name varies across VALD endpoints so probe a few before giving up.
  const trialLimbRaw = trial.limb || trial.side || trial.testedLeg || trial.limbTested || null;
  // If still null but every metric on the trial agrees on a single
  // non-Trial / non-Asym limb, infer from there as a fallback.
  let trialLimb = trialLimbRaw;
  if (!trialLimb) {
    const limbs = new Set(enriched.map(r => r.limb).filter(l => l && l !== 'Trial' && l !== 'Asym'));
    if (limbs.size === 1) trialLimb = Array.from(limbs)[0];
  }
  // Normalise to title case so the UI can compare freely. 'Both' /
  // 'bilateral' / 'trial' all collapse to null (bilateral is the
  // "no leg distinction" default — the absence of a leg tag, not its
  // own value). Anything we don't recognise also drops to null so
  // the UI never has to guess at a stray vendor string.
  if (typeof trialLimb === 'string') {
    const lc = trialLimb.toLowerCase();
    if      (lc === 'left')  trialLimb = 'Left';
    else if (lc === 'right') trialLimb = 'Right';
    else                     trialLimb = null;
  }

  return {
    vald_test_id:    test.testId || test.id,
    vald_trial_id:   trial.trialId || trial.id || `${test.testId}-${trial.repeat ?? results[0]?.repeat ?? Math.random().toString(36).slice(2)}`,
    vald_profile_id: profileId,
    test_type:       test.testType || null,
    recorded_at:     test.recordedDateUtc || test.modifiedDateUtc || null,
    trial_limb:      trialLimb,
    ...surfaced,
    raw_metrics:     enriched,
  };
}

function pickFromEnriched(enriched, patterns) {
  for (const p of patterns) {
    const hit = enriched.find(r => p.test(r.name) && r.limb === 'Trial');
    if (hit && hit.value != null && isFinite(Number(hit.value))) return Number(hit.value);
  }
  for (const p of patterns) {
    const hit = enriched.find(r => p.test(r.name));
    if (hit && hit.value != null && isFinite(Number(hit.value))) return Number(hit.value);
  }
  return null;
}

// ─── Handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const profileId = (req.query.profileId || '').trim();
  const fromIso   = (req.query.fromIso   || '').trim() || null;

  if (!profileId) {
    res.status(400).json({ ok: false, error: 'profileId query param required' });
    return;
  }

  const tenantId     = (process.env.VALD_TENANT_ID     || '').trim();
  const clientId     = (process.env.VALD_CLIENT_ID     || '').trim();
  const clientSecret = (process.env.VALD_CLIENT_SECRET || '').trim();
  if (!tenantId || !clientId || !clientSecret) {
    res.status(500).json({ ok: false, error: 'VALD env vars missing on server' });
    return;
  }

  try {
    const token = await getAccessToken({ clientId, clientSecret });
    const [tests, defs] = await Promise.all([
      fetchTestsForProfile({ token, tenantId, profileId, fromIso }),
      getResultDefinitions({ token }),
    ]);

    const trials = [];
    for (const test of tests) {
      const trialList = await fetchTrialsForTest({ token, tenantId, testId: test.testId });
      const items = Array.isArray(trialList) ? trialList : (trialList?.trials || []);
      for (const trial of items) {
        trials.push(trialToRow({ test, trial, profileId, defs }));
      }
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, trials });
  } catch (e) {
    const detail = e.cause ? String(e.cause).slice(0, 1000) : null;
    res.status(500).json({ ok: false, error: e.message || 'unknown error', detail });
  }
}
