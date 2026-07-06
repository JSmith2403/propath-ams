// Shared auth guard for Vercel serverless functions.
//
// Verifies the caller's Supabase JWT (sent as  Authorization: Bearer <token>)
// against the project's auth endpoint. Returns the user object on success,
// or null after writing a 401/503 response.
//
// Requires SUPABASE_URL + SUPABASE_ANON_KEY in Vercel env vars (the
// VITE_-prefixed variants work as fallbacks since they hold the same values).

export async function requireUser(req, res) {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    res.status(503).json({
      ok: false,
      error: 'Server auth is not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing).',
    });
    return null;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ ok: false, error: 'Sign in required.' });
    return null;
  }

  const r = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });

  if (!r.ok) {
    res.status(401).json({ ok: false, error: 'Session expired — sign in again.' });
    return null;
  }

  const user = await r.json();
  if (!user?.id) {
    res.status(401).json({ ok: false, error: 'Session expired — sign in again.' });
    return null;
  }
  return user;
}
