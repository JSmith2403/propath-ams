// Vercel serverless function — returns a per-athlete-token PWA manifest.
//
// The shipped /manifest.json has start_url "/", so an athlete who taps
// Add to Home Screen on /athlete/:token would otherwise install the
// AMS root (coach login). This endpoint returns a manifest whose
// start_url is the athlete's actual token URL, so iOS / Android
// capture the right launch URL at install time.
//
// URL: /api/manifest/<token>
// Returned as application/manifest+json with no-store cache so the
// home-screen install always pulls fresh.

export default function handler(req, res) {
  const { token } = req.query;
  // Tokens we generate are URL-safe; reject anything weird so the
  // start_url can't be poisoned by a malformed request.
  const safe = typeof token === 'string' && /^[A-Za-z0-9_-]{8,}$/.test(token);
  if (!safe) {
    res.status(400).json({ error: 'invalid token' });
    return;
  }

  const manifest = {
    name: 'ProPath',
    short_name: 'ProPath',
    description: 'ProPath Academy athlete app',
    start_url: `/athlete/${token}`,
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#1C1C1C',
    theme_color: '#1C1C1C',
    scope: '/',
    categories: ['health', 'fitness', 'sports'],
    icons: [
      { src: '/icons/icon-192.png',          sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.status(200).send(JSON.stringify(manifest));
}
