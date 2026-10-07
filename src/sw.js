import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';

// Precache the build output — injected at build time by vite-plugin-pwa.
precacheAndRoute(self.__WB_MANIFEST);

// Bypass cache for ALL Supabase calls (REST, Storage, Auth, Realtime) and
// our own /api/ routes — athletes must always see fresh data, and the
// per-token manifest endpoint would defeat its own purpose if cached.
// Mirrors the runtimeCaching rules from the previous generateSW config.
registerRoute(
  ({ url }) => /^[a-z0-9]+\.supabase\.(co|in)$/.test(url.hostname),
  new NetworkOnly()
);
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly()
);

// SPA fallback for navigations (coach app → coach.html, the shell that installs
// as a full-screen app on iPhone; athlete / wellness / family routes are denied below) — same denylist as the previous config.
// Athlete-app + wellness routes hit Supabase/session checks immediately
// on load; let them go to the network rather than serving a (possibly
// stale) cached SPA shell.
//
// /^\/athlete(\/|$)/ — NOT just /^\/athlete\// — matters here: the bare
// /athlete route (no trailing slash, no token) is the stable PIN-login
// entry point, and missing this once meant a stale cached shell could
// serve an OLD build that predates that route, falling through to the
// coach app's own login screen instead. Same class of bug as the two
// earlier per-athlete-URL fixes — caught because it did exactly that.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/coach.html'), {
    denylist: [/^\/api\//, /^\/athlete(\/|$)/, /^\/wellness\//, /^\/family\//],
  })
);

// ── Push notifications ──────────────────────────────────────────────────
// Every push MUST show a notification (iOS revokes permission otherwise).
// `tag` groups a chat's messages into one entry that updates in place; renotify
// still buzzes the phone for each new message.
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'ProPath', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'ProPath';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: payload.url || '/' },
  };
  if (payload.tag) { options.tag = payload.tag; options.renotify = true; }

  event.waitUntil(self.registration.showNotification(title, options));
});

// Tapping a notification brings the app to the front AND opens the right place
// (the chat that sent it). An already-open window is navigated to the target
// URL instead of being left on whatever screen it was showing.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = clientList.find(c => 'focus' in c);
    if (existing) {
      try { await existing.focus(); } catch (_) { /* fall through */ }
      if ('navigate' in existing && existing.url !== targetUrl) {
        try { await existing.navigate(targetUrl); } catch (_) { /* some browsers refuse — the app is still in front */ }
      }
      return;
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});

// registerType: 'autoUpdate' — activate a new SW version immediately
// instead of waiting for all tabs to close. skipWaiting() alone only
// makes the new SW become "active"; without clientsClaim() it still
// wouldn't take control of an already-open tab until that tab's next
// hard reload, leaving a window where an old SW (with old routing
// rules) keeps serving already-open athlete-app tabs.
self.skipWaiting();
clientsClaim();
