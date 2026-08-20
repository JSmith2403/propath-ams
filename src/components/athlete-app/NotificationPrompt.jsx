import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { pushSupported, subscribeToPush } from '../../utils/pushSubscribe';

/**
 * Follow-up to InstallPrompt — asks the athlete to enable notifications
 * (wellness reminders, weekly reflection prompts) once the app is
 * actually running installed. Notifications require install-first on
 * iOS, so this deliberately only shows in standalone mode; there's no
 * point asking from a plain Safari tab that can't receive them yet.
 *
 * Hidden when: not standalone, push unsupported, permission already
 * decided (granted or denied — respects the browser's own state so we
 * never re-prompt after a denial), or dismissed within DISMISS_DAYS.
 */

const DISMISS_KEY = 'propath_notif_dismissed_until';
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 4_000;

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator?.standalone === true
  );
}

function dismissedUntil() {
  try {
    const v = Number(localStorage.getItem(DISMISS_KEY));
    return isFinite(v) ? v : 0;
  } catch { return 0; }
}

function dismissNow() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
  } catch { /* private mode — best effort */ }
}

export default function NotificationPrompt({ athleteId }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isStandalone() || !pushSupported()) return;
    if (Notification.permission !== 'default') return; // already granted or denied
    if (Date.now() < dismissedUntil()) return;

    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const handleEnable = async () => {
    setBusy(true);
    const result = await subscribeToPush(athleteId);
    setBusy(false);
    setVisible(false);
    if (result !== 'granted') dismissNow(); // denied/error — don't nag again soon
  };

  const handleNotNow = () => {
    dismissNow();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Enable notifications"
      className="fixed left-0 right-0 z-[100] flex justify-center px-3"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', pointerEvents: 'none' }}
    >
      <div
        className="w-full max-w-md rounded-2xl px-4 py-3 flex items-start gap-3 shadow-2xl"
        style={{
          backgroundColor: '#1C1C1C',
          color: '#fff',
          border: '1px solid rgba(165,141,105,0.4)',
          pointerEvents: 'auto',
        }}
      >
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(165,141,105,0.18)' }}
        >
          <Bell size={16} style={{ color: '#A58D69' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Turn on notifications</p>
          <p className="text-[12px] mt-1" style={{ color: '#cbd5e1' }}>
            Get a reminder if your wellness check-in is outstanding, and your weekly reflection prompt.
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleEnable}
              disabled={busy}
              className="px-3 py-1.5 text-xs font-semibold rounded transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#A58D69', color: '#1C1C1C' }}
            >
              {busy ? 'Enabling…' : 'Enable'}
            </button>
            <button
              onClick={handleNotNow}
              disabled={busy}
              className="px-3 py-1.5 text-xs font-medium rounded transition-colors hover:bg-white/10"
              style={{ color: '#cbd5e1' }}
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={handleNotNow}
          aria-label="Dismiss"
          className="shrink-0 p-1.5 rounded transition-colors hover:bg-white/10"
          style={{ color: '#9ca3af' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
