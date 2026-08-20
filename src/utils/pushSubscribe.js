import { supabase } from '../lib/supabase';

// PushManager.subscribe needs the VAPID public key as a Uint8Array, not
// the base64url string it's normally shared as.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function pushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

/**
 * Requests notification permission (if not already decided) and, if
 * granted, subscribes this device and stores the subscription against
 * the athlete. Safe to call more than once — Supabase upserts on the
 * unique `endpoint` so re-subscribing the same device is a no-op write.
 *
 * Returns 'granted' | 'denied' | 'unsupported' | 'error'.
 */
export async function subscribeToPush(athleteId) {
  if (!pushSupported()) return 'unsupported';

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.error('[push] VITE_VAPID_PUBLIC_KEY is not set');
    return 'error';
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission; // 'denied' | 'default'

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    const json = subscription.toJSON();
    const { error } = await supabase.from('push_subscriptions').upsert({
      athlete_id: athleteId,
      endpoint: json.endpoint,
      keys_p256dh: json.keys.p256dh,
      keys_auth: json.keys.auth,
      user_agent: navigator.userAgent,
    }, { onConflict: 'endpoint' });

    if (error) {
      console.error('[push] failed to store subscription', error);
      return 'error';
    }
    return 'granted';
  } catch (err) {
    console.error('[push] subscribe failed', err);
    return 'error';
  }
}
