// Shared Web Push sender — used by the coach-triggered /api/push/* endpoints,
// the cron jobs and the athlete reply endpoint. Requires
// webpush.setVapidDetails(...) to already have been called by the
// caller (each entry point owns reading its own env vars/error shape).

import webpush from 'web-push';

/** Reads the VAPID env vars and configures web-push. Returns false if push
 *  isn't configured (callers then store the message and skip the nudge). */
export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const { VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!publicKey || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, publicKey, VAPID_PRIVATE_KEY);
  return true;
}

async function sendToSubscriptions(supabaseAdmin, subs, { title, body, url = '/' }) {
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

/**
 * Sends one push payload to every subscribed device for an athlete.
 * Dead subscriptions (404/410) are cleaned up automatically.
 * Returns { sent, removed, total }.
 */
export async function sendPushToAthlete(supabaseAdmin, athleteId, payload) {
  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, keys_p256dh, keys_auth')
    .eq('athlete_id', athleteId);
  if (error) throw error;
  return sendToSubscriptions(supabaseAdmin, subs, payload);
}

/** Same, for coach devices (subscriptions stored against a user_id). */
export async function sendPushToUsers(supabaseAdmin, userIds, payload) {
  if (!userIds?.length) return { sent: 0, removed: 0, total: 0 };
  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, keys_p256dh, keys_auth')
    .in('user_id', userIds);
  if (error) throw error;
  return sendToSubscriptions(supabaseAdmin, subs, payload);
}
