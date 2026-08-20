import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

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

// SPA fallback for navigations — same denylist as the previous config.
// Athlete-app + wellness routes hit Supabase auth checks immediately on
// load; let them go to the network rather than serving the SPA shell.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api\//, /^\/athlete\//, /^\/wellness\//],
  })
);

// ── Push notifications ──────────────────────────────────────────────────
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

  event.waitUntil(self.registration.showNotification(title, options));
});

// Focus an already-open tab on the target URL if one exists, otherwise
// open a new one. Covers both the coach app and the athlete PWA.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

// registerType: 'autoUpdate' — activate a new SW version immediately
// instead of waiting for all tabs to close.
self.skipWaiting();
