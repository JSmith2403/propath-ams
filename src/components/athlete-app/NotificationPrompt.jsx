import { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff, X, Share, Smartphone } from 'lucide-react';
import {
  pushSupported, subscribeToPush, subscribeStaffToPush, isInstalledApp, isIOSDevice,
} from '../../utils/pushSubscribe';

/**
 * Notifications that actually reach a locked phone — the whole point of
 * messaging. This module owns the "is this device set up to receive them?"
 * question and nags (politely) until it is.
 *
 *   'granted'       permission given → we silently re-register the device on every
 *                   app open / return-to-app so the subscription never goes stale
 *   'ready'         can ask → show a prominent prompt (the tap is the user gesture
 *                   iOS requires)
 *   'needs-install' iPhone, not added to the Home Screen → push is impossible until
 *                   it is, so say so
 *   'denied'        blocked in system settings → show how to turn it back on
 *   'unsupported'   this browser can't do push at all
 *
 * Used for athletes (default) and coaches (`staff`).
 */

const SNOOZE_KEY = 'propath_notif_snoozed_until';
const SNOOZE_HOURS = 24;
const SHOW_DELAY_MS = 3_000;

function snoozed() {
  try { return Date.now() < Number(localStorage.getItem(SNOOZE_KEY) || 0); } catch { return false; }
}
function snoozeNow() {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_HOURS * 3_600_000)); } catch { /* best effort */ }
}

function currentState() {
  if (!pushSupported()) return isIOSDevice() && !isInstalledApp() ? 'needs-install' : 'unsupported';
  if (isIOSDevice() && !isInstalledApp()) return 'needs-install';
  const p = Notification.permission;
  return p === 'granted' ? 'granted' : p === 'denied' ? 'denied' : 'ready';
}

export function useNotificationState({ athleteId, staff = false }) {
  const [state, setState] = useState(currentState);
  const [busy, setBusy] = useState(false);

  const register = useCallback(async (askPermission) => (
    staff ? subscribeStaffToPush({ askPermission }) : subscribeToPush(athleteId, { askPermission })
  ), [athleteId, staff]);

  // Already allowed → keep this device registered, now and whenever the app returns to the foreground.
  useEffect(() => {
    if (state !== 'granted') return undefined;
    register(false);
    const onVisible = () => { if (document.visibilityState === 'visible') register(false); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [state, register]);

  const enable = useCallback(async () => {
    setBusy(true);
    const result = await register(true);
    setBusy(false);
    setState(currentState());
    return result;
  }, [register]);

  return { state, busy, enable };
}

/** Bottom card shown a few seconds after opening the app until notifications are on. */
export default function NotificationPrompt({ athleteId, staff = false }) {
  const { state, busy, enable } = useNotificationState({ athleteId, staff });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state !== 'ready' || snoozed()) { setVisible(false); return undefined; }
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [state]);

  if (!visible || state !== 'ready') return null;

  const notNow = () => { snoozeNow(); setVisible(false); };

  return (
    <div
      role="dialog"
      aria-label="Turn on notifications"
      className="fixed left-0 right-0 z-[100] flex justify-center px-3"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)', pointerEvents: 'none' }}
    >
      <div
        className="w-full max-w-md rounded-2xl px-4 py-3 flex items-start gap-3 shadow-2xl"
        style={{ backgroundColor: '#1C1C1C', color: '#fff', border: '1px solid rgba(165,141,105,0.4)', pointerEvents: 'auto' }}
      >
        <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(165,141,105,0.18)' }}>
          <Bell size={16} style={{ color: '#A58D69' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {staff ? 'Get notified when athletes message you' : 'Get your messages on your lock screen'}
          </p>
          <p className="text-[12px] mt-1" style={{ color: '#cbd5e1' }}>
            {staff
              ? 'Turn on notifications so replies and group messages pop up like WhatsApp.'
              : 'Turn on notifications so a message from your coach pops up on your phone, like WhatsApp — plus your timetable and wellness reminders.'}
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={enable} disabled={busy}
              className="px-3.5 py-1.5 text-xs font-semibold rounded disabled:opacity-50"
              style={{ backgroundColor: '#A58D69', color: '#1C1C1C' }}
            >
              {busy ? 'Turning on…' : 'Turn on notifications'}
            </button>
            <button onClick={notNow} disabled={busy} className="px-3 py-1.5 text-xs font-medium rounded hover:bg-white/10" style={{ color: '#cbd5e1' }}>
              Later
            </button>
          </div>
        </div>
        <button onClick={notNow} aria-label="Dismiss" className="shrink-0 p-1.5 rounded hover:bg-white/10" style={{ color: '#9ca3af' }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Strip shown at the top of the athlete's Messages: explains exactly why alerts
 * might not be arriving and how to fix it. Renders nothing once they're on.
 */
export function NotificationStatusStrip({ athleteId }) {
  const { state, busy, enable } = useNotificationState({ athleteId });
  if (state === 'granted' || state === 'unsupported') return null;

  const base = 'mx-3 mt-3 rounded-xl px-3.5 py-3 text-meta leading-snug flex items-start gap-2.5';

  if (state === 'ready') {
    return (
      <div className={base} style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
        <BellOff size={16} className="shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">You won&rsquo;t be alerted when a coach messages you</p>
          <button onClick={enable} disabled={busy} className="mt-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white disabled:opacity-60" style={{ backgroundColor: '#A58D69' }}>
            {busy ? 'Turning on…' : 'Turn on notifications'}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'needs-install') {
    return (
      <div className={base} style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
        <Smartphone size={16} className="shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">Add ProPath to your Home Screen to get alerts</p>
          <p className="mt-0.5 flex items-center gap-1 flex-wrap">
            Tap <Share size={12} className="inline" /> Share in Safari, then &ldquo;Add to Home Screen&rdquo;, and open ProPath from the icon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={base} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' }}>
      <BellOff size={16} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">Notifications are switched off for ProPath</p>
        <p className="mt-0.5">
          {isIOSDevice()
            ? 'iPhone: Settings → Notifications → ProPath → Allow Notifications.'
            : 'Android: press and hold the ProPath icon → App info → Notifications → Allow.'}
        </p>
      </div>
    </div>
  );
}
