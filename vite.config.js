import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // PWA / service worker.
    //   • manifest: false  → we ship our own /manifest.json (referenced by
    //     index.html). The plugin only registers the SW and caches the
    //     app shell.
    //   • Supabase requests are NetworkOnly — athletes must always see
    //     fresh data; never serve stale auth or profile rows from cache.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'favicon.svg', 'manifest.json'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
        // Athlete-app + wellness routes hit Supabase auth checks immediately
        // on load; let them go to the network rather than serving the SPA shell.
        navigateFallbackDenylist: [/^\/api\//, /^\/athlete\//, /^\/wellness\//],
        runtimeCaching: [
          {
            // Bypass cache for ALL Supabase calls — REST, Storage, Auth, Realtime.
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.(co|in)\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
});
