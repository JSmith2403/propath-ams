import { useEffect, useState } from 'react';
import { Share, X, Download } from 'lucide-react';

/**
 * Custom install banner.
 *
 * • Android (Chrome / Edge): listens for `beforeinstallprompt`, captures
 *   the deferred event, and shows a banner with an "Install" button that
 *   calls `prompt()` on the captured event.
 *
 * • iOS Safari: no programmatic install API exists. We detect iOS Safari
 *   in non-standalone mode and show an instruction banner pointing the
 *   user at the share-sheet → "Add to Home Screen" flow.
 *
 * Hidden when:
 *   • app already running standalone (`display-mode: standalone` on
 *     Android, `navigator.standalone` on iOS)
 *   • the user dismissed within the last 7 days
 *   • the install was just completed (`appinstalled` event)
 *   • Android's `beforeinstallprompt` hasn't fired yet (browser refused
 *     to install — usually because criteria aren't met or it already is
 *     installed)
 *
 * Mount this once inside any authenticated tree — never on the public
 * login screen.
 */

const DISMISS_KEY = 'propath_install_dismissed_until';
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 10_000;

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator?.standalone === true
  );
}

function isIOS() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  // iPadOS 13+ reports as "Macintosh" with touch — guard with maxTouchPoints.
  const looksLikeIOS = /iPhone|iPad|iPod/.test(ua)
    || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  // Exclude in-app browsers where install isn't possible.
  const inAppBrowser = /FBAN|FBAV|Instagram|Line\/|Twitter|GSA\//.test(ua);
  return looksLikeIOS && !inAppBrowser;
}

function dismissedUntil() {
  try {
    const v = Number(localStorage.getItem(DISMISS_KEY));
    return isFinite(v) ? v : 0;
  } catch (_) { return 0; }
}

function dismissNow() {
  try {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
  } catch (_) { /* private mode etc — best effort */ }
}

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent]  = useState(null);
  const [visible,       setVisible]        = useState(false);
  const [variant,       setVariant]        = useState(null); // 'android' | 'ios'

  useEffect(() => {
    if (isStandalone()) return;
    if (Date.now() < dismissedUntil()) return;

    // ── Android: capture and show after delay ───────────────────────────
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredEvent(e);
      const t = setTimeout(() => {
        setVariant('android');
        setVisible(true);
      }, SHOW_DELAY_MS);
      return () => clearTimeout(t);
    };

    // ── Hide forever once installed ─────────────────────────────────────
    const onAppInstalled = () => {
      setVisible(false);
      setDeferredEvent(null);
      dismissNow();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled',         onAppInstalled);

    // ── iOS: no event — schedule the instruction banner directly ────────
    let iosTimer;
    if (isIOS()) {
      iosTimer = setTimeout(() => {
        setVariant('ios');
        setVisible(true);
      }, SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled',         onAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  if (!visible) return null;

  const handleInstall = async () => {
    if (!deferredEvent) return;
    deferredEvent.prompt();
    try {
      const { outcome } = await deferredEvent.userChoice;
      if (outcome !== 'accepted') dismissNow();
    } catch (_) { /* user closed prompt — treat as dismiss */ dismissNow(); }
    setDeferredEvent(null);
    setVisible(false);
  };

  const handleNotNow = () => {
    dismissNow();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Install ProPath"
      className="fixed left-0 right-0 z-[100] flex justify-center px-3"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        pointerEvents: 'none',
      }}
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
          {variant === 'ios'
            ? <Share size={16} style={{ color: '#A58D69' }} />
            : <Download size={16} style={{ color: '#A58D69' }} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {variant === 'ios' ? 'Install ProPath' : 'Install ProPath for a full-screen experience'}
          </p>
          <p className="text-[12px] mt-1" style={{ color: '#cbd5e1' }}>
            {variant === 'ios'
              ? 'Tap the share icon in Safari, then "Add to Home Screen".'
              : 'One-tap install. Always-on link from your home screen.'}
          </p>

          {variant === 'android' && (
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 text-xs font-semibold rounded transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#A58D69', color: '#1C1C1C' }}
              >
                Install
              </button>
              <button
                onClick={handleNotNow}
                className="px-3 py-1.5 text-xs font-medium rounded transition-colors hover:bg-white/10"
                style={{ color: '#cbd5e1' }}
              >
                Not now
              </button>
            </div>
          )}
          {variant === 'ios' && (
            <div className="mt-2.5">
              <button
                onClick={handleNotNow}
                className="px-3 py-1.5 text-xs font-medium rounded transition-colors hover:bg-white/10"
                style={{ color: '#cbd5e1' }}
              >
                Got it
              </button>
            </div>
          )}
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
