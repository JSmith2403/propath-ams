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

// VALD's actual API token endpoint (Auth0). Old security.valdperformance.com
// host is for Hub user logins, not API client_credentials.
const VALD_AUTH_URL =
  process.env.VALD_AUTH_URL || 'https://auth.prd.vald.com/oauth/token';
const VALD_AUDIENCE = process.env.VALD_AUDIENCE || 'vald-api-external';

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
  // Variants — body + audience (the documented working combo first), then
  // a couple of fallbacks in case this tenant is provisioned differently.
  const variants = [
    { name: 'A_body_with_audience', body: { audience: VALD_AUDIENCE } },
    { name: 'B_body_audience_and_scope', body: { audience: VALD_AUDIENCE, scope: 'api.external' } },
    { name: 'C_body_no_audience',  body: {} },
  ];

  out.attempts = [];

  for (const v of variants) {
    const params = {
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
      ...v.body,
    };
    let status = 0, body = '';
    try {
      const r = await fetch(VALD_AUTH_URL, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':       'application/json',
        },
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
