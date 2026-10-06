import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

// In production Vercel rewrites /athlete → /athlete.html (vercel.json). The
// dev server has no such rewrite, so mirror it here — otherwise /athlete in
// dev would serve index.html and the athlete install metadata would differ
// from what ships.
const athleteHtmlDevRewrite = () => ({
  name: 'athlete-html-dev-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = (req.url || '').split('?')[0];
      if (path === '/athlete') req.url = '/athlete.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
      next();
    });
  },
});

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        athlete: resolve(__dirname, 'athlete.html'),
      },
    },
  },
  plugins: [
    athleteHtmlDevRewrite(),
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
