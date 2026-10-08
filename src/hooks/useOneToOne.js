import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useOneToOne — the athlete's 1:1 token balance (rolling 30 days) and their own
 * 1:1 requests. `request(date, 'HH:MM')` goes through the server, which checks a
 * token is left, records the request and posts the message to their coach in
 * the chat. Resolves { ok, error?, message? }.
 *
 * Degrades quietly (no tokens info) if the 1:1 SQL hasn't been run yet.
 */
export function useOneToOne(athleteId) {
  const [balance, setBalance] = useState(null);     // { monthly, used, left, nextFree }
  const [requests, setRequests] = useState([]);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!athleteId) return undefined;
    let cancelled = false;
    (async () => {
      const [{ data: bal, error: balErr }, { data: reqs }] = await Promise.all([
        supabase.rpc('my_token_balance'),
        supabase.from('one_to_one_requests')
          .select('id, request_date, request_time, status')
          .gte('request_date', new Date(Date.now() - 2 * 86_400_000).toLocaleDateString('en-CA'))
          .order('request_date', { ascending: true }),
      ]);
      if (cancelled) return;
      const b = Array.isArray(bal) ? bal[0] : bal;
      if (!balErr && b) {
        setBalance({ monthly: b.monthly_tokens, used: b.used, left: Math.max(0, b.monthly_tokens - b.used), nextFree: b.next_free });
      } else {
        setBalance(null);
      }
      setRequests(reqs || []);
    })();
    return () => { cancelled = true; };
  }, [athleteId, tick]);

  const request = useCallback(async (date, time) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/push/one-to-one-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ date, time }),
      });
      const json = await res.json().catch(() => ({ ok: false, error: `Server error (${res.status}).` }));
      if (!json.ok) return { ok: false, error: json.error || 'Couldn\'t send your request.' };
      refresh();
      return { ok: true, message: json.message };
    } catch (_) {
      return { ok: false, error: 'Couldn\'t reach the server — check your connection.' };
    }
  }, [refresh]);

  return { balance, requests, request, refresh };
}
