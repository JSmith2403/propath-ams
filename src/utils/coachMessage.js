import { supabase } from '../lib/supabase';

/**
 * Sends a message from the signed-in athlete to the coaching team (it lands in
 * the shared Messages inbox and the safeguarding record, and coaches with
 * notifications on get a push). Resolves { ok, error? }.
 */
export async function sendCoachMessage(text) {
  const body = String(text || '').trim();
  if (!body) return { ok: false, error: 'Write a message first.' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/push/reply', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ body }),
    });
    const json = await res.json().catch(() => ({ ok: false, error: `Server error (${res.status}).` }));
    return json.ok ? { ok: true } : { ok: false, error: json.error || 'Couldn\'t send.' };
  } catch (_) {
    return { ok: false, error: 'Couldn\'t reach the server — check your connection.' };
  }
}
