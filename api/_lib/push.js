// Shared Web Push sender — used by the coach-triggered /api/push/send
// endpoint and by the quarterly-nudges cron. Requires
// webpush.setVapidDetails(...) to already have been called by the
// caller (each entry point owns reading its own env vars/error shape).

import webpush from 'web-push';

/**
 * Sends one push payload to every subscribed device for an athlete.
 * Dead subscriptions (404/410) are cleaned up automatically.
 * Returns { sent, removed, total }.
 */
export async function sendPushToAthlete(supabaseAdmin, athleteId, { title, body, url = '/' }) {
  const { data: subs, error: fetchErr } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, keys_p256dh, keys_auth')
    .eq('athlete_id', athleteId);

  if (fetchErr) throw fetchErr;
  if (!subs || subs.length === 0) return { sent: 0, removed: 0, total: 0 };

  const payload = JSON.stringify({ title, body, url });
  const deadIds = [];
  let sent = 0;

  await Promise.all(subs.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
    };
    try {
      await webpush.sendNotification(pushSubscription, payload);
      sent++;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        deadIds.push(sub.id);
      } else {
        console.error('[push] send failed for subscription', sub.id, err.statusCode, err.message);
      }
    }
  }));

  if (deadIds.length) {
    await supabaseAdmin.from('push_subscriptions').delete().in('id', deadIds);
  }

  return { sent, removed: deadIds.length, total: subs.length };
}
