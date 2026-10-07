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

/** Installed to the home screen (iPhone only delivers push to installed web apps). */
export function isInstalledApp() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator?.standalone === true;
}

export function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

/**
 * Athlete: asks for notification permission (only from a tap, and only if not
 * already decided) and registers THIS device so coach messages arrive on the
 * lock screen. Call it again on every app open with askPermission:false — it
 * quietly re-registers when permission is already granted, which keeps the
 * subscription alive (phones occasionally drop them).
 *
 * The device is saved through the server (the athlete id comes from their
 * login), falling back to a direct write for legacy token-link athletes.
 * Returns 'granted' | 'denied' | 'default' | 'unsupported' | 'error'.
 */
export async function subscribeToPush(athleteId, { askPermission = true } = {}) {
  if (!pushSupported()) return 'unsupported';

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.error('[push] VITE_VAPID_PUBLIC_KEY is not set');
    return 'error';
  }

  let permission = Notification.permission;
  if (permission === 'default' && askPermission) permission = await Notification.requestPermission();
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
    const details = {
      endpoint: json.endpoint,
      keys_p256dh: json.keys.p256dh,
      keys_auth: json.keys.auth,
      user_agent: navigator.userAgent,
    };

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const res = await fetch('/api/push/subscribe-athlete', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(details),
      });
      const out = await res.json().catch(() => ({ ok: false }));
      if (out.ok) return 'granted';
      console.warn('[push] server registration failed, trying direct write', out.error);
    }

    // Legacy token-link athletes have no login session — write directly.
    const { error } = await supabase.from('push_subscriptions').upsert({
      athlete_id: athleteId, ...details,
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

/**
 * Coach version: same device subscription, registered against the signed-in
 * coach (via the server — coaches have no direct write access to
 * push_subscriptions) so athlete replies and chat messages can notify them.
 * `askPermission:false` re-registers silently when permission is already
 * granted (keeps a coach's device current without prompting again).
 */
export async function subscribeStaffToPush({ askPermission = true } = {}) {
  if (!pushSupported()) return 'unsupported';

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey) return 'error';

  let permission = Notification.permission;
  if (permission === 'default' && askPermission) permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;

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
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/push/subscribe-staff', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys_p256dh: json.keys.p256dh,
        keys_auth: json.keys.auth,
        user_agent: navigator.userAgent,
      }),
    });
    const out = await res.json().catch(() => ({ ok: false }));
    if (!out.ok) { console.error('[push] staff subscribe failed', out.error); return 'error'; }
    return 'granted';
  } catch (err) {
    console.error('[push] staff subscribe failed', err);
    return 'error';
  }
}
