/**
 * Puts an unread count on the installed app's home-screen icon (the Badging
 * API: iPhone 16.4+ for installed apps with notifications allowed, Android
 * Chrome, desktop installed PWAs). Silently does nothing where unsupported.
 */
export function setAppBadgeCount(count) {
  try {
    if (typeof navigator === 'undefined') return;
    if (count > 0 && 'setAppBadge' in navigator) {
      navigator.setAppBadge(count).catch(() => {});
    } else if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  } catch (_) { /* best effort */ }
}
