// Diagnostic endpoint — surfaces exactly what we send to VALD and exactly
// what VALD says back, without revealing secrets.
//
// Open in browser:
//   /api/vald/debug
//
// Returns JSON with:
//   • env var presence + length + last 4 chars of each (safe to share)
//   • the literal token request we send (sans secret)
//   • VALD's raw HTTP status + response body
//
// Once we know what VALD is rejecting, we either fix the call or escalate
// to VALD support with a copy of the response. Throwaway endpoint — remove
// after VALD integration is confirmed working.

const VALD_AUTH_URL =
  process.env.VALD_AUTH_URL || 'https://security.valdperformance.com/connect/token';

function safe(s) {
  if (!s) return { present: false };
  const trimmed = String(s).trim();
  return {
    present:    true,
    length:     trimmed.length,
    rawLength:  String(s).length,
    last4:      trimmed.slice(-4),
    first4:     trimmed.slice(0, 4),
    hasNewline: /\n|\r/.test(s),
    hasSpaces:  /\s/.test(s) && trimmed === s.replace(/\s/g, ''),
  };
}

export default async function handler(req, res) {
  const tenantId     = (process.env.VALD_TENANT_ID     || '').trim();
  const clientId     = (process.env.VALD_CLIENT_ID     || '').trim();
  const clientSecret = (process.env.VALD_CLIENT_SECRET || '').trim();

  const out = {
    ok: false,
    env: {
      VALD_TENANT_ID:     safe(process.env.VALD_TENANT_ID),
      VALD_CLIENT_ID:     safe(process.env.VALD_CLIENT_ID),
      VALD_CLIENT_SECRET: safe(process.env.VALD_CLIENT_SECRET),
    },
    auth_url: VALD_AUTH_URL,
  };

  if (!clientId || !clientSecret) {
    out.error = 'Missing client credentials in env';
    res.status(200).json(out);
    return;
  }

  // Variant A — body params, no scope (VALD's documented example)
  // Variant B — body params, scope=api.external (community fallback)
  // Variant C — Basic auth header, no scope
  const variants = [
    { name: 'A_body_no_scope', useBasic: false, scope: null },
    { name: 'B_body_with_scope', useBasic: false, scope: 'api.external' },
    { name: 'C_basic_no_scope', useBasic: true,  scope: null },
  ];

  out.attempts = [];

  for (const v of variants) {
    const params = { grant_type: 'client_credentials' };
    if (!v.useBasic) {
      params.client_id     = clientId;
      params.client_secret = clientSecret;
    }
    if (v.scope) params.scope = v.scope;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept':       'application/json',
    };
    if (v.useBasic) {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      headers.Authorization = `Basic ${basic}`;
    }

    let status = 0, body = '';
    try {
      const r = await fetch(VALD_AUTH_URL, {
        method: 'POST',
        headers,
        body: new URLSearchParams(params),
      });
      status = r.status;
      body   = await r.text();
    } catch (e) {
      body = String(e);
    }

    const succeeded = status >= 200 && status < 300;
    out.attempts.push({
      variant: v.name,
      status,
      bodyExcerpt: body.slice(0, 400),
      succeeded,
    });
    if (succeeded) { out.ok = true; out.workingVariant = v.name; break; }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(out);
}
