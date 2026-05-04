# ProPath AMS — Set up PWA install (icons + manifest + install prompt)

Configure the AMS as a Progressive Web App so users (admins,
co_admins, athletes) can install it on their phone home screens
via "Add to Home Screen" on iOS or the install prompt on Android.

## CONTEXT

- Repo: C:\Users\jonah\Desktop\propath-ams
- React + Vite + Supabase project, deployed via Vercel
- Production branch: master
- Push directly to master once tested locally — no separate feature
  branch needed (no athletes have been sent the install link yet,
  so the change is non-disruptive)

## STARTING ASSETS

Two source PNG files are already in the repo root:

1. `propath-icon-1024.png` — 1024×1024, dark gray squircle background
   (#1C1C1C) with white ProPath logo. Use for iOS and browser
   favicons.
2. `propath-icon-maskable-1024.png` — 1024×1024, solid dark gray
   filling the entire canvas, white logo at 50% scale. Use for
   Android adaptive icons.

If either file is missing, STOP and report. Do not proceed without
both source files.

## DELIVERABLES

### 1. Web App Manifest (public/manifest.json)

Create with these settings:
- name: "ProPath"
- short_name: "ProPath"
- description: "ProPath Academy athlete app"
- start_url: "/"
- display: "standalone"
- orientation: "portrait-primary"
- background_color: "#1C1C1C"
- theme_color: "#1C1C1C"
- scope: "/"
- icons array (see step 2)
- categories: ["health", "fitness", "sports"]

### 2. Generate icon sizes

Use sharp or vite-plugin-pwa's asset generator.

From `propath-icon-1024.png`:
- 192×192, 512×512, 180×180 (iOS), 167×167 (iPad), 152×152 (iPad
  Pro), 32×32, 16×16

From `propath-icon-maskable-1024.png`:
- 192×192 maskable, 512×512 maskable

Output to `public/icons/`.

In the manifest, each icon entry includes src, sizes, type:
"image/png", and purpose: "any" (standard) or "maskable" (the two
maskable variants).

### 3. Update index.html

Inside `<head>`:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1C1C1C" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="ProPath" />
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
```

Verify the existing viewport meta tag includes
`viewport-fit=cover`. Add it if missing.

### 4. Service worker via vite-plugin-pwa

Install: `npm install -D vite-plugin-pwa`

Configure in vite.config.ts:

```ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'favicon.ico'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
```

CRITICAL: do NOT cache Supabase API responses. Athletes need live
data on every request. Only cache the app shell.

### 5. Custom install prompt

Build a small banner component shown at the bottom of the screen.

#### Android (Chrome supports beforeinstallprompt)
- Listen for `beforeinstallprompt` event in App
- Capture and prevent default
- After 10 seconds OR after first user action (login, page load,
  whichever is simpler), show banner: "Install ProPath for a
  full-screen experience"
- Buttons: "Install" (calls captured prompt) and "Not now"
  (dismisses for 7 days via localStorage flag)
- Once installed, hide forever

#### iOS (no programmatic install API)
- Detect iOS Safari (user agent + non-standalone mode check)
- Show different banner: "Install ProPath: tap the share icon then
  'Add to Home Screen'" with a small share-icon glyph
- Same dismiss behaviour as Android

#### When NOT to show the banner
- App running in standalone mode (window.matchMedia
  '(display-mode: standalone)' OR navigator.standalone on iOS)
- User dismissed within last 7 days
- User not yet logged in (don't promote install on the login screen)

Place the component in the layout once, not in every screen.

### 6. Theme handling for standalone mode

When running standalone:
- Status bar matches dark gray theme
- Full screen including safe areas (use env(safe-area-inset-top)
  and env(safe-area-inset-bottom) on layout containers)
- No white flash on launch — verify body and root component
  background colours are #1C1C1C from the start

### 7. Testing checklist

In Chrome DevTools:
- [ ] Application tab → Manifest: shows ProPath, all icons,
      theme colour
- [ ] Application tab → Service Workers: registered and active
- [ ] Lighthouse PWA audit: passes (or only fails items requiring
      a real device)

On real iPhone (Safari):
- [ ] Visit URL
- [ ] Share button → "Add to Home Screen"
- [ ] Dialog shows "ProPath" + dark squircle icon
- [ ] Installed icon opens fullscreen, no Safari UI
- [ ] No white flash on launch

On real Android (Chrome):
- [ ] Visit URL
- [ ] After 10 seconds, custom install banner appears
- [ ] "Install" opens native install dialog
- [ ] Dialog shows ProPath + dark icon
- [ ] Installed app appears in app drawer and home screen
- [ ] Opens fullscreen with dark theme

## ACCEPTANCE CRITERIA

Done when:
1. `public/manifest.json` exists with correct fields
2. All required icon sizes generated and present in `public/icons/`
3. `index.html` has manifest link, iOS meta tags, theme-color,
   apple-touch-icons
4. Service worker registers without errors and caches app shell only
   (Supabase calls bypass cache)
5. Custom install banner works on Android with correct timing and
   dismissal
6. iOS install instruction banner shows when relevant
7. Banner respects 7-day dismissal and standalone-mode hiding
8. Lighthouse PWA audit passes
9. App opens fullscreen with dark theme when installed
10. No regression to existing AMS functionality

## BEFORE PUSHING

1. Show me the manifest.json
2. Confirm all icon sizes generated
3. Demonstrate the install banner running on localhost (Chrome
   DevTools mobile emulation for Android, Safari with iOS user
   agent for the iOS variant)
4. Confirm Lighthouse PWA score
5. Walk me through what changed in vite.config.ts and index.html

After my approval, push to master. Vercel will deploy. I'll test
the install flow on my phone using the production URL.
