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
    //   • injectManifest (not generateSW) — needed so src/sw.js can add
    //     custom push / notificationclick handlers for Web Push. The
    //     precaching and NetworkOnly-for-Supabase rules moved into that
    //     file; this config only tells the plugin where to find it.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'favicon.svg', 'manifest.json', 'manifest-athlete.json'],
      manifest: false,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ],
});
