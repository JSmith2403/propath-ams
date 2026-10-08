/**
 * Captures Chrome/Android's "install this app" event as early as possible (it
 * fires once, often before any screen that wants it has mounted) so a later
 * screen — the first-time setup guide — can offer a real Install button.
 * Imported once from main.jsx. iPhone has no such event (Add to Home Screen is a
 * manual Share-sheet step), so there this simply never fires.
 */
let deferred = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    listeners.forEach(fn => fn());
  });
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach(fn => fn()); });
}

export const getInstallEvent = () => deferred;

export function subscribeInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
